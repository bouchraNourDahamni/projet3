package game

import (
	"server/models"
	"server/services/store"
	"testing"
)

func TestHandleGame(t *testing.T) {
}

func TestHandleEndRound(t *testing.T) {
	store.InitStore()
	gameList := []models.GameChannel{
		{
			Info: models.GameInfo{
				GameID:      1,
				TurnCounter: 7,
			},
		},
		{
			Info: models.GameInfo{
				GameID:      2,
				TurnCounter: 1,
			},
		},
	}
	expected := []bool{true, false}
	for index := range gameList {
		gameID := gameList[index].Info.GameID
		store.InsertGame(gameID, gameList[index])
		EOG := handleEndRound(gameID, new(bool))
		if EOG != expected[index] {
			t.Errorf("end of game is %v; got %v", expected[index], EOG)
		}
	}
}

// FIXME Weird datarace error
func TestUpdateGameScore(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping TestUpdateGameScore in short mode")
	}
	store.InitStore()
	game := models.GameChannel{
		Info: models.GameInfo{
			Classic: models.ClassicAttributes{
				Teams: []models.Team{
					{
						Players: []*models.Player{
							{
								Profile: models.Profile{
									Email: "1@gmail",
								},
							},
							{
								Profile: models.Profile{
									Email: "2@gmail",
								},
							},
						},
						Score: 2,
					},
					{
						Players: []*models.Player{
							{
								Profile: models.Profile{
									Email: "3@gmail",
								},
							},
							{
								Profile: models.Profile{
									Email: "4@gmail",
								},
							},
						},
						Score: 1,
					},
				},
			},
		},
		History: &models.ClassicGameHistory{
			Players: []string{"1@gmail", "2@gmail", "3@gmail", "4@gmail"},
			Result:  make(map[string]models.Result),
		},
	}
	store.InsertGame(game.Info.GameID, game)
	updateClassicGameScore(game.Info.GameID)
	expect := map[string]models.Result{
		"1@gmail": models.WIN,
		"2@gmail": models.WIN,
		"3@gmail": models.LOSS,
		"4@gmail": models.LOSS,
	}
	game, _, _ = store.GetGame(game.Info.GameID)
	for player, result := range expect {
		results := game.History.(models.ClassicGameHistory).Result
		if results[player] != result {
			winStatus := "lose"
			if result == models.WIN {
				winStatus = "win"
			}
			t.Error(player + " didn't " + winStatus)
		}
	}
}

// func TestCloseGame(t *testing.T) {
//     MakeGameChannel(models.NewGameRequest{

//     })
//     store.InsertGame()
//     closeGame()
// }
