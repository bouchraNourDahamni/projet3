package game

import (
	"log"
	"math/rand"
	"server/models"
	"server/services/store"
	"time"
)

func switchTurns(gameID uint64) {
	game, exist, _ := store.GetGame(gameID)
	checkGameExistance(exist)

	switch len(game.Clients) {
	case maxClients:
		switchTurns4Players(gameID)
	case maxClients - 1:
		switchTurns3Players(gameID)
	case maxClients - 2:
		switchTurns2Players(gameID)
	}
}

func switchTurns4Players(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for teamIndex := range game.Info.Classic.Teams {
			if !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
				for playerIndex := range game.Info.Classic.Teams[teamIndex].Players {
					if !game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw {
						game.Info.Classic.Drawer = game.Info.Classic.Teams[teamIndex].Players[playerIndex]
					}
					game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw = !game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw
				}
			}
			game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying = !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying
		}
		return game
	})
}

func switchTurns3Players(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for teamIndex := range game.Info.Classic.Teams {
			if !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
				if teamIndex == 0 { // Team with 2 humans
					for playerIndex := range game.Info.Classic.Teams[teamIndex].Players {
						if !game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw {
							game.Info.Classic.Drawer = game.Info.Classic.Teams[teamIndex].Players[playerIndex]
						}
						game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw = !game.Info.Classic.Teams[teamIndex].Players[playerIndex].WasLastToDraw
					}
				} else { // Team with 1 virtual player
					game.Info.Classic.Drawer = game.Info.Classic.Teams[teamIndex].Players[1]
				}
			}
			game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying = !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying
		}
		return game
	})
}

func switchTurns2Players(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for teamIndex := range game.Info.Classic.Teams {
			// Assign drawer to virtual player that wasn't playing
			if !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying {
				game.Info.Classic.Drawer = game.Info.Classic.Teams[teamIndex].Players[1]
			}
			game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying = !game.Info.Classic.Teams[teamIndex].IsCurrentlyPlaying
		}
		return game
	})
}

func switchTeamsPlayStatus(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for index := range game.Info.Classic.Teams {
			game.Info.Classic.Teams[index].IsCurrentlyPlaying = !game.Info.Classic.Teams[index].IsCurrentlyPlaying
		}
		return game
	})
}

func formTeams(gameID uint64) {
	distributeHumanPlayers(gameID)
	setDefaultBools(gameID)

	game, _, _ := store.GetGame(gameID)
	if len(game.Clients) < maxClients {
		fillWithVirtualPlayers(gameID)
		sendCPUMessage(game.Info.ChatID, models.GREET, game.Info.Classic.Teams[1].Players[1])
		if game.Info.Classic.Teams[0].Players[1].IsVirtual { // Two human players
			<-time.After(time.Second)
			sendCPUMessage(game.Info.ChatID, models.GREET, game.Info.Classic.Teams[0].Players[1])
		}
	}
	game, _, _ = store.GetGame(gameID)
	log.Println(game)
}

// Add player to team alternatively
func distributeHumanPlayers(gameID uint64) {
	teamNumber := 0
	playerNumber := 0

	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		for index := range game.Clients {
			game.Info.Classic.Teams[teamNumber].Players[playerNumber] = game.Clients[index]
			teamNumber = updateTeamNumber(teamNumber)
			if teamNumber == 0 && playerNumber == 0 {
				playerNumber++
			}
		}
		return game
	})
}

func updateTeamNumber(teamNumber int) int {
	if teamNumber == 0 {
		return 1
	}
	return 0
}

func setDefaultBools(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		game.Info.Classic.Teams[0].IsCurrentlyPlaying = true
		game.Info.Classic.Teams[1].IsCurrentlyPlaying = false

		// No drawer until 3 players -> 3rd player is drawer
		// Requires if statements to prevent access to undefined player
		if len(game.Clients) >= maxClients-1 {
			game.Info.Classic.Drawer = game.Info.Classic.Teams[0].Players[1]
			game.Info.Classic.Teams[0].Players[1].WasLastToDraw = true
		}
		if len(game.Clients) == maxClients {
			game.Info.Classic.Teams[1].Players[1].WasLastToDraw = true
		}
		return game
	})
}

func fillWithVirtualPlayers(gameID uint64) {
	store.ApplyGame(gameID, func(game models.GameChannel) models.GameChannel {
		name := "Gopher"
		for index := range game.Info.Classic.Teams {
			if game.Info.Classic.Teams[index].Players[1] == nil {
				var profile = models.Profile{Email: name}
				rand.Seed(time.Now().UnixNano())
				personnality := personnalities[rand.Intn(nPersonnalities)]
				game.Info.Classic.Teams[index].Players[1] = &models.Player{Profile: profile, IsVirtual: true, Personnality: personnality}
				name = "Tux"
			}
		}
		if len(game.Clients) == 2 {
			// Set first CPU as drawer
			game.Info.Classic.Drawer = game.Info.Classic.Teams[0].Players[1]
		}
		return game
	})
}
