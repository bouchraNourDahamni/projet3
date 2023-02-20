package trophy

import (
	"encoding/json"
	"log"
	"net/http"
	"server/models"
	"server/repositories"
	"server/services/session"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

type Trophy struct {
	Name        string
	Description string
	Condition   func(models.Profile) bool
}

const (
	ZeroEnArt = "J'AI EU ZÉRO EN ART..." // used in game.go
)

var (
	TrophiesCollection = []Trophy{
		{
			// 1
			Name:        "PREMIÈRE PARTIE!",
			Description: "L'utilisteur a gagné une partie",
			Condition:   func(user models.Profile) bool { return user.Statistics.Games > 0 },
		},
		{
			// 2
			Name:        "DEUXIÈME PARTIE",
			Description: "L'utilisteur a gagné dix parties",
			Condition:   func(user models.Profile) bool { return user.Statistics.Games > 1 },
		},
		{
			// 3
			Name:        "VÉTÉRAN!",
			Description: "L'utilisteur a jouée plus de 5 minutes",
			Condition:   func(user models.Profile) bool { return user.Statistics.TotalTime.Minutes() > float64(5*time.Minute) },
		},
		{
			// 6
			Name:        "LOUP SOLITAIRE!",
			Description: "Deviner au plus 5 dessin dans un sprint solo",
			Condition: func(user models.Profile) bool {
				size := len(user.History.GamesHistory.Solo)
				return size > 0 && user.History.GamesHistory.Solo[size-1].Result >= 5
			},
		},
		{
			// 8
			Name:        "J'AI EU ZÉRO EN ART...",
			Description: "Avoir récolté aucun point durant une partie en mode classique",
			Condition: func(user models.Profile) bool {
				return false // Handled in game.go end game
			},
		},
		{
			// 9
			Name:        "MEILLEUR QUE LA MOYENNE!",
			Description: "L'utilisateur gagne deux parties pour chaque parties qu'il perd",
			Condition:   func(user models.Profile) bool { return user.Statistics.WinRatio > 0.5 },
		},
	}
)

func TriggerUpdate(res http.ResponseWriter, req *http.Request) {
	var user struct {
		Email string `json:"email"`
	}
	json.NewDecoder(req.Body).Decode(&user)

	DetectNewtrophies(user.Email)
}

func AwardHimself(res http.ResponseWriter, req *http.Request) {
	var user struct {
		Email  string `json:"email"`
		Trophy string `json:"trophy"`
	}
	json.NewDecoder(req.Body).Decode(&user)

	Givetrophy(user.Email, user.Trophy)
}

// DetectNewtrophies : detect and award any new award
func DetectNewtrophies(email string) {
	trophies := findNewtrophy(email)
	for _, trophy := range trophies {
		log.Println("[TROPHY]", email, trophy)
		Givetrophy(email, trophy)
		<-time.After(3 * time.Second)
	}
}

// Givetrophy : give the user his trophy
func Givetrophy(email, trophy string) {
	user, err := repositories.GetProfile(email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return
		}
		log.Println("[ERROR][trophy]", err)
	}
	earnedtrophies := getEarnedtrophies(user.Trophies)
	if _, exist := earnedtrophies[trophy]; exist {
		return
	}

	if ws, exist := session.Connections[email]; exist {
		ws.WriteJSON(trophy)
	}
	_, err = repositories.UpdateProfiletrophies(email, trophy)
	if err != nil {
		log.Println("[ERROR][trophy]", err)
	}

}

func findNewtrophy(email string) (trophies []string) {
	user, err := repositories.GetProfile(email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return []string{}
		}
		log.Println("[ERROR][trophy]", err)
	}

	earnedtrophies := getEarnedtrophies(user.Trophies)

	for _, trophy := range TrophiesCollection {
		if _, exit := earnedtrophies[trophy.Name]; !exit && trophy.Condition(user) {
			trophies = append(trophies, trophy.Name)
		}
	}
	return
}

func getEarnedtrophies(trophies []string) map[string]bool {
	earnedtrophies := make(map[string]bool)
	for _, trophy := range trophies {
		earnedtrophies[trophy] = true
	}
	return earnedtrophies
}
