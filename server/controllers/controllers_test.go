package controllers

import (
	"testing"
)

func TestInitializeRouter(t *testing.T) {
	result := InitializeRouter()
	if result == nil {
		t.Errorf("router not init")
	}
}
