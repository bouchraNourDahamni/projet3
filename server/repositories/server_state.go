package repositories

import (
	"context"
	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	serverFilter = bson.M{"name": "current"}
)

func getServerState() *mongo.Collection {
	return mongoClient.Database("LOG3900").Collection("server")
}

// GetCurrentChatID : return the max id + 1 of the chat collection
func GetCurrentChatID() (uint64, error) {
	state, err := GetCurrentState()
	return state.StartChatID, err
}

// GetCurrentState : return the init state to reboot the server
func GetCurrentState() (models.Server, error) {
	var serverState models.Server
	err := getServerState().FindOne(context.TODO(), serverFilter).Decode(&serverState)
	return serverState, err
}

// UpdateCurrentChatID : increment init id
func UpdateCurrentChatID(id uint64) {
	update := bson.M{"$set": bson.M{"startChatID": id + 1}}
	getServerState().UpdateOne(context.TODO(), serverFilter, update)
}

// UpdateAddChatToState : add a new chat to restore
func UpdateAddChatToState(chatID uint64) (*mongo.UpdateResult, error) {
	update := bson.M{"$push": bson.M{"Chats": chatID}}
	return getServerState().UpdateOne(context.TODO(), serverFilter, update)
}

func DeleteChatState(chatID uint64) (*mongo.UpdateResult, error) {
	update := bson.M{"$pull": bson.M{"Chats": chatID}}
	return getServerState().UpdateOne(context.TODO(), serverFilter, update)
}
