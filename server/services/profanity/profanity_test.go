package profanity

import "testing"

func BenchmarkIsInappropriate(b *testing.B) {
	for i := 0; i < b.N; i++ {
		if !IsInappropriate("salut je vais faire un sacre a la toute fin de ce text afin de savoir la performance de notre filtre anti chat dans une situation difficile pour le filtre en general tabarnak") {
			b.Error("doesn't detect tabarnak")
		}
	}
}
