package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class TrophyRequest(var email: String, var trophy: String)
