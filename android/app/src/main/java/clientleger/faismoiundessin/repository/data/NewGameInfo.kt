package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class NewGameInfo(var type: String, var difficulty: String)
