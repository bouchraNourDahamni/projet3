package main

import (
	"reflect"
	"server/controllers"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitializeRouter(t *testing.T) {
	router := controllers.InitializeRouter()

	expected := "*mux.Router"
	actual := reflect.TypeOf(router).String()
	assert.Equal(t, expected, actual, "Expected router to be "+expected+" got: "+actual)
}
