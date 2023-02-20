package session

import (
	"log"
	"net/http"
	"runtime/debug"
	"server/models"
	"server/repositories"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	// Connections : map every connections to a websocket
	Connections = make(map[string]*websocket.Conn) // email -> ws
	upgrader    = websocket.Upgrader{}
)

// HandleSession : login a user to his session
func HandleSession(res http.ResponseWriter, req *http.Request) {
	email := mux.Vars(req)["email"]
	defer recoverSession(email)
	if IsUserConnected(email) {
		http.Error(res, "Le compte est déjà connecté", http.StatusUnauthorized)
		return
	}
	// upgrade connection
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("[ERROR][SESSION]: ", err, " (hint: handle session websocket upgrade)")
		http.Error(res, "le client n'utilise pas websocket", http.StatusUnauthorized)
		return
	}
	repositories.UpdateLoginLogs(email, time.Now())
	defer ws.Close()
	Connections[email] = ws
	// ping connection
	for {
		var msg models.Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Println("[DECONNECTION]", time.Now())
			repositories.UpdateDeconnectionLogs(email, time.Now())
			delete(Connections, email)
			break
		}
	}
}

// NotifyUser : will send a message through the session websocket for one user
func NotifyUser(email string, notification models.UserNotification) {
	Connections[email].WriteJSON(notification)
}

// IsUserConnected : tell if a specific user is connected
func IsUserConnected(email string) bool {
	_, exists := Connections[email]
	return exists
}

func recoverSession(email string) {
	if err := recover(); err != nil {
		log.Println("[PANIC] session:", email)
		debug.PrintStack()
		log.Fatalln("\t[PANIC] ", err)
		if _, exist := Connections[email]; exist {
			delete(Connections, email)
		}
	}
}
