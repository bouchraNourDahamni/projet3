package services

import (
	"encoding/json"
	"net/http"
	"server/repositories"
)

func MostGameLeaderBoard(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(repositories.ReadMostGames())
}

func WinRateLeaderBoard(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(repositories.ReadWinRate())
}

func AverageTimeLeaderBoard(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(repositories.ReadAverageTime())
}

func MostTimeLeaderBoard(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(repositories.ReadMostTime())
}
