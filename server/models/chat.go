package models

import (
	"time"

	"github.com/gorilla/websocket"
)

// NewChatInfo : information needed to create a new chatroom
type NewChatInfo struct {
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

// ChatChannel : Communication channel used for the chat
type ChatChannel struct {
	Clients   map[*websocket.Conn]bool
	Broadcast chan Message
	ChatInfo  ChatInfo
}

// Message : Regroups a message's data and metadata
type Message struct {
	Email    string    `json:"email"`
	Username string    `json:"username"`
	Message  string    `json:"message"`
	SendDate time.Time `json:"sendDate"`
}

// ChatInfo : info about the chat
type ChatInfo struct {
	ID            uint64    `json:"id"`
	Name          string    `json:"name"`
	Members       []string  `json:"members"`
	History       []Message `json:"history"`
	StartDate     time.Time `json:"startDate"`
	EndDate       time.Time `json:"endDate"`
	GameChannelID uint64    `json:"gameChannelID"`
	State         LifeCycle `json:"state"`
}
