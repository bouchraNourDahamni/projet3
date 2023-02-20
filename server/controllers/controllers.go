package controllers

import (
	"net/http"
	"server/services"
	"server/services/chat"
	"server/services/game"
	"server/services/recovery"
	"server/services/session"
	"server/services/trophy"

	"github.com/gorilla/mux"
)

// InitializeRouter : Creates a new router which associates routes to corresponding service
func InitializeRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)

	// Session/Account
	router.HandleFunc("/register", services.HandleRegister).Methods(http.MethodPost)
	router.HandleFunc("/login", services.HandleLogin).Methods(http.MethodPost)
	router.HandleFunc("/session/{email}", session.HandleSession) // login to a session
	router.HandleFunc("/user/{email}", services.GetUserInfo).Methods(http.MethodGet)

	// subrouters
	initChat(router)
	initGame(router)
	initInfo(router)
	initLeaderBoard(router)
	initRecovery(router)
	inittrophy(router)

	router.HandleFunc("/avatars", services.GetAvatars).Methods(http.MethodGet)
	// Serve static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

	return router
}

func initChat(router *mux.Router) {
	router.HandleFunc("/chat/join/{roomID:[0-9]+}", chat.HandleChatConnection) // /chat/:id
	router.HandleFunc("/chat/delete/{roomID:[0-9]+}", chat.HandleCloseChat)
	router.HandleFunc("/chat/new/member", chat.HandleAddNewMember).Methods(http.MethodPost) // chat & user
	router.HandleFunc("/chat/rename", chat.RenameChat).Methods(http.MethodPost)             // chat & user
	router.HandleFunc("/new/chat", chat.HandleNewChat).Methods(http.MethodPost)
}

func initInfo(router *mux.Router) {
	info := router.PathPrefix("/info").Subrouter()
	info.HandleFunc("/chats", services.ChatSession).Methods(http.MethodGet)
	info.HandleFunc("/chat/{chatID:[0-9]+}", services.GetSpecificChatSession).Methods(http.MethodGet)
	info.HandleFunc("/user/chats/{email}", services.GetUserChat).Methods(http.MethodGet)
	info.HandleFunc("/sessions", services.GetSessionInfo).Methods(http.MethodGet)
	info.HandleFunc("/games", services.GameSessionInfo).Methods(http.MethodGet)
	info.HandleFunc("/game/{gameID:[0-9]+}", services.GetSpecificGameSession).Methods(http.MethodGet)
	info.HandleFunc("/trace/game/{gameID:[0-9]+}", services.GetGameTrace).Methods(http.MethodGet)
}

func initGame(router *mux.Router) {
	gameRouter := router.PathPrefix("/game").Subrouter()
	gameRouter.HandleFunc("/connect/{gameID:[0-9]+}/{email}", game.HandleGameConnection)
	gameRouter.HandleFunc("/newPair", services.HandleNewPair).Methods(http.MethodPost)
	gameRouter.HandleFunc("/start/{gameID:[0-9]+}", game.HandleGameStart)
	gameRouter.HandleFunc("/lobbyUpdate/{gameID:[0-9]+}", game.NotifyUsersGameLobbyStateChange).Methods(http.MethodGet)
	gameRouter.HandleFunc("/next-turn/{gameID:[0-9]+}", game.HandleNextTurn)
	gameRouter.HandleFunc("/guess/{gameID:[0-9]+}", game.GuessWord).Methods(http.MethodPost)
	gameRouter.HandleFunc("/hint/{gameID:[0-9]+}", game.GetHint)
	router.HandleFunc("/new/game", game.HandleNewGame).Methods(http.MethodPost)
}

func initLeaderBoard(router *mux.Router) {
	leaderboardRouter := router.PathPrefix("/leaderboard").Subrouter()
	leaderboardRouter.HandleFunc("/game", services.MostGameLeaderBoard)
	leaderboardRouter.HandleFunc("/win-rate", services.WinRateLeaderBoard)
	leaderboardRouter.HandleFunc("/average-time", services.AverageTimeLeaderBoard)
	leaderboardRouter.HandleFunc("/most-time", services.MostTimeLeaderBoard)
}

func initRecovery(router *mux.Router) {
	recoveryRouter := router.PathPrefix("/recovery").Subrouter()
	recoveryRouter.HandleFunc("/start", recovery.StartRecovery).Methods(http.MethodPost)
	recoveryRouter.HandleFunc("/confirm", recovery.ConfirmRecoveryCode).Methods(http.MethodPost)
	recoveryRouter.HandleFunc("/change", recovery.ChangePassword).Methods(http.MethodPost)
}

func inittrophy(router *mux.Router) {
	trophyRouter := router.PathPrefix("/trophy").Subrouter()
	trophyRouter.HandleFunc("/detect", trophy.TriggerUpdate).Methods(http.MethodPost)
	trophyRouter.HandleFunc("/give", trophy.AwardHimself).Methods(http.MethodPost)
}
