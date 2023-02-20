package repositories

import (
	"context"
	"math/rand"
	"server/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func getVPlayerPhrasesCollection() *mongo.Collection {
	return mongoClient.Database("LOG3900").Collection("vPlayerPhrases")
}

func GetVPlayerMessage(purpose models.Purpose, personnality models.Personnality) string {
	var interaction models.VPlayerInteraction
	getVPlayerPhrasesCollection().FindOne(context.TODO(), bson.M{"personnality": personnality, "purpose": purpose}).Decode(&interaction)
	rand.Seed(time.Now().UnixNano())
	return interaction.Messages[rand.Intn(len(interaction.Messages))]
}
