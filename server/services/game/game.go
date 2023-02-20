package game

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"reflect"
	"runtime/debug"
	"server/models"
	"server/repositories"
	"server/services/chat"
	"server/services/converter"
	"server/services/counter"
	"server/services/session"
	"server/services/store"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	upgrader       = websocket.Upgrader{}
	idCounterGames = make(chan uint64)
)

const (
	maxStrokes       = 120
	maxClients       = 4
	defaultFrequency = 12
)

// InitGameService : Starts game service and game ID incrementer
func InitGameService() {
	go counter.Counter(1, idCounterGames)
	log.Println("[INIT] game service")
}

// HandleGameConnection : Establishes new websocket connections for game matches
func HandleGameConnection(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["gameID"]
	email := mux.Vars(req)["email"]
	if !canConnectToGame(strID, email, res) {
		return
	}
	gameID, _ := converter.GetID(strID)
	defer recoverGameConnection(gameID)

	profile, err := repositories.GetProfile(email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errMsg := fmt.Sprintf("Impossibilité de récupérer le profil de %s pour le moment", email)
			http.Error(res, errMsg, http.StatusNotFound)
			log.Println("[ERROR][GAME]: Could not fetch user profile (", err, ")")
			return
		}
		log.Println("[ERROR][GAME]: ", err)
	}

	// Connect client
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("[ERROR][GAME]:", err, " (hint: game connection websocket upgrade)")
		return
	}

	log.Printf("[CONNECTION] %s now connected in game lobby: %v", email, gameID)

	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Clients[email] = &models.Player{Profile: profile, Socket: ws, IsVirtual: false, WasLastToDraw: false}
		return game
	})
	updateNumberOfPlayers(gameID)

	// listen to the client
	go handleConnectedClientStrokes(gameID, email)
}

func recoverGameConnection(gameID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC] issue with client connection")
		debug.PrintStack()
		log.Println("\t[PANIC]", err)
		logGameRoom(gameID)
	}
}

func logGameRoom(roomID uint64) {
	gameLobby, exist, version := store.GetGame(roomID)
	log.Println("\t[INFO] exist:", exist)
	if exist {
		log.Println("\t[INFO] version:", version)
		log.Println("\t[INFO] gameLobby:", gameLobby)
	}
}

func canConnectToGame(strID string, email string, res http.ResponseWriter) bool {
	gameID, err := converter.GetID(strID)

	if err != nil {
		http.Error(res, "Mauvais ID pour la partie", http.StatusBadRequest)
		return false
	}
	game, exist, _ := store.GetGame(gameID)

	if !exist {
		http.Error(res, "Cette partie n'existe pas", http.StatusBadRequest)
		return false
	}

	if len(game.Clients) == maxClients {
		http.Error(res, "Salon de jeu plein, veuillez créer ou rejoindre une autre partie", http.StatusForbidden)
		return false
	}

	return true
}

func updateNumberOfPlayers(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.HumanPlayers = len(game.Clients)
		game.Info.VirtualPlayers = maxClients - game.Info.HumanPlayers
		return game
	})

	game, _, _ := store.GetGame(gameID)
	if game.Info.State == models.WAITING {
		notifyClients(gameID, models.GameLobbyStateUpdate)
	}
}

// NotifyUsersGameLobbyStateChange : Notifies users in game waiting room about new (de)connections to game lobby
func NotifyUsersGameLobbyStateChange(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["gameID"]
	id, _ := converter.GetID(strID)
	game, _, _ := store.GetGame(id)

	var newLobbyData models.LobbyDataPaquet

	newLobbyData.HumanPlayers = game.Info.HumanPlayers
	newLobbyData.VirtualPlayers = game.Info.VirtualPlayers
	for email := range game.Clients {
		// Fill paquet
		newLobbyData.Emails = append(newLobbyData.Emails, email)
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(newLobbyData)
}

// HandleGameStart : handle the logic to start a game
func HandleGameStart(res http.ResponseWriter, req *http.Request) {
	// Checks
	strID := mux.Vars(req)["gameID"]
	if !canStartGame(strID, res) {
		return
	}
	gameID, _ := converter.GetID(strID)
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		switch history := game.History.(type) {
		case models.ClassicGameHistory:
			players := make([]string, len(game.Clients))
			i := 0
			for email := range game.Clients {
				players[i] = email
				i++
			}
			history.Players = players
			game.History = history
		}
		return game
	})
	notifyClients(gameID, models.StartGame)
	log.Println(models.StartGame)

	startGame(gameID)
}

