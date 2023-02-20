package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"server/controllers"
	"server/repositories"
	"server/services"
	"server/services/store"
	"time"
)

// Version : server version (usually git version)
var Version = "unset"

func main() {
	log.Println("[INIT] server is running")
	logVersion()
	os.Setenv("TZ", "America/New_York")
	// MongoDB connect
	client, ctx := repositories.Init()
	defer client.Disconnect(ctx)
	// INIT
	services.InitServices()
	router := controllers.InitializeRouter()

	// Graceful shutdown
	defer onClose()

	done := make(chan bool)
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt)
	var port string
	flag.StringVar(&port, "port", ":80", "set the server port")
	flag.Parse()
	server := http.Server{
		Addr:         port,
		Handler:      router,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	go func() {
		<-quit
		log.Println("[SHUTDOWN] quiting server")
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		server.SetKeepAlivesEnabled(false)
		if err := server.Shutdown(ctx); err != nil {
			log.Fatalf("[SHUTDOWN] Could not gracefully shutdown the server: %v\n", err)
		}
		close(done)
	}()
	// Adjust port according to context (AWS = 80, localhost = any other valid port ex: 3000)
	log.Println("[INIT] http server started on " + port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Println("[FATAL] Error with server: ", err) // not fatal because need to exec onClose
	}

	<-done
}

func onClose() {
	log.Println("[CLOSING] Commiting chat history ...")
	// commit chat history
	for _, chatRoom := range store.GetChannels() {
		repositories.UpdateChatHistory(chatRoom.ChatInfo.ID, chatRoom.ChatInfo.History)
		log.Println(chatRoom.ChatInfo.ID, chatRoom.ChatInfo.History)
	}
}

func logVersion() {
	log.Printf("[VERSION]: %s", Version)
	if out, err := exec.Command("git", "rev-parse", "HEAD").Output(); err == nil {
		log.Println("[VERSION] env version:", string(out))
	} else {
		log.Println(err)
	}
}
