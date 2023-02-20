package services

import (
	"server/services/session"
	"testing"
)

func TestIsUserConnected(t *testing.T) {
	tt := []struct {
		name        string
		email       string
		isConnected bool
	}{
		{"user not connected", "wrong@gmail.com", false},
	}
	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			isConnected := session.IsUserConnected(tc.email)
			if isConnected != tc.isConnected {
				t.Errorf("expected %v; got %v", tc.isConnected, isConnected)
			}
		})
	}
}
