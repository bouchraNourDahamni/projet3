package repositories

import (
	"context"
	"fmt"
	"log"
	"server/models"
	"server/services/store"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// CRUD -> create, read, update, delete

// UpdateGameInfo : add game result to every players
func UpdateGameInfo(gameID uint64) {
	game, _, _ := store.GetGame(gameID)
	gameHistory := game.History
	log.Println("updating game info for ", game.Clients)
	log.Println("gameHistory", gameHistory)
	for email, player := range game.Clients {
		if player.IsVirtual {
			continue
		}
		// Update history
		switch gameHistory := gameHistory.(type) {
		case *models.ClassicGameHistory:
			UpdateProfileClassicHistory(email, *gameHistory)
		case *models.SoloGameHistory:
			UpdateProfileSoloHistory(email, *gameHistory)
		default:
			log.Println("can't switch", gameHistory)
		}

		// Update stats
		elapse := getElapse(game.History)

		profile, err := GetProfile(email)
		if err != nil {
			// FIXME only bcs stats is before history ... but it works
			log.Println("issue with user ", profile, err)
		}
		stats := getNewStatistics(profile.Statistics, didUserWin(email, game.History), elapse)
		UpdateUserStatistics(email, stats)
	}
}

func getElapse(history models.ActiveGameHistory) time.Duration {
	switch history := history.(type) {
	case *models.ClassicGameHistory:
		return history.End.Sub(history.Start)
	case *models.SoloGameHistory:
		log.Println(history.End, history.Start, history.End.Sub(history.Start))
		return history.End.Sub(history.Start)
	default:
		log.Println("[ERROR][GETELAPSE] couldn't switch")
	}
	return 0
}

func didUserWin(email string, history models.ActiveGameHistory) bool {
	didUserWin := false
	switch history := history.(type) {
	case *models.ClassicGameHistory:
		didUserWin = history.Result[email] == models.WIN
	case *models.SoloGameHistory:
		didUserWin = history.Result > 0
	default:
		log.Println("[ERROR][DIDUSERWIN] couldn't switch")
	}
	return didUserWin
}

func UpdateUserHistory(email string, history models.DeadGameHistory) {
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"history.gamesHistory": history}} // FIXME should probably do a push
	if _, err := GetProfiles().UpdateOne(context.TODO(), filter, update); err != nil {
		log.Println("[ERROR]", email, "user history", err)
	}
}

func UpdateProfileClassicHistory(email string, history models.ClassicGameHistory) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"history.gamesHistory.classic": history}} // FIXME should probably do a push
	if _, err := GetProfiles().UpdateOne(context.TODO(), filter, update); err != nil {
		log.Println("[ERROR]", email, "user history", err)
	}
}

func UpdateProfileSoloHistory(email string, history models.SoloGameHistory) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"history.gamesHistory.solo": history}} // FIXME should probably do a push
	if _, err := GetProfiles().UpdateOne(context.TODO(), filter, update); err != nil {
		log.Println("[ERROR]", email, "user history", err)
	}
}

func getNewStatistics(stats models.UserStatistics, win bool, gameDuration time.Duration) models.UserStatistics {
	// wins
	if win {
		stats.Wins++
	} else {
		stats.Losts++
	}
	stats.Games++
	if stats.Losts == 0 {
		stats.WinRatio = float64(stats.Wins)
	} else {
		stats.WinRatio = float64(stats.Wins) / float64(stats.Losts)
	}
	// time
	stats.TotalTime += gameDuration
	totalnanoseconds := stats.TotalTime.Nanoseconds()
	averageNanoseconds := totalnanoseconds / int64(stats.Games)
	timeStamp := fmt.Sprint(averageNanoseconds) + "ns"
	averageTime, err := time.ParseDuration(timeStamp)
	if err != nil {
		log.Println("[ERROR] can't parse time duration in stats", err)
		return stats // just don't compute because brokey
	}
	stats.AvarageTime = averageTime
	return stats
}

func UpdateUserStatistics(email string, stats models.UserStatistics) {
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"statistics": stats}}
	if _, err := GetProfiles().UpdateOne(context.TODO(), filter, update); err != nil {
		log.Println("[ERROR]", email, "can't update user stats", err)
	}
}
