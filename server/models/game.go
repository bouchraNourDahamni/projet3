package models

import (
	"server/services/timer"

	"github.com/gorilla/websocket"
)

// GameChannel : Communication channel used for the gameplay
type GameChannel struct {
	Clients  map[string]*Player // email -> player
	Strokes  chan Stroke
	Info     GameInfo
	History  ActiveGameHistory
	EndTurn  chan bool
	NextTurn chan bool
}

type gameType string

// game types for game
const (
	CLASSIC gameType = "Classique"
	SOLO    gameType = "Solo"
)

// GameDifficulty : difficulty for game
type GameDifficulty string

// GameDifficulty : options
const (
	EASY   GameDifficulty = "Facile"
	MEDIUM GameDifficulty = "Moyen"
	HARD   GameDifficulty = "Difficile"
)

// LifeCycle : state of the game : waiting, alive, finished
type LifeCycle string

// LifeCycle : options
const (
	WAITING  LifeCycle = "waiting"
	ALIVE    LifeCycle = "alive"
	FINISHED LifeCycle = "finished"
)

// GameInfo : information about the game
type GameInfo struct {
	Type           gameType          `json:"type"`
	Difficulty     GameDifficulty    `json:"difficulty"`
	HumanPlayers   int               `json:"humanPlayers"`
	VirtualPlayers int               `json:"virtualPlayers"`
	GameID         uint64            `json:"gameID"`
	ChatID         uint64            `json:"chatID"`
	State          LifeCycle         `json:"state"`
	WordToGuess    Pair              `json:"pair"`
	Classic        ClassicAttributes `json:"classicAttributes"`
	Solo           SoloAttributes    `json:"soloAttributes"`
	TurnCounter    int               `json:"turnCounter"`
}

// ClassicAttributes : Attributes only a classic game can have
type ClassicAttributes struct {
	Teams  []Team  `json:"teams"`
	Drawer *Player `json:"drawer"`
}

// SoloAttributes : Attributes only a solo game can have
type SoloAttributes struct {
	Attempts int                 `json:"attempts"`
	Timer    *timer.SecondsTimer `json:"timer"`
	Score    int                 `json:"score"`
}

// Result : outcome of a classic game for a team
type Result string

// Result : options
const (
	WIN  Result = "Victoire"
	TIE  Result = "Égalité"
	LOSS Result = "Défaite"
)

// Vec2 : Recreates client's Vec2 used for pathData which allows coordinates paste on canvas
type Vec2 struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// StrokeAction : 3 types of strokes to support undo/redo
type StrokeAction string

// default | undo | redo
const (
	STROKE StrokeAction = "stroke"
	REDO   StrokeAction = "redo"
	UNDO   StrokeAction = "undo"
)

// Stroke : Information required for a stroke to be pasted on the canvas and recreate a drawing.
type Stroke struct {
	Pathdata []Vec2       `json:"pathdata"`
	Color    string       `json:"color"`
	Size     int          `json:"size"`
	Opacity  float32      `json:"opacity"`
	Action   StrokeAction `json:"action"`
}

// Pair : Represents a word-image pair
type Pair struct {
	Word       string         `json:"word"`
	Strokes    []Stroke       `json:"image"`
	Difficulty GameDifficulty `json:"difficulty"`
	Hints      []string       `json:"hints"`
}

// Player : info to help the game manage the player
type Player struct {
	Profile       Profile
	Socket        *websocket.Conn
	IsVirtual     bool
	WasLastToDraw bool
	Personnality  Personnality
}

// Team : info to help the game manage team
type Team struct {
	Players            []*Player
	IsCurrentlyPlaying bool
	Score              int
}

// NewGameRequest : request body to create a new game
type NewGameRequest struct {
	Type       gameType       `json:"type"`
	Difficulty GameDifficulty `json:"difficulty"`
}

// LobbyDataPaquet : regroups informations needed to dynamically update pre-game lobby infos
type LobbyDataPaquet struct {
	Emails         []string `json:"emails"`
	HumanPlayers   int      `json:"humansPlayers"`
	VirtualPlayers int      `json:"virtualPlayers"`
}
