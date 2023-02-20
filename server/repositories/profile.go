package repositories

import (
	"context"
	"log"
	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateProfile : Inserts a new user in the DB
func CreateProfile(user models.Register) (*mongo.InsertOneResult, error) {
	return GetProfiles().InsertOne(context.TODO(), registerToProfile(user))
}

// GetProfile : Prompts DB to fetch a user given his email
func ReadProfile(email string) (bson.M, error) {
	var registeredUser bson.M
	err := GetProfiles().FindOne(context.TODO(), bson.M{"email": email}).Decode(&registeredUser)
	return registeredUser, err
}

// GetProfile : Prompts DB to fetch a user given his email
func GetProfile(email string) (models.Profile, error) {
	var registeredUser models.Profile
	err := GetProfiles().FindOne(context.TODO(), bson.M{"email": email}).Decode(&registeredUser)
	return registeredUser, err
}

// GetProfiles : Prompts DB to fetch all stored users
func GetProfiles() *mongo.Collection {
	return mongoClient.Database("LOG3900").Collection("profiles")
}

// IncludesUsername : Searches in DB if given username exists among registered users
func IncludesUsername(username string) bool {
	var registeredUser models.Profile
	GetProfiles().FindOne(context.TODO(), bson.M{"pseudo": username}).Decode(&registeredUser)
	return registeredUser.Public.Pseudo != ""
}

// read all users in the db
func ReadUsers(opts *options.FindOptions) []bson.M {
	var results []bson.M
	cursor, err := GetProfiles().Find(context.TODO(), bson.M{}, opts)
	if err != nil {
		log.Println("[ERROR]", err)
	}
	if err = cursor.All(context.TODO(), &results); err != nil {
		log.Println("[ERROR]", err)
		log.Println(results)
	}
	return results
}

func GetProfileStatistics(email string) models.UserStatistics {
	filter := bson.M{"email": email}
	projection := bson.D{
		{"statistics", 1},
	}
	opts := options.FindOne().SetProjection(projection)
	var stats models.UserStatistics
	err := GetProfiles().FindOne(context.TODO(), filter, opts).Decode(&stats)
	log.Println("[ERROR]", stats, err)
	return stats
}

// UpdateProfileChat : add a chat to profile history
func UpdateProfileChat(email string, chatID uint64) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"history.chatchannels": chatID}}
	GetProfiles().UpdateOne(context.TODO(), filter, update)
}

func UpdateProfiletrophies(email string, trophy string) (*mongo.UpdateResult, error) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"trophies": trophy}}
	return GetProfiles().UpdateOne(context.TODO(), filter, update)
}
