package clientleger.faismoiundessin.repository.service

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import clientleger.faismoiundessin.ui.fragments.ChatFragment
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import okhttp3.*
import org.json.JSONException
import org.json.JSONObject

class ChatSocketListener(private var fragment: ChatFragment) : WebSocketListener() {
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    lateinit var currentWs: WebSocket
    private val wsMap: MutableMap<String, WebSocket> = mutableMapOf()

    fun instantiateWebSocket(chatID: String) {
        fragment.adapter.messagesList.clear()
        val client = OkHttpClient()

        val request: Request =
            Request.Builder().url("ws://drawitup.ddns.net/chat/join/$chatID").build()
        val socketListener = ChatSocketListener(fragment)

        wsMap[chatID] = client.newWebSocket(request, socketListener)

        try {
            this.currentWs.close(1000, "Chat has been changed")
        } catch (e: java.lang.Exception) {
            Log.e("Chat does not exist", e.toString())
        }
        this.currentWs = wsMap[chatID]!!
        fragment.adapter.notifyDataSetChanged()
    }

    private fun getHistory(chatID: String) {
        uiScope.launch(Dispatchers.IO) {
            try {
                val jsonObject = JSONObject(HttpService.makeChatInfoRequest(chatID))
                val jsonArray = jsonObject.getJSONArray("history")

                for (i in 0 until jsonArray.length()) {
                    onMessage(currentWs, jsonArray[i].toString())
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onOpen(webSocket: WebSocket, response: Response) {
        fragment.activity?.runOnUiThread {
            Handler(Looper.getMainLooper()).postDelayed({
                Toast.makeText(
                    fragment.activity,
                    "Connexion au clavardage établie!",
                    Toast.LENGTH_LONG
                ).show()
                fragment.adapter.notifyDataSetChanged()
            }, 1000)
        }
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
        fragment.activity?.runOnUiThread {
            try {
                val jsonObject = JSONObject(text)
                jsonObject.put("byServer", jsonObject.get("email") != fragment.email)

                fragment.adapter.addItem(jsonObject)
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }

}
