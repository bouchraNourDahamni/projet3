package game

import (
	"server/models"
	"server/repositories"
	"server/services/store"
	"time"
)

const nPersonnalities = 4

var personnalities = [nPersonnalities]models.Personnality{models.COCKY, models.FRIENDLY, models.SHY, models.EUPHORIC}

func handleVirtualPlayerStrokes(gameID uint64, strokeBroadcastFrequency int, cpuMustStop *bool) {
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	intFreq := int(time.Second) / (defaultFrequency * strokeBroadcastFrequency)
	for _, element := range game.Info.WordToGuess.Strokes {
		<-time.After(time.Duration(intFreq))
		game.Strokes <- element
		if *cpuMustStop {
			return
		}
	}
}

func getCPUDrawingFrequency(gameID uint64) int {
	game, _, _ := store.GetGame(gameID)
	var strokeBroadcastFrequency = 1
	if len(game.Info.WordToGuess.Strokes) > maxStrokes {
		strokeBroadcastFrequency = len(game.Info.WordToGuess.Strokes) / maxStrokes
	}
	return strokeBroadcastFrequency
}

func sendCPUMessage(chatID uint64, purpose models.Purpose, vPlayer *models.Player) {
	chat, _, _ := store.GetChat(chatID)
	text := repositories.GetVPlayerMessage(purpose, vPlayer.Personnality)
	message := models.Message{Email: vPlayer.Profile.Email, Username: vPlayer.Profile.Email, Message: text, SendDate: time.Now()}
	chat.Broadcast <- message
}
