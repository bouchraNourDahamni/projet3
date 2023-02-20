package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.RadioButton
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.navigation.findNavController
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.NewGameInfo
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONException
import org.json.JSONObject

class GameOptionsFragment : Fragment(), View.OnClickListener {
    private val gameInfo: NewGameInfo = NewGameInfo("Classique", "Moyen")
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private val game: MutableLiveData<JSONObject> = MutableLiveData<JSONObject>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val rootView: View = inflater.inflate(R.layout.game_options, container, false)
        rootView.findViewById<RadioButton>(R.id.radioButtonClassique).setOnClickListener(this)
        rootView.findViewById<RadioButton>(R.id.radioButtonSolo).setOnClickListener(this)
        rootView.findViewById<RadioButton>(R.id.radioButtonEasy).setOnClickListener(this)
        rootView.findViewById<RadioButton>(R.id.radioButtonMedium).setOnClickListener(this)
        rootView.findViewById<RadioButton>(R.id.radioButtonHard).setOnClickListener(this)

        return rootView
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val createButton = view.findViewById<Button>(R.id.create_button)
        createButton.setOnClickListener {
            navToGameList(gameInfo.type, gameInfo.difficulty)
        }
        val email = (activity as MainActivity).email
        game.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    val gameID = game.value?.getInt("gameID").toString()
                    val chatID = game.value?.getInt("chatID").toString()
                    (activity as MainActivity).makeSolo()
                    val gameSocketListener = (activity as MainActivity).gameSocketListener
                    gameSocketListener.joinLobby(gameID, email)

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

                    ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).changeChat(
                        chatID
                    )

                    Handler(Looper.getMainLooper()).postDelayed({
                        uiScope.launch(Dispatchers.IO) { HttpService.makeStartGameRequest(gameID) }
                        val action =
                            GameOptionsFragmentDirections.actionGameOptionsFragmentToDrawFragment(
                                gameID
                            )
                        view.findNavController().navigate(action)
                    }, 250)

                }
            })
    }

    override fun onClick(view: View?) {
        val checked: Boolean = (view as RadioButton).isChecked
        if (checked) {
            when (view.id) {
                R.id.radioButtonClassique -> gameInfo.type = "Classique"
                R.id.radioButtonSolo -> gameInfo.type = "Solo"
                R.id.radioButtonEasy -> gameInfo.difficulty = "Facile"
                R.id.radioButtonMedium -> gameInfo.difficulty = "Moyen"
                R.id.radioButtonHard -> gameInfo.difficulty = "Difficile"
            }
        }
    }

    private fun navToGameList(type: String, difficulty: String) {
        if (gameInfo.type == "Solo") {
            uiScope.launch(Dispatchers.IO) {
                try {
                    val obj = JSONObject(HttpService.makeNewGameRequest(gameInfo))
                    game.postValue(obj)
                } catch (e: JSONException) {
                    e.printStackTrace()
                }
            }

        } else {
            val action = GameOptionsFragmentDirections.actionGameOptionsFragmentToGameListFragment(
                type,
                difficulty
            )
            view?.findNavController()?.navigate(action)
        }

    }

}
