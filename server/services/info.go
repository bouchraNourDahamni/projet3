package services

import (
	"encoding/json"
	"log"
	"net/http"
	"runtime/debug"
	"server/models"
	"server/repositories"
	"server/services/converter"
	"server/services/session"
	"server/services/store"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetUserInfo : Retrieves a user's informations
func GetUserInfo(res http.ResponseWriter, req *http.Request) {
	userEmail := mux.Vars(req)["email"]
	registeredUser, err := repositories.ReadProfile(userEmail)

	if err != nil {
		http.Error(res, "L'utilisateur est introuvable", http.StatusInternalServerError)
		log.Println("[WARN] can't find: ", userEmail)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(registeredUser)
}

// ChatSession : give the server chat channels info
func ChatSession(res http.ResponseWriter, req *http.Request) {
	channels := store.GetChannels()
	chatInfo := make([]models.ChatInfo, len(channels))
	i := 0
	for _, chatroom := range channels {
		chatInfo[i] = chatroom.ChatInfo
		i++
	}
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(chatInfo)
}

// GetSpecificChatSession : gives the chat info of a specific chat given its ID
func GetSpecificChatSession(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["chatID"]
	chatID, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "ID mal écrit", http.StatusBadRequest)
		return
	}

	chat, exist, _ := store.GetChat(chatID)
	if !exist {
		http.Error(res, "Ce chat n'existe pas", http.StatusBadRequest)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(chat.ChatInfo)
}

// GameSessionInfo : give the game channels info
func GameSessionInfo(res http.ResponseWriter, req *http.Request) {
	defer logPanic()
	gameChannels := store.GetGameChannels()
	gameInfo := make([]models.GameInfo, len(gameChannels))
	i := 0
	for _, game := range gameChannels {
		gameInfo[i] = game.Info
		i++
	}
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(gameInfo)
}

// GetSpecificGameSession : gives the info of a specific game given its ID
func GetSpecificGameSession(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["gameID"]
	gameID, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "ID mal écrit", http.StatusBadRequest)
		return
	}

	game, exist, _ := store.GetGame(gameID)
	if !exist {
		http.Error(res, "Cette partie n'existe pas", http.StatusBadRequest)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(game.Info)
}

// GetSessionInfo : return who is connected
func GetSessionInfo(res http.ResponseWriter, req *http.Request) {
	keys := make([]string, 0, len(session.Connections))
	for k := range session.Connections {
		keys = append(keys, k)
	}
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(keys)
}

func logPanic() {
	if err := recover(); err != nil {
		log.Println("[PANIC]", err)
		debug.PrintStack()
	}
}

// GetGameTrace : return the entire info history of a specific game
func GetGameTrace(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	strID := mux.Vars(req)["gameID"]
	gameID, _ := converter.GetID(strID)
	result := make(map[uint64]models.GameInfo)
	for key, game := range store.GetGameTrace()[gameID] {
		result[key] = game.Info
	}
	json.NewEncoder(res).Encode(result)
}

func findActiveChats(registeredUser models.Profile) map[uint64]string {
	channels := store.GetChannels()
	activeChannel := make(map[uint64]string)
	for _, chatID := range registeredUser.History.ChatChannels {
		if chat, exist := channels[chatID]; exist {
			activeChannel[chatID] = chat.ChatInfo.Name
		}
	}
	return activeChannel
}

// GetUserChat : get every chat the user can join
func GetUserChat(res http.ResponseWriter, req *http.Request) {
	userEmail := mux.Vars(req)["email"]

	registeredUser, err := repositories.GetProfile(userEmail)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(res, "L'utilisateur est introuvable", http.StatusInternalServerError)
			log.Println("[WARN] can't find: ", userEmail)
			return
		}
		log.Println("[WARN]", err)
	}

	userChats := make(map[uint64]string)
	for _, chatID := range registeredUser.History.ChatChannels {
		if chat, err := repositories.ReadChat(chatID); err == nil {
			userChats[chatID] = chat.Name
		}
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(userChats)
}
