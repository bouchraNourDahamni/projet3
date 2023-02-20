package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class AddUsers(var email: String, var chatID: Int)
