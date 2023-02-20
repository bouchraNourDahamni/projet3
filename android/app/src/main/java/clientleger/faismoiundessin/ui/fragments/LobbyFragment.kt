package clientleger.faismoiundessin.ui.fragments

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.activity.addCallback
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.navigation.findNavController
import androidx.navigation.fragment.navArgs
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.service.GameSocketListener
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class LobbyFragment : Fragment() {
    private lateinit var email: String
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private lateinit var gameSocketListener: GameSocketListener
    private val args: LobbyFragmentArgs by navArgs()
    lateinit var gameID: String
    lateinit var chatID: String
    private val game: MutableLiveData<JSONObject> = MutableLiveData<JSONObject>()
    private val lobby: MutableLiveData<JSONObject> = MutableLiveData<JSONObject>()
    private var solo: Boolean = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.lobby, container, false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setMenuVisibility(false)
        setHasOptionsMenu(false)
    }

    @SuppressLint("SetTextI18n")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = (activity as MainActivity).email
        (activity as MainActivity).lobby = true

        gameID = args.gameID
        chatID = args.chatID

        gameSocketListener = (activity as MainActivity).gameSocketListener
        gameSocketListener.joinLobby(gameID, email)

        activity?.actionBar?.setDisplayShowTitleEnabled(false)
        setHasOptionsMenu(false)

        val startButton = view.findViewById<Button>(R.id.bt_start)
        startButton.setOnClickListener {
            uiScope.launch(Dispatchers.IO) { HttpService.makeStartGameRequest(gameID) }
        }

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
            gameSocketListener.closeSocket()
            (activity as MainActivity).lobby = false
            navBack()
            deleteGameChat()
        }
        val humanPlayer = view.findViewById<TextView>(R.id.human)
        val virtualPlayer = view.findViewById<TextView>(R.id.virtual)
        val mode = view.findViewById<TextView>(R.id.mode)
        val difficulty = view.findViewById<TextView>(R.id.difficulte)
        val player1 = view.findViewById<TextView>(R.id.email1)
        val player2 = view.findViewById<TextView>(R.id.email2)
        val player3 = view.findViewById<TextView>(R.id.email3)
        val player4 = view.findViewById<TextView>(R.id.email4)
        val textGameId = view.findViewById<TextView>(R.id.gameID)
        textGameId.text = "Identifiant de la partie: $gameID"

        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                R.drawable.frame_lobby
            )
        }, 50)
        game.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    mode.text = "Mode: " + game.value?.getString("type")
                    if (game.value?.getString("type") == "Solo")
                        solo = true
                    difficulty.text = "Difficulté: " + game.value?.getString("difficulty")
                }
            })

        lobby.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    val numberOfHumans = lobby.value?.getInt("humansPlayers")
                    humanPlayer.text =
                        numberOfHumans.toString() + " joueurs humains"
                    if (solo) {
                        virtualPlayer.text = ""
                    } else {
                        virtualPlayer.text =
                            lobby.value?.getInt("virtualPlayers").toString() + " joueurs virtuels"
                    }
                    if (numberOfHumans != null) {
                        if (numberOfHumans > 0) {
                            val emails = lobby.value?.getJSONArray("emails")
                            if (emails != null) {
                                player1.text =
                                    emails.getString(0)
                                if (numberOfHumans > 1) {
                                    player2.text =
                                        emails.getString(1)
                                    if (numberOfHumans > 2) {
                                        player3.text =
                                            emails.getString(2)
                                        if (numberOfHumans > 3) {
                                            player4.text =
                                                emails.getString(3)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            })
        getGameInfo()
        Handler(Looper.getMainLooper()).postDelayed({
            getLobbyInfo()
        }, 150)

        ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).channelList.chatName.add(
            "Partie en cours"
        )
        ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).channelList.chatID.add(
            chatID
        )
        ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).channelList.isSelected.add(
            true
        )
        ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).getAllChannels()

        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).changeChat(
                chatID
            )
        }, 150)
    }

    private fun deleteGameChat() {
        val channels =
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).channelList
        for (i in 0 until channels.chatName.size) {
            if (i <= channels.chatName.lastIndex) {
                if (channels.chatName[i] == "Partie en cours") {
                    channels.chatName.removeAt(i)
                    channels.chatID.removeAt(i)
                    channels.isSelected.removeAt(i)
                }
            }
        }
        ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).getAllChannels()
    }

    fun navToDraw() {
        val currentGame = gameID
        (activity as MainActivity).lobby = false
        val action = LobbyFragmentDirections.actionLobbyFragmentToDrawFragment(currentGame)
        view?.findNavController()?.navigate(action)
    }

    private fun navBack() {
        val action = LobbyFragmentDirections.actionLobbyFragmentToMainMenuFragment()
        view?.findNavController()?.navigate(action)
    }

    private fun getGameInfo() {
        uiScope.launch(Dispatchers.IO) {
            try {
                val games = JSONArray(HttpService.makeGameInfoRequest())

                if (games.length() > 0) {
                    for (i in 0 until games.length()) {
                        val obj: JSONObject = games.getJSONObject(i)
                        val type: String = obj.getString("gameID")
                        if (type == gameID) {
                            game.postValue(obj)
                        }
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }

    fun getLobbyInfo() {
        uiScope.launch(Dispatchers.IO) {
            try {
                val lobbyInfo = JSONObject(HttpService.makeLobbyUpdateRequest(gameID))

                if (lobbyInfo.length() > 0) {
                    lobby.postValue(lobbyInfo)
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }

}
