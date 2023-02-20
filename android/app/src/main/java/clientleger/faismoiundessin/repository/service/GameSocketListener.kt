package clientleger.faismoiundessin.repository.service

import clientleger.faismoiundessin.repository.data.DrawingInfo
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.utils.UndoRedoUtils
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONException


class GameSocketListener(private var activity: MainActivity) : WebSocketListener() {
    lateinit var ws: WebSocket
    private val client = OkHttpClient()
    var currentGameId = "0"

    fun joinLobby(gameId: String, email: String) {
        currentGameId = gameId
        val request: Request =
            Request.Builder().url("ws://drawitup.ddns.net/game/connect/$gameId/$email").build()
        val socketListener = GameSocketListener(activity)
        this.ws = client.newWebSocket(request, socketListener)
    }

    fun closeSocket() {
        this.ws.cancel()
    }

    override fun onMessage(webSocket: WebSocket, data: String) {
        val drawing: DrawingInfo = jacksonObjectMapper().readValue(data)
        activity.runOnUiThread {
            try {
                when (drawing.action) {
                    "stroke" -> {
                        if (drawing.pathdata.size > 0) {
                            activity.drawing(drawing)
                        }
                    }
                    "undo" -> {
                        UndoRedoUtils.undo()
                        activity.reconstitute()
                    }
                    "redo" -> {
                        UndoRedoUtils.redo()
                        activity.reconstitute()
                    }
                    "save" -> {
                        UndoRedoUtils.registerAction(drawing)
                    }
                    else -> {
                        if (drawing.pathdata.size > 0) {
                            activity.drawing(drawing)
                        }
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }
}
