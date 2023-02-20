package chat

import (
	"log"
	"net/http"
	"runtime/debug"
	"server/models"
	"server/repositories"
	"server/services/converter"
	"server/services/counter"
	"server/services/profanity"
	"server/services/store"

	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	upgrader      = websocket.Upgrader{}
	idCounterChat = make(chan uint64)
)

// InitChatService : initialize the chat service
func InitChatService(startID uint64, chats []uint64) {
	go counter.Counter(startID, idCounterChat, repositories.UpdateCurrentChatID)
	go store.InitStore()
	for _, chatID := range chats {
		if chatInfo, err := repositories.ReadChat(chatID); err != nil {
			log.Println("[ERROR][INIT]", err)
		} else {
			RestoreChat(chatID, chatInfo.StartDate, chatInfo.History)
		}
	}
	log.Println("[INIT] starting chat at: ", startID)
}

// HandleChatConnection : handle connection to chat channel
func HandleChatConnection(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["roomID"]
	id, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "Mauvais chatroom ID", http.StatusBadRequest) // error 400
		return
	}
	defer recoverClientConnection(id)
	chat, exist, _ := store.GetChat(id)
	if !exist {
		if chatInfo, innactiveChatExist := repositories.ReadChat(id); innactiveChatExist == nil {
			ws := connectWebsocket(res, req)
			catchUpHistory(ws, chatInfo.History)
			return
		}
		http.Error(res, "Le chat n'existe pas", http.StatusBadRequest) // error 400
		return
	}
	// connect client
	ws := connectWebsocket(res, req)
	log.Printf("[CONNECTION] new connection in chat: %v", id) // TODO remove in production
	// Catch up history
	catchUpHistory(ws, chat.ChatInfo.History)
	// ready to receive new message
	store.ApplyChat(id, func(chat models.ChatChannel) models.ChatChannel {
		chat.Clients[ws] = true
		return chat
	})
	// listen to the client
	go handleConnectedClient(ws, id)
}

func connectWebsocket(res http.ResponseWriter, req *http.Request) *websocket.Conn {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("[ERROR][CHAT]: ", err, " (hint: chat connection websocket upgrade)")
	}
	return ws
}

func recoverClientConnection(roomID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC] player couldn't connect to roomID:", roomID)
		log.Println("[PANIC]", err)
		debug.PrintStack()
		logChatRoom(roomID)
	}
}

func logChatRoom(roomID uint64) {
	chatRoom, exist, version := store.GetChat(roomID)
	log.Println("\t[INFO] exist:", exist)
	if exist {
		log.Println("\t[INFO] version:", version)
		log.Println("\t[INFO] chatRoom:", chatRoom)
	}
}

func handleConnectedClient(ws *websocket.Conn, id uint64) {
	defer recoverConnectedClient(ws, id)
	for {
		chat, _, _ := store.GetChat(id)
		var msg models.Message

		// Read in a new message as JSON and map it to a message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("[DECONNECTION]: %v", err)
			handleCloseClient(ws, id)
			return
		}

		// Send the newly received message to the broadcast channel
		chat.Broadcast <- msg
	}
}

func recoverConnectedClient(ws *websocket.Conn, chatID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC] something went wrong with a player")
		debug.PrintStack()
		logChatRoom(chatID)
		if chatRoom, chatExist, _ := store.GetChat(chatID); chatExist {
			_, playerExist := chatRoom.Clients[ws]
			log.Println("\t[INFO] player exist?", playerExist)
		}
	}
}

func handleCloseClient(ws *websocket.Conn, id uint64) {
	chat, _, _ := store.GetChat(id)
	delete(chat.Clients, ws)
	if err := ws.Close(); err != nil {
		log.Println("[ERROR][CHAT] couldn't close websocket")
		log.Println("\t[ERROR]", err)
	}
}

func HandleCloseChat(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["roomID"]
	chatID, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "Mauvais chatroom ID", http.StatusBadRequest) // error 400
		return
	}
	if chatID == 1 {
		http.Error(res, "Le chat general ne peut pas s'effacer", http.StatusBadRequest)
		return
	}
	chat, exist, _ := store.GetChat(chatID)
	if !exist {
		http.Error(res, "Le chat n'existe pas", http.StatusBadRequest)
		return
	}
	// delte stat
	if _, err = repositories.DeleteChatState(chatID); err != nil {
		http.Error(res, "Le chat n'existe pas", http.StatusInternalServerError)
		return
	}

	repositories.DeleteChat(chatID)
	shutDownChat(&chat)
}

// CloseChat : close and clean up everything about a chatroom
func CloseChat(chatID uint64) {
	log.Println("[CHAT] closing ", chatID)
	chat, exist, _ := store.GetChat(chatID)
	if !exist {
		return
	}
	repositories.CreateDeadChat(chatID, chat.ChatInfo.History)
	shutDownChat(&chat)
}

func shutDownChat(chat *models.ChatChannel) {
	close(chat.Broadcast)
	for client := range chat.Clients {
		client.Close()
	}
	store.DeleteChat(chat.ChatInfo.ID)
}

func recordChatHistory(msg models.Message, id uint64) {
	// record history
	store.ApplyChat(id, func(chat models.ChatChannel) models.ChatChannel {
		chat.ChatInfo.History = append(chat.ChatInfo.History, msg)
		return chat
	})
}

// HandleMessages : Broadcasts incoming messages to clients connected to a same chat channel
func HandleMessages(id uint64) {
	defer recoverBadChat(id)
	for {
		chat, _, _ := store.GetChat(id)
		// Grab the next message from the broadcast channel
		msg, isAlive := <-chat.Broadcast
		if !isAlive {
			log.Print("[CHAT]", id, "is dead")
			return
		}
		if profanity.IsInappropriate(msg.Message) {
			msg = models.Message{
				Message:  "" + msg.Username + " a osé profaner le chat",
				Username: "Modérateur",
				SendDate: time.Now(),
			}
		}

		msg.SendDate = time.Now()
		recordChatHistory(msg, id)
		// broadcast message to every clients
		broadcastMessage(id, chat.Clients, msg)
	}
}

func recoverBadChat(chatID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC] lost chat ", chatID)
		debug.PrintStack()
		log.Println("\t[PANIC]", err)
		logChatRoom(chatID)
		// clean up logic
		if _, exist, _ := store.GetChat(chatID); exist {
			CloseChat(chatID)
		}
	}
}

func catchUpHistory(ws *websocket.Conn, history []models.Message) {
	for _, message := range history {
		ws.WriteJSON(message)
	}
}

// RestoreChat : restore an old chat in the current session
func RestoreChat(chatID uint64, startDate time.Time, history []models.Message) {
	chat := models.ChatChannel{
		Clients:   make(map[*websocket.Conn]bool), // connected clients
		Broadcast: make(chan models.Message),      // broadcast channel
		ChatInfo: models.ChatInfo{
			ID:        chatID,
			StartDate: startDate,
			State:     models.ALIVE,
			History:   history,
		},
	}
	store.InserChat(chatID, chat)
	go HandleMessages(chatID)
}
