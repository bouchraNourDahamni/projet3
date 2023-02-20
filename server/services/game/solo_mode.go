package game

import (
	"log"
	"math/rand"
	"server/models"
	"server/services/store"
	"server/services/timer"
	"time"
)

func handleSoloGame(gameID uint64, pairList map[int]models.Pair) {
	defer logPanic(gameID)
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)
	rand.Seed(time.Now().UnixNano())
	vPlayer := &models.Player{
		Profile:      models.Profile{Email: "Gopher"},
		IsVirtual:    true,
		Personnality: personnalities[rand.Intn(len(personnalities))],
	}
	sendCPUMessage(game.Info.ChatID, models.GREET, vPlayer)
	var cpuMustStopDrawing = new(bool)
	// Using time.Now() -> must be set at game start, not in waiting room
	setTimer(gameID)
	for {
		*cpuMustStopDrawing = false
		handleSoloStartTurn(gameID, &pairList, cpuMustStopDrawing)
		if handleSoloEndRound(gameID, cpuMustStopDrawing, vPlayer) {
			handleEndGame(gameID)
			return
		}
		<-time.After(time.Second)
	}
}

func handleSoloStartTurn(gameID uint64, pairList *map[int]models.Pair, cpuMustStopDrawing *bool) {
	_, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	setWordToGuess(gameID, pairList)
	resetAttempts(gameID)

	notifyClients(gameID, models.StartTurn)
	log.Println(models.StartTurn)

	go handleVirtualPlayerStrokes(gameID, getCPUDrawingFrequency(gameID), cpuMustStopDrawing)
}

func handleSoloEndRound(gameID uint64, cpuMustStopDrawing *bool, vPlayer *models.Player) bool {
	_, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	if isGuessingSoloRight(gameID) {
		store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
			game.Info.Solo.Timer.End = game.Info.Solo.Timer.End.Add(getBonusTime(game.Info.Difficulty))
			game.Info.Solo.Score++
			return game
		})
		handleCorrectAnswer(gameID, vPlayer)
	}
	*cpuMustStopDrawing = true
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)
	if game.Info.Solo.Timer.TimeRemaining() <= 0 {
		notifyClients(gameID, models.EndGame)
		log.Println(models.EndGame)
		return true
	}
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.TurnCounter++
		return game
	})
	notifyClients(gameID, models.EndTurn)
	log.Println(models.EndTurn)
	return false
}

func isGuessingSoloRight(gameID uint64) bool {
	for {
		game, exist, _ := store.GetGame(gameID)
		checkGameExistance(exist)
		select {
		case result := <-game.EndTurn:
			log.Println("[GAME] Result:", result, " Game: ", gameID)
			if !result {
				store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
					game.Info.Solo.Attempts--
					return game
				})
				handleWrongAnswer(gameID)
				game, _, _ := store.GetGame(gameID)
				if game.Info.Solo.Attempts > 0 {
					continue
				}
			}
			return result
		case <-time.After(game.Info.Solo.Timer.TimeRemaining()):
			log.Println("[GAME] Times up!", gameID)
			return false
		}
	}
}

func resetAttempts(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.Solo.Attempts = getAttempts(game.Info.Difficulty)
		return game
	})
}

func setTimer(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.Solo.Timer = timer.NewSecondsTimer(getInitialTime(game.Info.Difficulty))
		return game
	})
}
