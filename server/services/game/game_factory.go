package game

import (
	"server/models"
)

func gameFactory(request models.NewGameRequest, gameID uint64, chatID uint64) (game models.GameChannel) {
	game = models.GameChannel{
		Clients: make(map[string]*models.Player), // connected clients
		Strokes: make(chan models.Stroke),
		Info: models.GameInfo{
			Type:        request.Type,
			Difficulty:  request.Difficulty,
			GameID:      gameID,
			ChatID:      chatID,
			TurnCounter: 1,
			State:       models.WAITING,
			WordToGuess: models.Pair{Word: "", Strokes: make([]models.Stroke, 0)},
		},
		EndTurn:  make(chan bool),
		NextTurn: make(chan bool),
	}
	if request.Type == models.CLASSIC {
		classicModeFactory(&game)
	} else if request.Type == models.SOLO {
		soloModeFactory(&game)
	}
	return game
}

func classicModeFactory(game *models.GameChannel) {
	game.Info.Classic.Teams = make([]models.Team, 2)
	for index := range game.Info.Classic.Teams {
		game.Info.Classic.Teams[index].Players = make([]*models.Player, 2)
	}
	game.History = &models.ClassicGameHistory{Players: make([]string, 0), Result: make(map[string]models.Result)}
}

func soloModeFactory(game *models.GameChannel) {
	switch game.Info.Difficulty {
	case models.EASY:
		game.Info.Solo.Attempts = getAttempts(models.EASY)
	case models.MEDIUM:
		game.Info.Solo.Attempts = getAttempts(models.MEDIUM)
	case models.HARD:
		game.Info.Solo.Attempts = getAttempts(models.HARD)
	}
	game.History = &models.SoloGameHistory{}
}
