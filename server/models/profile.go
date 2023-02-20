package models

import "time"

// UserPublicInformation : It is all the public information of a user.
type UserPublicInformation struct {
	Pseudo string `json:"pseudo"`
	Avatar string `json:"avatar"`
}

// UserPrivateInformation : It is all the private information of a user.
type UserPrivateInformation struct {
	LastName  string `json:"lastName"`
	FirstName string `json:"firstName"`
	Password  string `json:"password"`
}

// UserStatistics : It is all the statistics linked to a user.
type UserStatistics struct {
	Games       int           `json:"games"`
	WinRatio    float64       `json:"winratio"`
	Wins        int           `json:"Wins"`
	Losts       int           `json:"Losts"`
	AvarageTime time.Duration `json:"avaragetime"`
	TotalTime   time.Duration `json:"totaltime"`
}

// ActiveGameHistory : interface used to get and set values of game types history
type ActiveGameHistory interface {
	SetStartTime(time.Time)
	SetEndTime(time.Time)
}

type BasicGameHistory struct {
	ActiveGameHistory
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

// ClassicGameHistory : Represent the information linked to a classic game.
type ClassicGameHistory struct {
	BasicGameHistory
	Players []string          `json:"players"` // emails (public key)
	Result  map[string]Result `json:"result"`  // email -> to know who won
}

// SoloGameHistory : Represent the information linked to a solo game.
type SoloGameHistory struct {
	BasicGameHistory
	Result int `json:"result"`
}

// DeadGameHistory :
type DeadGameHistory struct {
	Classic []ClassicGameHistory `json:"classic"`
	Solo    []SoloGameHistory    `json:"solo"`
}

// UserHistory : Represent the user information linked to time.
type UserHistory struct {
	CreationDate  time.Time       `json:"creationDate"`
	Connections   []time.Time     `json:"connections"`
	Deconnections []time.Time     `json:"deconnections"`
	ChatChannels  []uint64        `json:"chatChannels"`
	GamesHistory  DeadGameHistory `json:"gamesHistory"`
}

// Profile : Regroups all the information linked to a profile.
type Profile struct {
	Email      string                 `json:"email"` // Primary Key
	Public     UserPublicInformation  `json:"public"`
	Private    UserPrivateInformation `json:"private"`
	Statistics UserStatistics         `json:"statistics"`
	Trophies   []string               `json:"trophies"`
	History    UserHistory            `json:"history"`
}