func canStartGame(strID string, res http.ResponseWriter) bool {
	id, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "Mauvais ID pour la partie", http.StatusBadRequest) // error 400
		return false
	}
	game, exist, _ := store.GetGame(id)
	if !exist {
		http.Error(res, "Cette partie n'existe pas", http.StatusBadRequest) // error 400
		return false
	}

	if game.Info.State == models.ALIVE {
		http.Error(res, "Cette partie existe déjà", http.StatusBadRequest) // error 400
		return false
	}

	if err := isValidForMode(id); err != "" {
		http.Error(res, err, http.StatusBadRequest) // error 400
		return false
	}

	return true
}

func startGame(gameID uint64) {
	setGameAlive(gameID)
	startHandleGame(gameID)
}

func setGameAlive(gameID uint64) {
	// change state
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.State = models.ALIVE
		switch history := game.History.(type) {
		case *models.ClassicGameHistory:
			history.Start = time.Now()
			game.History = history
		case *models.SoloGameHistory:
			history.Start = time.Now()
			game.History = history
		default:
			log.Println("[ERROR] can't switch setGameAlive", reflect.TypeOf(history))
		}
		store.ApplyChat(game.Info.ChatID, func(chat models.ChatChannel) models.ChatChannel {
			chat.ChatInfo.State = models.ALIVE
			return chat
		})
		return game
	})
	log.Println("[GAME] It's alive! ", gameID)
}

func startHandleGame(gameID uint64) {
	game, _, _ := store.GetGame(gameID)
	pairList := repositories.GetPairsFromChosenDifficulty(string(game.Info.Difficulty))
	time.After(2 * time.Second) // For android
	switch game.Info.Type {
	case models.CLASSIC:
		formTeams(gameID)
		go handleClassicGame(gameID, pairList)
	case models.SOLO:
		go handleSoloGame(gameID, pairList)
	default:
		return
	}
}

// GetNewPair : Gives a new pair to be guessed and drawn for a new round
func GetNewPair(pairList *map[int]models.Pair) (int, models.Pair) {
	keys := make([]int, 0, len(*pairList))
	for k := range *pairList {
		keys = append(keys, k)
	}
	rand.Seed(time.Now().UnixNano())
	index := keys[rand.Intn(len(*pairList))]
	return index, (*pairList)[index]
}

func isValidForMode(gameID uint64) (errMsg string) {
	game, _, _ := store.GetGame(gameID)
	switch game.Info.Type {
	case models.CLASSIC:
		if len(game.Clients) < 2 {
			return "Il n'y a pas assez de joueurs pour commencer la partie"
		}
	default:
		return
	}
	return
}

func handleCloseGameClient(gameID uint64, email string) {
	_, exist, _ := store.GetGame(gameID)
	log.Println("handleCloseGameClient, id:", gameID, "email :,", email)
	if exist {
		store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
			if client, exist := game.Clients[email]; exist {
				client.Socket.Close()
			}
			delete(game.Clients, email)
			return game
		})
		updateNumberOfPlayers(gameID)
		checkCloseGameNecessity(gameID)
	}
}

func checkCloseGameNecessity(gameID uint64) {
	game, _, _ := store.GetGame(gameID)
	if game.Info.State == models.ALIVE {
		notifyClients(gameID, models.Disconnected)
		<-time.After(2 * time.Second)
		closeGame(gameID)
	} else if game.Info.State == models.WAITING && len(game.Clients) == 0 {
		closeGame(gameID)
	}
}

func closeGame(gameID uint64) {
	game, exist, _ := store.GetGame(gameID)
	if !exist {
		return
	}
	log.Println("[GAME] closing game ", gameID)

	// update data
	log.Println(game.Info.State)
	if game.Info.State == models.FINISHED { // Normal ending
		switch game.Info.Type {
		case models.CLASSIC:
			updateClassicGameScore(gameID)
		case models.SOLO:
			updateSoloGameScore(gameID)
		}
	}

	// Save info
	repositories.UpdateGameInfo(gameID)

	// close websockets
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for _, client := range game.Clients {
			client.Socket.Close()
		}
		return game
	})
	chat.CloseChat(game.Info.ChatID)

	// delete
	store.DeleteGame(gameID)
}

