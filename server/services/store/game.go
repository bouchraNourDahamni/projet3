package store

import (
	"server/models"
)

// GameReducer : game -> game'
type GameReducer func(game models.GameChannel) models.GameChannel
type gameTransaction struct {
	ID      uint64
	Reducer GameReducer
}

// GameChannelReducer : channels -> channels'
type GameChannelReducer func(map[uint64]models.GameChannel) map[uint64]models.GameChannel
type gameChannelTransaction struct {
	ID      uint64
	Reducer GameChannelReducer
}

var (
	pushGameStore    = make(chan gameTransaction)
	pushGameChannel  = make(chan gameChannelTransaction)
	pullGameChannel  = make(chan map[uint64]models.GameChannel)
	gameVersion      uint64
	localGameVersion = make(map[uint64]uint64)                        // gameID -> version
	gameTrace        = make(map[uint64]map[uint64]models.GameChannel) // gameID -> version -> gameChannel
)

func startGameStore() {
	GameState := make(map[uint64]models.GameChannel)
	gameVersion = 0
	for {
		select {
		case pullGameChannel <- GameState:
		case transaction := <-pushGameStore:
			gameID := transaction.ID
			GameState[gameID] = transaction.Reducer(GameState[gameID])
			increaseVersion(gameID, GameState[gameID])
		case transaction := <-pushGameChannel:
			gameID := transaction.ID
			GameState = transaction.Reducer(GameState)
			increaseVersion(gameID, GameState[gameID])
		}
	}
}

func increaseVersion(gameID uint64, newState models.GameChannel) {
	gameVersion++
	localGameVersion[gameID]++
	gameTrace[gameID][localGameVersion[gameID]] = newState
}

// GetGameTrace : all the version of every game
func GetGameTrace() map[uint64]map[uint64]models.GameChannel {
	return gameTrace
}

// ApplyGame : Apply reducer to Game (Concurency safe)
func ApplyGame(id uint64, fn GameReducer) {
	pushGameStore <- gameTransaction{
		ID:      id,
		Reducer: fn,
	}
}

// ApplyGameChannel : Apply reducer to Game (Concurency safe)
func applyGameChannel(id uint64, fn GameChannelReducer) {
	pushGameChannel <- gameChannelTransaction{
		ID:      id,
		Reducer: fn,
	}
}

// InsertGame : insert a new game in the store
func InsertGame(gameID uint64, game models.GameChannel) {
	gameTrace[gameID] = make(map[uint64]models.GameChannel)
	applyGameChannel(gameID, func(gameChannels map[uint64]models.GameChannel) map[uint64]models.GameChannel {
		gameChannels[gameID] = game
		return gameChannels
	})
}

// DeleteGame : delete a game in the store
func DeleteGame(gameID uint64) {
	applyGameChannel(gameID, func(gameChannels map[uint64]models.GameChannel) map[uint64]models.GameChannel {
		delete(gameChannels, gameID)
		return gameChannels
	})
}

// GetGame : return the Game up to date
func GetGame(id uint64) (models.GameChannel, bool, uint64) {
	state := <-pullGameChannel
	value, exist := state[id]
	localVersion, _ := localGameVersion[id]
	return value, exist, localVersion
}

// GetGameChannels : return every channels up to date
func GetGameChannels() map[uint64]models.GameChannel {
	return <-pullGameChannel
}

// IsGameUpToDate : Check if the version of the goroutine is up to date with the store
func IsGameUpToDate(id uint64) bool {
	return id == gameVersion
}
