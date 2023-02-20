package repositories

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ReadMostGames() []bson.M {
	projection := bson.D{
		{"email", 1},
		{"statistics.games", 1},
	}
	opts := options.Find().SetProjection(projection)
	opts.SetSort(bson.D{{"statistics.games", -1}})
	return ReadUsers(opts)
}

func ReadWinRate() []bson.M {
	projection := bson.D{
		{"email", 1},
		{"statistics.winratio", 1},
	}
	opts := options.Find().SetProjection(projection)
	opts.SetSort(bson.D{{"statistics.winratio", -1}})
	return ReadUsers(opts)
}

func ReadAverageTime() []bson.M {
	projection := bson.D{
		{"email", 1},
		{"statistics.avaragetime", 1},
	}
	opts := options.Find().SetProjection(projection)
	opts.SetSort(bson.D{{"statistics.avaragetime", -1}})
	return ReadUsers(opts)
}

func ReadMostTime() []bson.M {
	projection := bson.D{
		{"email", 1},
		{"statistics.totaltime", 1},
	}
	opts := options.Find().SetProjection(projection)
	opts.SetSort(bson.D{{"statistics.totaltime", -1}})
	return ReadUsers(opts)
}
