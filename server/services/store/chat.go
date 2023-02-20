package store

import (
	"server/models"
)

// ChatReducer :chat -> chat'
type ChatReducer func(chat models.ChatChannel) models.ChatChannel
type transaction struct {
	ID      uint64
	Reducer ChatReducer
}

// ChannelReducer : channels -> channels'
type ChannelReducer func(map[uint64]models.ChatChannel) map[uint64]models.ChatChannel
type channelTransaction struct {
	ID      uint64
	Reducer ChannelReducer
}

var (
	pushChatStore = make(chan transaction)
	pushChannels  = make(chan channelTransaction)
	pullChatStore = make(chan map[uint64]models.ChatChannel)
	chatVersion   uint64
)

func startChatStore() {
	chatState := make(map[uint64]models.ChatChannel)
	chatVersion = 0
	for {
		select {
		case pullChatStore <- chatState:
		case transaction := <-pushChatStore:
			chatID := transaction.ID
			chatState[chatID] = transaction.Reducer(chatState[chatID])
			chatVersion++
			// log.Printf("[STORE] v%d -> v%d; chat %d", chatVersion-1, chatVersion, transaction.ID)
		case transaction := <-pushChannels:
			chatState = transaction.Reducer(chatState)
			chatVersion++
			// log.Printf("[STORE] v%d -> v%d; chat %d", chatVersion-1, chatVersion, transaction.ID)
		}
	}
}

// ApplyChat : Apply reducer to chat (Concurency safe)
func ApplyChat(id uint64, fn ChatReducer) {
	pushChatStore <- transaction{
		ID:      id,
		Reducer: fn,
	}
}

// applyChatChannel : Apply reducer to chat (Concurency safe)
func applyChatChannel(id uint64, fn ChannelReducer) {
	pushChannels <- channelTransaction{
		ID:      id,
		Reducer: fn,
	}
}

// InserChat : insert a new chat in the store
func InserChat(chatID uint64, chat models.ChatChannel) {
	applyChatChannel(chatID, func(chatChannels map[uint64]models.ChatChannel) map[uint64]models.ChatChannel {
		chatChannels[chatID] = chat
		return chatChannels
	})
}

// DeleteChat : delete a chat in the store
func DeleteChat(chatID uint64) {
	applyChatChannel(chatID, func(chatChannels map[uint64]models.ChatChannel) map[uint64]models.ChatChannel {
		delete(chatChannels, chatID)
		return chatChannels
	})
}

// GetChat : return the chat up to date
func GetChat(id uint64) (models.ChatChannel, bool, uint64) {
	state := <-pullChatStore
	value, exist := state[id]
	return value, exist, chatVersion
}

// GetChannels : return every channels up to date
func GetChannels() map[uint64]models.ChatChannel {
	return <-pullChatStore
}

// IsChatUpToDate : Check if the version of the goroutine is up to date with the store
func IsChatUpToDate(version uint64) bool {
	return version == chatVersion
}
