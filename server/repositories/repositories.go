package repositories

import (
	"context"
	"log"
	"time"

	// MongoDB
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	// modules
	"server/models"
)

const (
	connectionURI = "mongodb+srv://test-user:hEqXu9GGJaU6sZ2X@cluster0.yt6b2.mongodb.net/LOG3900?retryWrites=true&w=majority"
)

var (
	mongoClient *mongo.Client
)

// Init : Establishes new connection to DB
func Init() (*mongo.Client, context.Context) {
	client, err := mongo.NewClient(options.Client().ApplyURI(connectionURI))
	mongoClient = client
	if err != nil {
		log.Fatal("[FATAL] error (hint: can't connect to server):", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err = client.Connect(ctx); err != nil {
		log.Fatal("[FATAL] error (hint: can't connect to server):", err)
	}
	defer cancel()
	return client, ctx
}

func registerToProfile(register models.Register) models.Profile {
	if register.Avatar == "" {
		register.Avatar = "/avatar/default.jpg"
	}
	return models.Profile{
		Email: register.Email,
		Public: models.UserPublicInformation{
			Pseudo: register.Pseudo,
			Avatar: register.Avatar,
		},
		Private: models.UserPrivateInformation{
			LastName:  register.LastName,
			FirstName: register.FirstName,
			Password:  register.Password,
		},
		History: models.UserHistory{
			CreationDate:  time.Now(),
			Connections:   []time.Time{},
			Deconnections: []time.Time{},
			GamesHistory: models.DeadGameHistory{
				Classic: []models.ClassicGameHistory{},
				Solo:    []models.SoloGameHistory{},
			},
			ChatChannels: []uint64{1},
		},
		Trophies: []string{},
	}
}

// UpdateLoginLogs : log the last login
func UpdateLoginLogs(email string, loginDate time.Time) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"history.connections": loginDate}}
	users := GetProfiles()
	users.UpdateOne(context.TODO(), filter, update)
}

// UpdateDeconnectionLogs : log the deconnection
func UpdateDeconnectionLogs(email string, deconnectionDate time.Time) {
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"history.deconnections": deconnectionDate}}
	users := GetProfiles()
	users.UpdateOne(context.TODO(), filter, update)
}

// IncludesEmail : Searches in DB if given email exists among registered users
func IncludesEmail(email string) bool {
	collection := GetProfiles()
	opResult := collection.FindOne(context.TODO(), bson.M{"email": email})
	return opResult.Err() != mongo.ErrNoDocuments
}

// GetDrawings : Prompts DB to fetch all stored word-image pairs
func GetDrawings() *mongo.Collection {
	return mongoClient.Database("LOG3900").Collection("wordImagePairs")
}

// GetDrawing :  Prompts DB to fetch a word-image pair given the image's word
func GetDrawing(word string) models.Pair {
	var pair models.Pair
	collection := GetDrawings()
	collection.FindOne(context.TODO(), bson.M{"word": word}).Decode(&pair)
	return pair
}

// GetPairsFromChosenDifficulty :  Prompts DB to fetch all word-image pairs given the desired difficulty
func GetPairsFromChosenDifficulty(difficulty string) map[int]models.Pair {
	results := make(map[int]models.Pair)
	collection := GetDrawings()
	cursor, err := collection.Find(context.TODO(), bson.M{"difficulty": difficulty})
	if err != nil {
		log.Println("[ERROR] Could not fetch pairs with ", difficulty, "difficulty (", err, ")")
	}

	index := 0

	for cursor.Next(context.TODO()) {
		var pair models.Pair
		err := cursor.Decode(&pair)
		if err != nil {
			log.Println("[ERROR]", err)
		}
		results[index] = pair
		index++
	}
	cursor.Close(context.TODO())
	return results
}

// InsertPair : Inserts in DB a new word-image pair
func InsertPair(pair models.Pair) {
	log.Println("Pair inserted")
	collection := GetDrawings()
	collection.InsertOne(context.TODO(), pair)
}

// UpdatePassword : Change user password in db
func UpdatePassword(info models.Login) *mongo.SingleResult {
	filter := bson.M{"email": info.Email}
	update := bson.M{"$set": bson.M{"private.password": info.Password}}
	return GetProfiles().FindOneAndUpdate(context.TODO(), filter, update)
}
