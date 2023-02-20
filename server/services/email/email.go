package email

import (
	"fmt"
	"log"
	"net/smtp"
)

var emailAuth smtp.Auth

// SendRecoveryEmail : send to user the recovery code
func SendRecoveryEmail(email string, firstName string, lastName string, recoveryCode int) {
	if err := sendEmailSMTP(email, firstName, lastName, fmt.Sprint(recoveryCode)); err != nil {
		log.Println(err)
	}
}

func sendEmailSMTP(email string, firstName string, lastName string, recoveryCode string) error {
	emailHost := "smtp.gmail.com"
	emailFrom := "polydessin@gmail.com"
	emailPassword := "gYcEZ4CXjWsZyRa"
	emailPort := 587

	emailAuth = smtp.PlainAuth("", emailFrom, emailPassword, emailHost)

	emailBody := fmt.Sprintf("Bonjour %s %s, Voici votre code d'authentification: %s", firstName, lastName, recoveryCode)

	mime := "MIME-version: 1.0;\nContent-Type: text/plain; charset=\"UTF-8\";\n\n"
	subject := "Subject: Code de confirmation\n"
	msg := []byte(subject + mime + "\n" + emailBody)
	addr := fmt.Sprintf("%s:%s", emailHost, fmt.Sprint(emailPort))

	return smtp.SendMail(addr, emailAuth, emailFrom, []string{email}, msg)
}
