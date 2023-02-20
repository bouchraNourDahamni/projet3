package repositories

import (
	"context"
	"server/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	chatCollection = "chat"
)

// CreateChat : create a new chat
func CreateChat(chat models.ChatChannel) (*mongo.InsertOneResult, error) {
	return getChatCollection().InsertOne(context.TODO(), chat.ChatInfo)
}

// CreateDeadChat : add all the info of the chat
func CreateDeadChat(chatID uint64, history []models.Message) {
	info := historyToChatInfo(history)
	info.ID = chatID

	getChatCollection().InsertOne(context.TODO(), info)
	for _, email := range info.Members {
		UpdateProfileChat(email, info.ID)
	}
}

func historyToChatInfo(history []models.Message) models.ChatInfo {
	var start, end time.Time
	if len(history) != 0 {
		start = history[0].SendDate
		end = history[len(history)-1].SendDate
	} else {
		now := time.Now()
		start = now
		end = now
	}
	info := models.ChatInfo{
		History:   history,
		Members:   getHistoryMembers(history),
		StartDate: start,
		EndDate:   end,
	}
	return info
}

func getHistoryMembers(history []models.Message) []string {
	users := make(map[string]bool) // set
	for _, message := range history {
		users[message.Email] = true
	}
	members := make([]string, 0, len(users))
	for k := range users {
		members = append(members, k)
	}
	return members
}

// ReadChat : read the chat info in db
func ReadChat(chatID uint64) (models.ChatInfo, error) {
	var chatInfo models.ChatInfo
	filter := bson.M{"id": chatID}
	err := getChatCollection().FindOne(context.TODO(), filter).Decode(&chatInfo)
	return chatInfo, err
}

func getChatCollection() *mongo.Collection {
	return mongoClient.Database("LOG3900").Collection(chatCollection)
}

// UpdateChatHistory : update the chat history
func UpdateChatHistory(chatID uint64, history []models.Message) {
	updateChat(chatID, "$set", "history", history)

	members := getHistoryMembers(history)
	for _, email := range members {
		UpdateProfileChat(email, chatID)
	}
}

// UpdateChatName : change the chat name
func UpdateChatName(chatID uint64, name string) {
	updateChat(chatID, "$set", "name", name)
}

// UpdateMemberList : add mail to members list
func UpdateMemberList(chatID uint64, email string) {
	updateChat(chatID, "$push", "members", email)
}

func updateChat(chatID uint64, op, field string, info interface{}) {
	collection := mongoClient.Database("LOG3900").Collection(chatCollection)
	filter := bson.M{"id": chatID}
	update := bson.M{op: bson.M{field: info}}

	collection.FindOneAndUpdate(context.TODO(), filter, update)
}

func DeleteChat(chatID uint64) {
	// delete chat from server state
	DeleteChatState(chatID)
	// delete chat from chat (none issue)
	// delete chat from members
	update := bson.M{"$pull": bson.M{"history.chatchannels": chatID}}
	GetProfiles().UpdateMany(context.TODO(), bson.M{}, update)
}
