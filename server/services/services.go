package services

import (
	"encoding/json"
	"hash/fnv"
	"log"
	"net/http"
	"os/exec"
	"server/models"
	"server/repositories"
	"server/services/chat"
	"server/services/game"
	"server/services/profanity"
	"server/services/session"

	"go.mongodb.org/mongo-driver/mongo"

	"strconv"
)

// PUBLIC

// InitServices : initialize every service
func InitServices() {
	initState, err := repositories.GetCurrentState()
	if err != nil {
		log.Println("[ERROR][INIT]", err)
		initState = models.Server{
			StartChatID: 0,
			StartGameID: 0,
			Chats:       make([]uint64, 0),
		}
		log.Println("[RECOVER] startID is 0")
	}
	chat.InitChatService(initState.StartChatID, initState.Chats)
	game.InitGameService()
}

// HandleLogin : Performs login attempts validation
func HandleLogin(res http.ResponseWriter, req *http.Request) {
	var user models.Login
	json.NewDecoder(req.Body).Decode(&user)
	user.Password = hash(user.Password)

	registeredUser, err := repositories.GetProfile(user.Email)
	log.Println("[ERROR][LOGIN]", err)

	if err == mongo.ErrNoDocuments || registeredUser.Private.Password != user.Password {
		http.Error(res, "Le mot de passe ou l'identifiant est incorrect.", http.StatusUnauthorized)
		return
	}
	if session.IsUserConnected(user.Email) {
		http.Error(res, "Le compte est déjà connecté", http.StatusUnauthorized)
		return
	}
	// else 200
}

// HandleRegister : Performs register attempts validation
func HandleRegister(res http.ResponseWriter, req *http.Request) {
	// Read request
	var user models.Register
	json.NewDecoder(req.Body).Decode(&user)
	user.Password = hash(user.Password)

	if !isChristian(user) {
		http.Error(res, "Le courriel ou le pseudonyme est trop vulgaire", http.StatusConflict)
		return
	}
	if !isUserUnique(user.Email, user.Pseudo) {
		http.Error(res, "Le courriel ou le pseudonyme n'est pas unique", http.StatusConflict)
		return
	}
	// Push to DB
	insertResult, err := repositories.CreateProfile(user)
	if err != nil {
		http.Error(res, "Nous ne pouvons pas vous enregistrer pour le moment.", http.StatusServiceUnavailable)
		log.Println("[ERROR][REGISTER]: ", err)
		return
	}

	log.Println("[CONNECTION]", insertResult)
	json.NewEncoder(res).Encode(insertResult)
}

// HandleNewPair : transfers received pair to repository as a pair object
func HandleNewPair(res http.ResponseWriter, req *http.Request) {
	var pair models.Pair
	json.NewDecoder(req.Body).Decode(&pair)

	if isVulgar(pair) {
		http.Error(res, "Un des mots est trop vulgaire", http.StatusBadRequest)
		return
	}
	repositories.InsertPair(pair)
}

// PRIVATE

func isUserUnique(email string, username string) bool {
	return !(repositories.IncludesEmail(email) || repositories.IncludesUsername(email))
}

func isChristian(user models.Register) bool {
	return !(profanity.IsInappropriate(user.Email) ||
		profanity.IsInappropriate(user.Pseudo) ||
		profanity.IsInappropriate(user.FirstName) ||
		profanity.IsInappropriate(user.LastName))
}

func hash(secret string) string {
	hash := fnv.New64a()
	hash.Write([]byte(secret))
	BASE := 10
	return strconv.FormatUint(hash.Sum64(), BASE)
}

func isVulgar(pair models.Pair) (isVulgar bool) {
	isVulgar = profanity.IsInappropriate(pair.Word)
	log.Println(pair.Word, isVulgar)
	for _, word := range pair.Hints {
		isVulgar = isVulgar || profanity.IsInappropriate(word)
		log.Println(word, isVulgar)
	}
	return
}

func GetAvatars(res http.ResponseWriter, req *http.Request) {
	log.Println("HERE")
	files, err := exec.Command("ls", "./static/avatar").Output()
	if err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
		return
	}
	res.Write(files)
}
