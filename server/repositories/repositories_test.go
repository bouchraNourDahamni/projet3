package repositories

import (
	"reflect"
	"server/models"
	"testing"
	"time"
)

func TestGetNewStatistics(t *testing.T) {
	oneMinute := time.Duration(1 * time.Minute)
	averageUser := models.UserStatistics{Games: 1, Wins: 1, Losts: 0, WinRatio: 1, AvarageTime: oneMinute, TotalTime: oneMinute}
	veteranUser := models.UserStatistics{Games: 2, Wins: 1, Losts: 1, WinRatio: 1, AvarageTime: oneMinute, TotalTime: time.Duration(2 * time.Minute)}
	tt := []struct {
		name          string
		stats         models.UserStatistics
		win           bool
		gameDuration  time.Duration
		expectedStats models.UserStatistics
	}{
		{"first game", models.UserStatistics{}, true, oneMinute, averageUser},
		{"loss", averageUser, false, oneMinute, veteranUser},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			result := getNewStatistics(tc.stats, tc.win, tc.gameDuration)
			if !reflect.DeepEqual(result, tc.expectedStats) {
				t.Errorf("expected: %v; got %v", tc.expectedStats, result)
			}
		})
	}
}
