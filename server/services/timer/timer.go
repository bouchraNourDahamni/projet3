// Stolen from :
// https://stackoverflow.com/questions/34890589/how-do-i-find-the-time-remaining-for-a-timer-to-fire

package timer

import "time"

// SecondsTimer : Special timer used to keep track of remaining time
type SecondsTimer struct {
	timer *time.Timer
	End   time.Time
}

// NewSecondsTimer : Instanciates a new SecondsTimer
func NewSecondsTimer(t time.Duration) *SecondsTimer {
	return &SecondsTimer{time.NewTimer(t), time.Now().Add(t)}
}

// Reset : put back original values
func (s *SecondsTimer) Reset(t time.Duration) {
	s.timer.Reset(t)
	s.End = time.Now().Add(t)
}

// Stop : stop the timer
func (s *SecondsTimer) Stop() {
	s.timer.Stop()
}

// TimeRemaining : returns the remaining time of the current timer
func (s *SecondsTimer) TimeRemaining() time.Duration {
	return s.End.Sub(time.Now())
}
