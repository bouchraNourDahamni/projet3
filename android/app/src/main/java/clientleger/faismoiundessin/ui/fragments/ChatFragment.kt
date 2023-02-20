package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ListView
import android.widget.TextView
import androidx.fragment.app.Fragment
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.adapters.MessageAdapter
import kotlinx.android.synthetic.main.chat.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONException
import org.json.JSONObject

class ChatFragment : Fragment() {
    lateinit var adapter: MessageAdapter
    lateinit var email: String
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        email = (activity as MainActivity).email

        val messageList = view.findViewById<ListView>(R.id.messageList)
        val messageBox = view.findViewById<EditText>(R.id.messageBox)
        val chatButton = view.findViewById<TextView>(R.id.chat_button)
        val guessButton = view.findViewById<TextView>(R.id.send_guess_button)
        val tipButton = view.findViewById<TextView>(R.id.ask_tip_button)

        adapter = MessageAdapter(this)
        messageList.adapter = adapter

        chatButton.setOnClickListener {
            sendMessage()
        }

        messageBox.setOnKeyListener { _, keyCode, event ->
            if (event.action == KeyEvent.ACTION_DOWN) {
                when (keyCode) {
                    KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
                        sendMessage()
                        return@setOnKeyListener true
                    }
                    else -> {
                    }
                }
            }
            return@setOnKeyListener false
        }

        guessButton.setOnClickListener {
            val message: String = messageBox.text.toString()

            if (message.trim { it <= ' ' } != "") {
                val obj = JSONObject()
                try {
                    obj.put("email", email)
                    obj.put("username", email)
                    obj.put("message", message)
                } catch (e: JSONException) {
                    e.printStackTrace()
                }
                uiScope.launch(Dispatchers.IO) {
                    val gameID = (activity as MainActivity).gameSocketListener.currentGameId
                    HttpService.makeGuessRequest(obj.toString(), gameID)
                }
                this.adapter.notifyDataSetChanged()
            }
            messageBox.setText("")
        }

        tipButton.setOnClickListener {
            uiScope.launch(Dispatchers.IO) {
                val gameID = (activity as MainActivity).gameSocketListener.currentGameId
                HttpService.makeGuessTipRequest(gameID)
            }
            this.adapter.notifyDataSetChanged()
        }
    }

    private fun sendMessage() {
        val message: String = messageBox.text.toString()

        if (message.trim { it <= ' ' } != "") {
            val obj = JSONObject()
            try {
                obj.put("email", email)
                obj.put("username", email)
                obj.put("message", message)
            } catch (e: JSONException) {
                e.printStackTrace()
            }
            (activity as MainActivity).chatSocketListener.currentWs.send(obj.toString())
            this.adapter.notifyDataSetChanged()
        }
        messageBox.setText("")
    }
}
