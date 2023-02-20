package game

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"server/models"
	"server/services/converter"
	"server/services/store"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

func GuessWord(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["gameID"]
	gameID, err := converter.GetID(strID)
	if err != nil {
		http.Error(res, "ID mal écrit", http.StatusBadRequest)
		return
	}
	game, _, _ := store.GetGame(gameID)

	var msg models.Message
	json.NewDecoder(req.Body).Decode(&msg)

	log.Print("Game", game.Info.GameID, ": Received guess")
	if playerCanGuess(gameID, msg.Email) {
		log.Println("...From valid player")
		game.EndTurn <- strings.EqualFold(msg.Message, game.Info.WordToGuess.Word)
		chat, _, _ := store.GetChat(game.Info.ChatID)
		chat.Broadcast <- msg
	}
}

func playerCanGuess(gameID uint64, email string) bool {
	game, _, _ := store.GetGame(gameID)
	if game.Info.Type == models.SOLO {
		return true
	}
	for index := range game.Info.Classic.Teams {
		if game.Info.Classic.Teams[index].IsCurrentlyPlaying {
			for _, player := range game.Info.Classic.Teams[index].Players {
				if !player.IsVirtual && player.Profile.Email == email && game.Info.Classic.Drawer.Profile.Email != email {
					return true
				}
			}
		}
	}
	return false
}

func setWordToGuess(gameID uint64, pairList *map[int]models.Pair) {
	key, newPair := GetNewPair(pairList)
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.WordToGuess = newPair
		log.Println("[GAME] Word to guess :", game.Info.WordToGuess.Word)
		return game
	})
	delete(*pairList, key) // Never see this pair again in current game
}

func handleCorrectAnswer(gameID uint64, playerTwo *models.Player) {
	game, _, _ := store.GetGame(gameID)
	if game.Info.Type == models.CLASSIC {
		incrementTeamScore(gameID)
	}
	if playerTwo.IsVirtual {
		sendCPUMessage(game.Info.ChatID, models.ROUND_WIN, playerTwo)
	}
	notifyClients(gameID, models.CorrectAnswer)
	log.Println(models.CorrectAnswer)
	<-time.After(2 * time.Second)
}

func handleWrongAnswer(gameID uint64) {
	notifyClients(gameID, models.WrongAnswer)
	log.Println(models.WrongAnswer)
	<-time.After(2 * time.Second)
}

func GetHint(res http.ResponseWriter, req *http.Request) {
	strID := mux.Vars(req)["gameID"]
	gameID, _ := converter.GetID(strID)
	game, _, _ := store.GetGame(gameID)

	msg := models.Message{Email: "DrawItUp", Username: "DrawItUp", Message: "Il n'y a plus d'indice... C'est le temps de deviner!"}
	if len(game.Info.WordToGuess.Hints) > 0 {
		rand.Seed(time.Now().UnixNano())
		index := rand.Intn(len(game.Info.WordToGuess.Hints))
		msg.Message = "Indice: " + game.Info.WordToGuess.Hints[index]
		store.ApplyGame(game.Info.GameID, func(game models.GameChannel) models.GameChannel {
			if len(game.Info.WordToGuess.Hints) == 1 {
				game.Info.WordToGuess.Hints = nil
			} else {
				// remove element at position "index"
				game.Info.WordToGuess.Hints[index] = game.Info.WordToGuess.Hints[0]
				game.Info.WordToGuess.Hints = game.Info.WordToGuess.Hints[1:len(game.Info.WordToGuess.Hints)]
			}
			return game
		})
	}
	// Everybody can see the hint
	chat, _, _ := store.GetChat(game.Info.ChatID)
	chat.Broadcast <- msg
}
