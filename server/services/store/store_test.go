package store

import (
	"server/models"
	"testing"
)

type testChatChannel []struct {
	Name     string
	ChatRoom ChannelReducer
	State    map[uint64]models.ChatChannel
}

func fillStore() {
	applyChatChannel(1, func(chatChannels map[uint64]models.ChatChannel) map[uint64]models.ChatChannel {
		chatChannels[1] = models.ChatChannel{}
		return chatChannels
	})
}

func TestApplyChatChannel(t *testing.T) {
	go startChatStore()
	// ADD
	defaultChat := models.ChatChannel{}

	t.Run("add channel", func(t *testing.T) {
		applyChatChannel(1, func(chatChannels map[uint64]models.ChatChannel) map[uint64]models.ChatChannel {
			chatChannels[1] = defaultChat
			return chatChannels
		})
		result := GetChannels()
		if len(result) == 0 {
			t.Error("Can't add")
		}
	})

	t.Run("delete channel", func(t *testing.T) {
		applyChatChannel(1, func(chatChannels map[uint64]models.ChatChannel) map[uint64]models.ChatChannel {
			delete(chatChannels, 1)
			return chatChannels
		})
		result := GetChannels()
		if len(result) != 0 {
			t.Error("Can't add")
		}
	})
}

func TestApplyChat(t *testing.T) {
	fillStore()

	t.Run("append once", func(t *testing.T) {
		ApplyChat(1, func(chat models.ChatChannel) models.ChatChannel {
			chat.ChatInfo.History = append(chat.ChatInfo.History, models.Message{})
			return chat
		})
		chat, _, _ := GetChat(1)
		if len(chat.ChatInfo.History) != 1 {
			t.Error("no changes")
		}
	})
	t.Run("append twice", func(t *testing.T) {
		ApplyChat(1, func(chat models.ChatChannel) models.ChatChannel {
			chat.ChatInfo.History = append(chat.ChatInfo.History, models.Message{})
			return chat
		})
		chat, _, _ := GetChat(1)
		if len(chat.ChatInfo.History) != 2 {
			t.Error("can't append")
		}
	})

}

func BenchmarkApplyChat(b *testing.B) {
	for i := 0; i < b.N; i++ {
		ApplyChat(1, func(chat models.ChatChannel) models.ChatChannel {
			chat.ChatInfo.History = append(chat.ChatInfo.History, models.Message{})
			return chat
		})
	}
}

func BenchmarkRef(b *testing.B) {
	chatState := make(map[uint64]models.ChatChannel)
	chatState[1] = models.ChatChannel{}
	for i := 0; i < b.N; i++ {
		chat := chatState[1]
		chat.ChatInfo.History = append(chat.ChatInfo.History, models.Message{})
		chatState[1] = chat
	}
	if len(chatState[1].ChatInfo.History) != b.N {
		b.Errorf("no append")
	}

}
