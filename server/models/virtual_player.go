package models

// Personnality : vitrual player personality
type Personnality string

// Personnality : options
const (
	COCKY    Personnality = "cocky"
	FRIENDLY Personnality = "friendly"
	SHY      Personnality = "shy"
	EUPHORIC Personnality = "euphoric"
)

// Purpose : describes the context needed for the message
type Purpose string

// Purpose : options
const (
	GREET         Purpose = "greet"
	REMINISCE     Purpose = "reminisce"    // Refer to past events
	STATS_COMMENT Purpose = "statsComment" // Comment about one's stats
	ROUND_WIN     Purpose = "roundWin"
	GAME_WIN      Purpose = "gameWin"
)

// VPlayerInteraction : Information allowing to fetch a message according to the context and personnality of the vPlayer
type VPlayerInteraction struct {
	Personnality Personnality `json:"personnality"`
	Purpose      Purpose      `json:"purpose"`
	Messages     []string     `json:"messages"`
}
