package chat

import (
	"encoding/json"
	"log"
	"net/http"
	"server/models"
	"server/repositories"
	"server/services/store"
	"time"

	"github.com/gorilla/websocket"
)

// HandleNewChat : Create a new chat channel dynamically
func HandleNewChat(res http.ResponseWriter, req *http.Request) {
	var newChatInfo models.NewChatInfo
	json.NewDecoder(req.Body).Decode(&newChatInfo)

	chatID := MakeChatChannel(newChatInfo, HandleMessages)

	if err := addChatToDB(chatID); err != nil {
		http.Error(res, err.Error(), http.StatusBadRequest)
		log.Println("[ERROR][CHAT] can't add chat to db:", err)
	}
	for _, member := range newChatInfo.Members {
		repositories.UpdateProfileChat(member, chatID)
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(chatID)
}

func addChatToDB(chatID uint64) error {
	chat, _, _ := store.GetChat(chatID)
	if _, err := repositories.CreateChat(chat); err != nil {
		return err
	}
	if _, err := repositories.UpdateAddChatToState(chatID); err != nil {
		return err
	}
	return nil
}

// MakeChatChannel : Creates a new channel clients can connect to to send and receive messages
func MakeChatChannel(newChatInfo models.NewChatInfo, handlers ...func(uint64)) uint64 {
	chatID := <-idCounterChat
	chat := models.ChatChannel{
		Clients:   make(map[*websocket.Conn]bool), // connected clients
		Broadcast: make(chan models.Message),      // broadcast channel
		ChatInfo: models.ChatInfo{
			ID:        chatID,
			Name:      newChatInfo.Name,
			StartDate: time.Now(),
			State:     models.ALIVE,
			History:   make([]models.Message, 0),
			Members:   newChatInfo.Members,
		},
	}
	store.InserChat(chatID, chat)
	for _, handler := range handlers {
		go handler(chatID)
	}
	return chatID
}

// HandleAddNewMember : add a new member to the chat
func HandleAddNewMember(res http.ResponseWriter, req *http.Request) {
	var newMember struct {
		Email  string `json:"email"`
		ChatID uint64 `json:"chatID"`
	}
	json.NewDecoder(req.Body).Decode(&newMember)

	if !canAddNewUser(newMember.Email, newMember.ChatID, res) {
		return
	}

	addNewMember(newMember.Email, newMember.ChatID)
}

func canAddNewUser(email string, chatID uint64, res http.ResponseWriter) bool {
	chat, exist, _ := store.GetChat(chatID)
	if !exist {
		http.Error(res, "Le chat n'existe pas", http.StatusBadRequest)
		return false
	}
	if contains(chat.ChatInfo.Members, email) {
		http.Error(res, "L'utilisateur est déjà membre du chat", http.StatusConflict)
		return false
	}
	return true
}

func contains(members []string, user string) bool {
	for _, member := range members {
		if member == user {
			return true
		}
	}
	return false
}

func addNewMember(email string, chatID uint64) {
	store.ApplyChat(chatID, func(chat models.ChatChannel) models.ChatChannel {
		chat.ChatInfo.Members = append(chat.ChatInfo.Members, email)
		return chat
	})
	repositories.UpdateMemberList(chatID, email)
	repositories.UpdateProfileChat(email, chatID)
}

// RenameChat : change the name of the chat
func RenameChat(res http.ResponseWriter, req *http.Request) {
	var chatRename struct {
		Name   string `json:"name"`
		ChatID uint64 `json:"chatID"`
	}
	json.NewDecoder(req.Body).Decode(&chatRename)

	store.ApplyChat(chatRename.ChatID, func(chat models.ChatChannel) models.ChatChannel {
		chat.ChatInfo.Name = chatRename.Name
		return chat
	})

	repositories.UpdateChatName(chatRename.ChatID, chatRename.Name)
}
