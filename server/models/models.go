package models

// Register : Public and private infos that characterize an account
type Register struct {
	Email     string `json:"email"`
	Pseudo    string `json:"pseudo"`
	LastName  string `json:"lastName"`
	FirstName string `json:"firstName"`
	Password  string `json:"password"`
	Avatar    string `json:"avatar"`
}

// Login : Regroups required infos to perform a login attempt
type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UserNotification : Allows to update clients about current game's state/events
type UserNotification string

// Represent the different game user notifications the clients can receive
const (
	StartGame            UserNotification = "startGame"
	StartTurn            UserNotification = "startTurn"
	CorrectAnswer        UserNotification = "correctAnswer"
	WrongAnswer          UserNotification = "wrongAnswer"
	EndTurn              UserNotification = "endTurn"
	EndGame              UserNotification = "endGame"
	Disconnected         UserNotification = "disconnected" // Ran out of players
	GameLobbyStateUpdate UserNotification = "gameLobbyStateUpdate"
	YouGuess             UserNotification = "youGuess"     // your turn to guess
	YouDraw              UserNotification = "youDraw"      // your turn to draw
	NotYourTurn          UserNotification = "notYourTurn"  // wait for opposite team
	RightOfReply         UserNotification = "rightOfReply" // droit de replique
	YouWon               UserNotification = "youWon"
	YouLost              UserNotification = "youLost"
)

// Server : the server state
type Server struct {
	name        string // current
	StartChatID uint64
	StartGameID uint64
	Chats       []uint64
}
