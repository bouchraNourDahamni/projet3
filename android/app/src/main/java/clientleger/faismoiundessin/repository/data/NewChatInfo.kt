package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class NewChatInfo(var name: String, var members: ArrayList<String>)
