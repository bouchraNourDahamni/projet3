package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class Channels(
    var chatID: MutableList<String>,
    var chatName: MutableList<String>,
    var isSelected: MutableList<Boolean>
)
