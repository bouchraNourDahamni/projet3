package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class GameInfo(
    var type: ArrayList<String>,
    var difficulty: ArrayList<String>,
    var humanPlayers: ArrayList<String>,
    var virtualPlayers: ArrayList<String>,
    var gameID: ArrayList<String>,
    var chatID: ArrayList<String>
)
