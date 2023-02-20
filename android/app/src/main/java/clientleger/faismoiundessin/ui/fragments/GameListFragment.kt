package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.GameInfo
import clientleger.faismoiundessin.repository.data.NewGameInfo
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.adapters.GameRecyclerAdapter
import kotlinx.android.synthetic.main.fragment_game_list.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class GameListFragment : Fragment() {

    private var layoutManager: RecyclerView.LayoutManager? = null
    private var adapter: RecyclerView.Adapter<GameRecyclerAdapter.ViewHolder>? = null

    val ml: MutableLiveData<MutableList<JSONObject>> = MutableLiveData<MutableList<JSONObject>>()

    private val args: GameListFragmentArgs by navArgs()

    private lateinit var typeFilter: String
    private lateinit var difficultyFilter: String

    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    private lateinit var gameInfo: GameInfo
    private var createGameInfo: NewGameInfo = NewGameInfo("", "")


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_game_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        gameInfo = GameInfo(
            arrayListOf(),
            arrayListOf(),
            arrayListOf(),
            arrayListOf(),
            arrayListOf(),
            arrayListOf()
        )

        typeFilter = args.type
        difficultyFilter = args.difficulty

        createGameInfo.difficulty = difficultyFilter
        createGameInfo.type = typeFilter

        filterGames()
        ml.observe(viewLifecycleOwner,
            {
                if (ml.value?.isNotEmpty() == true) {
                    parseGameInfo(ml.value!!)
                    recycler_view.apply {
                        layoutManager = LinearLayoutManager(activity)
                        adapter = GameRecyclerAdapter(gameInfo)
                    }
                }
            })

        val refreshButton = view.findViewById<Button>(R.id.refresh_button)
        refreshButton.setOnClickListener {
            gameInfo.type.clear()
            gameInfo.difficulty.clear()
            gameInfo.humanPlayers.clear()
            gameInfo.virtualPlayers.clear()
            gameInfo.gameID.clear()
            gameInfo.chatID.clear()
            filterGames()
        }

        val createButton = view.findViewById<Button>(R.id.create_button)
        createButton.setOnClickListener {
            createGame()
            Handler(Looper.getMainLooper()).postDelayed(
                {
                    gameInfo.type.clear()
                    gameInfo.difficulty.clear()
                    gameInfo.humanPlayers.clear()
                    gameInfo.virtualPlayers.clear()
                    gameInfo.gameID.clear()
                    gameInfo.chatID.clear()
                    filterGames()
                },
                250
            )
        }

    }

    private fun filterGames() {
        uiScope.launch(Dispatchers.IO) {
            val filtered: MutableList<JSONObject> = ArrayList()
            try {
                val games = JSONArray(HttpService.makeGameInfoRequest())

                if (games.length() > 0) {
                    for (i in 0 until games.length()) {
                        val obj: JSONObject = games.getJSONObject(i)
                        val type: String = obj.getString("type")
                        val difficulty: String = obj.getString("difficulty")

                        if (type == typeFilter && difficulty == difficultyFilter) {
                            filtered.add(obj)
                        }
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
            ml.postValue(filtered)
        }
    }

    private fun createGame() {
        uiScope.launch(Dispatchers.IO) {
            try {
                HttpService.makeNewGameRequest(createGameInfo)
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }

    @Suppress("UseWithIndex")

    private fun parseGameInfo(gameList: MutableList<JSONObject>) {
        for (game in gameList) {
            gameInfo.type.add(game.getString("type"))
            gameInfo.difficulty.add(game.getString("difficulty"))
            gameInfo.humanPlayers.add(game.getString("humanPlayers"))
            gameInfo.virtualPlayers.add(game.getString("virtualPlayers"))
            gameInfo.gameID.add(game.getString("gameID"))
            gameInfo.chatID.add(game.getString("chatID"))
        }
    }
}