func handleEndGame(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.State = models.FINISHED
		switch history := game.History.(type) {
		case *models.ClassicGameHistory:
			history.End = time.Now()
			game.History = history
		case *models.SoloGameHistory:
			history.End = time.Now()
			game.History = history
		case models.SoloGameHistory:
			history.End = time.Now()
			game.History = history
		case models.ClassicGameHistory:
			history.End = time.Now()
			game.History = history
		default:
			log.Println("[ERROR] can't switch setGameAlive", reflect.TypeOf(history))
		}
		return game
	})
	<-time.After(time.Second)
	closeGame(gameID)
}

func updateClassicGameScore(gameID uint64) {
	game, _, _ := store.GetGame(gameID)

	if isTie(gameID) {
		return
	}
	// find winner
	var winner int = 0
	var maxScore int = 0
	for index, team := range game.Info.Classic.Teams {
		if team.Score > maxScore {
			winner = index
			maxScore = team.Score
		}
	}
	// fill
	var gameResult = make(map[string]models.Result)
	for _, teamMate := range game.Info.Classic.Teams[winner].Players {
		gameResult[teamMate.Profile.Email] = models.WIN
		if !teamMate.IsVirtual {
			session.NotifyUser(teamMate.Profile.Email, models.YouWon)
		}
	}
	for _, teamMate := range game.Info.Classic.Teams[(winner+1)%2].Players {
		gameResult[teamMate.Profile.Email] = models.LOSS
		if !teamMate.IsVirtual {
			session.NotifyUser(teamMate.Profile.Email, models.YouLost)
		}
	}
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		gameHistory := game.History.(*models.ClassicGameHistory)
		gameHistory.Result = gameResult
		gameHistory.Players = getPlayers(game)
		game.History = gameHistory
		return game
	})
}

func getPlayers(game models.GameChannel) []string {
	players := make([]string, len(game.Clients))
	i := 0
	for email := range game.Clients {
		players[i] = email
		i++
	}
	return players
}

func isTie(gameID uint64) bool {
	game, _, _ := store.GetGame(gameID)

	if game.Info.Classic.Teams[0].Score == game.Info.Classic.Teams[1].Score {
		store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
			gameHistory := game.History.(*models.ClassicGameHistory)
			for _, player := range gameHistory.Players {
				gameHistory.Result[player] = models.TIE
			}
			game.History = gameHistory
			return game
		})
		return true
	}
	return false
}

func updateSoloGameScore(gameID uint64) {
	log.Println("UPDATE SOLO")
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		gameHistory := game.History.(*models.SoloGameHistory)
		gameHistory.Result = game.Info.Solo.Score
		game.History = gameHistory
		log.Println(game.History)
		return game
	})
}

// HandleNewGame : Create a new game and return the id to the user
func HandleNewGame(res http.ResponseWriter, req *http.Request) {
	var newGameRequest models.NewGameRequest
	json.NewDecoder(req.Body).Decode(&newGameRequest)

	game := MakeGameChannel(newGameRequest)

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(game.Info)
}

// MakeGameChannel : Creates a new channel clients can connect to to send and receive drawing strokes
func MakeGameChannel(request models.NewGameRequest) models.GameChannel {
	gameID := <-idCounterGames
	chatID := chat.MakeChatChannel(models.NewChatInfo{
		Name: "Partie en cours",
	}, chat.HandleGameMessages())

	store.ApplyChat(chatID, func(chat models.ChatChannel) models.ChatChannel {
		chat.ChatInfo.GameChannelID = gameID
		chat.ChatInfo.State = models.WAITING
		return chat
	})

	game := gameFactory(request, gameID, chatID)

	store.InsertGame(game.Info.GameID, game)

	go BroadcastStrokes(game.Info.GameID) // handle strokes in channel
	return game
}

func notifyClients(gameID uint64, notification models.UserNotification) {
	game, _, _ := store.GetGame(gameID)
	for email := range game.Clients {
		session.NotifyUser(email, notification)
	}
}

// HandleNextTurn : Pauses game execution between rounds
func HandleNextTurn(res http.ResponseWriter, req *http.Request) {
	log.Println("In Next turn")
	strID := mux.Vars(req)["gameID"]
	id, _ := converter.GetID(strID)
	game, _, _ := store.GetGame(id)
	select {
	case game.NextTurn <- true:
		break
	case <-time.After(time.Second * 5):
		break
	}
}
