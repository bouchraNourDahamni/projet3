package clientleger.faismoiundessin.repository.data

import kotlinx.serialization.Serializable

@Serializable
data class DrawingInfo(
    var pathdata: ArrayList<PointInfo>,
    var color: String,
    var size: Int,
    var opacity: Float,
    var action: String = ""
)





