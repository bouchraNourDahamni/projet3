package recovery

import (
	"encoding/json"
	"hash/fnv"
	"log"
	"math"
	"math/rand"
	"net/http"
	"server/models"
	"server/repositories"
	"server/services/email"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

var recovery = make(map[string]int)

// ChangePassword : change the password of the user
func ChangePassword(res http.ResponseWriter, req *http.Request) {
	var info models.Login
	json.NewDecoder(req.Body).Decode(&info)
	info.Password = hash(info.Password)

	repositories.UpdatePassword(info)
}

// StartRecovery : create recovery code and send recovery code to user
func StartRecovery(res http.ResponseWriter, req *http.Request) {
	emailInfo := struct {
		Email string `json:"email"`
	}{}
	json.NewDecoder(req.Body).Decode(&emailInfo)
	user, err := repositories.GetProfile(emailInfo.Email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(res, "L'utilisateur n'existe pas", http.StatusBadRequest)
			return
		}
		log.Println("[ERROR][RECOVERY]", err)
	}
	recoveryCode := getRecoveryCode()
	recovery[emailInfo.Email] = recoveryCode
	email.SendRecoveryEmail(emailInfo.Email, user.Private.FirstName, user.Private.LastName, recoveryCode)
}

// ConfirmRecoveryCode : authenticate user recovery code
func ConfirmRecoveryCode(res http.ResponseWriter, req *http.Request) {
	recoveryInfo := struct {
		Email string `json:"email"`
		Code  int    `json:"code"`
	}{}
	json.NewDecoder(req.Body).Decode(&recoveryInfo)
	if recoveryInfo.Code != recovery[recoveryInfo.Email] {
		http.Error(res, "mauvais code", http.StatusUnauthorized)
	}
}

func getRecoveryCode() int {
	rand.Seed(time.Now().UnixNano())
	return rand.Int() % int(math.Pow10(6))
}

func hash(secret string) string {
	hash := fnv.New64a()
	hash.Write([]byte(secret))
	BASE := 10
	return strconv.FormatUint(hash.Sum64(), BASE)
}
