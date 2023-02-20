package store

import (
	"log"
)

// InitStore : init every store
func InitStore() {
	go startChatStore()
	go startGameStore()
	log.Println("[INIT] store")
}
