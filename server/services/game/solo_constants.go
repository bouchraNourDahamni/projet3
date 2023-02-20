package game

import (
	"server/models"
	"time"
)

const (
	// Attempts
	easySoloModeAttempts   = 5
	normalSoloModeAttempts = 3
	hardSoloModeAttempts   = 1

	// Bonus time
	easySoloModeBonus   = 8
	normalSoloModeBonus = 6
	hardSoloModeBonus   = 4

	// Initial time
	easySoloModeTime   = time.Duration(2 * time.Minute)
	normalSoloModeTime = time.Duration(time.Minute)
	hardSoloModeTime   = time.Duration(30 * time.Second)
)

func getBonusTime(difficulty models.GameDifficulty) time.Duration {
	switch difficulty {
	case models.EASY:
		return easySoloModeBonus * time.Second
	case models.MEDIUM:
		return normalSoloModeBonus * time.Second
	case models.HARD:
		return hardSoloModeBonus * time.Second
	}
	return 0
}

func getAttempts(difficulty models.GameDifficulty) int {
	switch difficulty {
	case models.EASY:
		return easySoloModeAttempts
	case models.MEDIUM:
		return normalSoloModeAttempts
	case models.HARD:
		return hardSoloModeAttempts
	}
	return 0
}

func getInitialTime(difficulty models.GameDifficulty) time.Duration {
	switch difficulty {
	case models.EASY:
		return easySoloModeTime
	case models.MEDIUM:
		return normalSoloModeTime
	case models.HARD:
		return hardSoloModeTime
	}
	return 0
}
