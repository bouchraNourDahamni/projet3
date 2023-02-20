package game

import (
	"log"
	"runtime/debug"
	"server/models"
	"server/services/store"
)

func handleConnectedClientStrokes(gameID uint64, email string) {
	defer recoverConnectedClient(gameID, email)
	for {
		game, _, _ := store.GetGame(gameID)
		var stroke models.Stroke
		// Read in a new stroke as JSON and map it to a Stroke object
		err := game.Clients[email].Socket.ReadJSON(&stroke)
		if err != nil {
			log.Println("[DECONNECTION] From handleConnectedClientStrokes", err)
			handleCloseGameClient(gameID, email)
			return
		}
		game.Strokes <- stroke
	}
}

func recoverConnectedClient(gameID uint64, email string) {
	if err := recover(); err != nil {
		log.Println("[PANIC] something went wrong with", email, " in ", gameID)
		debug.PrintStack()
		log.Println("\t[PANIC]", err)
		logGameRoom(gameID)
	}
}

// BroadcastStrokes : Broadcasts incoming strokes to clients connected to a same game channel
func BroadcastStrokes(id uint64) {
	defer recoverBroadcaster(id)
	game, _, _ := store.GetGame(id)
	for {
		stroke := <-game.Strokes
		if stroke.Action == "" {
			stroke.Action = models.STROKE
		}
		for _, player := range game.Clients {
			err := player.Socket.WriteJSON(stroke)
			if err != nil {
				log.Printf("[DECONNECTION] From broadcastStrokes %v", err)
				return
			}
		}
	}
}

func recoverBroadcaster(gameID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC] something went wrong with game:", gameID)
		debug.PrintStack()
		log.Println("\t[PANIC]", err)
		logGameRoom(gameID)
		// clean up logic
		if _, gameExist, _ := store.GetGame(gameID); gameExist {
			closeGame(gameID)
		}
	}
}
