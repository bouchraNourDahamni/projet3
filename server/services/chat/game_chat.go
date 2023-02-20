package chat

import (
	"log"
	"server/models"
	"server/services/profanity"
	"server/services/store"
	"time"

	"github.com/gorilla/websocket"
)

// HandleGameMessages : handle messages and guess words
func HandleGameMessages() func(uint64) {
	return func(chatID uint64) {
		for {
			chat, _, chatVersion := store.GetChat(chatID)
			// Grab the next message from the broadcast channel
			msg, isAlive := <-chat.Broadcast
			if !isAlive {
				log.Print("[CHAT]", chatID, "is dead")
				return
			}
			msg.Message = profanity.Censor(msg.Message)

			if !store.IsChatUpToDate(chatVersion) {
				chat, _, _ = store.GetChat(chatID)
			}

			msg.SendDate = time.Now()
			recordChatHistory(msg, chatID)
			// broadcast message to every clients
			broadcastMessage(chatID, chat.Clients, msg)
		}
	}
}

func broadcastMessage(id uint64, clients map[*websocket.Conn]bool, msg models.Message) {
	for client := range clients {
		err := client.WriteJSON(msg)
		if err != nil {
			handleCloseClient(client, id)
		}
	}

}
