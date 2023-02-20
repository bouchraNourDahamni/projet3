package game

import (
	"log"
	"runtime/debug"
	"server/models"
	"server/services/session"
	"server/services/store"
	"time"
)

const (
	maxRound = 6
)

func handleClassicGame(gameID uint64, pairList map[int]models.Pair) {
	defer logPanic(gameID)
	var cpuMustStopDrawing = new(bool)
	game, _, _ := store.GetGame(gameID)
	for {
		*cpuMustStopDrawing = false
		handleClassicStartTurn(gameID, &pairList, cpuMustStopDrawing)
		handleGuessingAndScore(gameID)
		if handleEndRound(gameID, cpuMustStopDrawing) {
			handleEndGame(gameID)
			return
		}
		<-game.NextTurn

	}
}

// handleClassicStartTurn : perform all the actions required to start a turn
func handleClassicStartTurn(gameID uint64, pairList *map[int]models.Pair, cpuMustStop *bool) {
	_, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	setWordToGuess(gameID, pairList)

	notifyPlayersOfTheirRole(gameID)

	notifyClients(gameID, models.StartTurn)
	log.Println(models.StartTurn)

	// Allow CPU to draw
	game, _, _ := store.GetGame(gameID)
	if game.Info.HumanPlayers < maxClients && game.Info.Classic.Drawer.IsVirtual {
		go handleVirtualPlayerStrokes(gameID, getCPUDrawingFrequency(gameID), cpuMustStop)
	}
}

func notifyPlayersOfTheirRole(gameID uint64) {
	game, _, _ := store.GetGame(gameID)
	for teamIndex := range game.Info.Classic.Teams {
		if game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
			notifyDrawerAndGuesser(gameID, game.Info.Classic.Teams[teamIndex].Players[0].Profile.Email, game.Info.Classic.Teams[teamIndex].Players[1])
		} else {
			notifyWatchingPlayers(gameID, teamIndex)
		}
	}
}

// First player is human, so we only need his email
func notifyDrawerAndGuesser(gameID uint64, firstPlayerEmail string, secondPlayer *models.Player) {
	game, _, _ := store.GetGame(gameID)
	if firstPlayerEmail == game.Info.Classic.Drawer.Profile.Email {
		session.NotifyUser(firstPlayerEmail, models.YouDraw)
		log.Println(models.YouDraw, ":", firstPlayerEmail)
		if !secondPlayer.IsVirtual { // Safety check
			session.NotifyUser(secondPlayer.Profile.Email, models.YouGuess)
			log.Println(models.YouGuess, ":", secondPlayer.Profile.Email)
		}
	} else {
		session.NotifyUser(firstPlayerEmail, models.YouGuess)
		log.Println(models.YouGuess, ":", firstPlayerEmail)
		if !secondPlayer.IsVirtual {
			session.NotifyUser(secondPlayer.Profile.Email, models.YouDraw)
			log.Println(models.YouDraw, ":", secondPlayer.Profile.Email)
		}
	}
}

func notifyWatchingPlayers(gameID uint64, teamIndex int) {
	game, _, _ := store.GetGame(gameID)
	session.NotifyUser(game.Info.Classic.Teams[teamIndex].Players[0].Profile.Email, models.NotYourTurn)
	log.Println(models.NotYourTurn, ":", game.Info.Classic.Teams[teamIndex].Players[0].Profile.Email)
	if !game.Info.Classic.Teams[teamIndex].Players[1].IsVirtual {
		session.NotifyUser(game.Info.Classic.Teams[teamIndex].Players[1].Profile.Email, models.NotYourTurn)
		log.Println(models.NotYourTurn, ":", game.Info.Classic.Teams[teamIndex].Players[1].Profile.Email)
	}
}

func handleGuessingAndScore(gameID uint64) {
	result := isGuessingTeamRight(gameID)

	if result {
		// Give point to drawing team
		game, _, _ := store.GetGame(gameID)
		for teamIndex := range game.Info.Classic.Teams {
			if game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
				handleCorrectAnswer(gameID, game.Info.Classic.Teams[teamIndex].Players[1])
			}
		}
	} else {
		handleWrongAnswer(gameID)
		<-time.After(2 * time.Second)
		handleOppositeTeamPlay(gameID)
	}
}

func handleOppositeTeamPlay(gameID uint64) {
	_, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	// Temporarily give opposite team the right to guess
	switchTeamsPlayStatus(gameID)

	notifyClients(gameID, models.RightOfReply)
	log.Println(models.RightOfReply)
	<-time.After(2 * time.Second)

	// To tell the client to reset timer
	notifyClients(gameID, models.StartTurn)
	log.Println(models.StartTurn)

	result := isGuessingTeamRight(gameID)
	if result {
		// Give point to opposite team
		game, _, _ := store.GetGame(gameID)
		for teamIndex := range game.Info.Classic.Teams {
			if game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
				handleCorrectAnswer(gameID, game.Info.Classic.Teams[teamIndex].Players[1])
			}
		}
	} else {
		handleWrongAnswer(gameID)
	}
	switchTeamsPlayStatus(gameID)
}

func isGuessingTeamRight(gameID uint64) bool {
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	select {
	case result := <-game.EndTurn:
		log.Println("Result:", result)
		return result
	case <-time.After(time.Minute):
		log.Println("Times up!")
		return false
	}
}

func incrementTeamScore(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for index := range game.Info.Classic.Teams {
			if game.Info.Classic.Teams[index].IsCurrentlyPlaying {
				game.Info.Classic.Teams[index].Score++
			}
		}
		return game
	})
}

// handleEndRound : perform all the actions required to end a round
func handleEndRound(gameID uint64, cpuMustStop *bool) (EOG bool) {
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	*cpuMustStop = true

	if game.Info.TurnCounter >= maxRound {
		notifyClients(gameID, models.EndGame)
		log.Println(models.EndGame)
		return true
	}
	switchTurns(gameID)
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.TurnCounter++
		return game
	})
	notifyClients(gameID, models.EndTurn)
	log.Println(models.EndTurn)
	return false
}

func logPanic(gameID uint64) {
	if err := recover(); err != nil {
		log.Println("[PANIC]", err)
		debug.PrintStack()
		log.Println("[REPORT]:")
		game, exists, version := store.GetGame(gameID)
		log.Println("- GameID =>", game.Info.GameID)
		log.Println("- Game exists? =>", exists)
		log.Println("- Store version =>", version)
		if exists {
			log.Println("- Remaining players =>")
			for email := range game.Clients {
				log.Println("\t -", email)
			}
			store.DeleteGame(gameID)
		}
	}
}

func checkGameExistance(exist bool) {
	if !exist {
		panic("Game doesn't exist!")
	}
}
