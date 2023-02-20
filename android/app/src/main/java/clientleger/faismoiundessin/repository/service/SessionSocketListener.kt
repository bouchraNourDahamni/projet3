package clientleger.faismoiundessin.repository.service

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.media.MediaPlayer
import android.view.Gravity
import android.view.View
import android.widget.Toast
import androidx.lifecycle.MutableLiveData
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.EmailInfo
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.fragments.*
import clientleger.faismoiundessin.ui.utils.UndoRedoUtils.actions
import clientleger.faismoiundessin.ui.utils.UndoRedoUtils.actionsToRedo
import kotlinx.android.synthetic.main.chat.*
import kotlinx.android.synthetic.main.fragment_game_stats.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import okhttp3.*
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class SessionSocketListener(private var mainActivity: MainActivity) : WebSocketListener() {
    private lateinit var ws: WebSocket
    private var currentEmail: String = ""
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private val game: MutableLiveData<JSONObject> = MutableLiveData<JSONObject>()
    private var youGuess = false
    private var rightOfReply = false
    var solo = false
    private var difficulty: String? = ""
    private var firstCheck = true

    private var ad: AlertDialog? = null

    fun connectToSession(email: String) {
        currentEmail = email
        val client = OkHttpClient()

        val request: Request =
            Request.Builder().url("ws://drawitup.ddns.net/session/$currentEmail").build()
        val socketListener = SessionSocketListener(mainActivity)

        this.ws = client.newWebSocket(request, socketListener)
    }

    fun closeSocket() {
        this.ws.close(1000, "bye bye")
    }

    override fun onOpen(webSocket: WebSocket, response: Response) {
        mainActivity.runOnUiThread {
            Toast.makeText(
                mainActivity,
                "Bienvenue $currentEmail!",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    @SuppressLint("SetTextI18n")
    override fun onMessage(webSocket: WebSocket, data: String) {
        mainActivity.runOnUiThread {
            try {
                when (val notif = data.substring(1, data.length - 2)) {
                    "startGame" -> {
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                            R.drawable.border
                        )
                        firstCheck = true
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_timer.visibility =
                            View.VISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.visibility =
                            View.VISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.visibility =
                            View.VISIBLE
                        if (mainActivity.lobby) {
                            (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                                0
                            ) as LobbyFragment).navToDraw()
                        }
                        game.observe(mainActivity,
                            { result ->
                                if (result != null) {
                                    if (firstCheck) {
                                        firstCheck = false
                                        if (game.value!!.getString("type") == "Solo") {
                                            (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                                View.VISIBLE
                                            (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                                View.VISIBLE
                                            solo = true
                                            difficulty = getDifficulty()
                                            when (difficulty) {
                                                "Facile" -> {
                                                    (mainActivity.supportFragmentManager.findFragmentById(
                                                        R.id.game_stats_frag
                                                    ) as GameStatsFragment).startTimer(120000)
                                                }
                                                "Moyen" -> {
                                                    (mainActivity.supportFragmentManager.findFragmentById(
                                                        R.id.game_stats_frag
                                                    ) as GameStatsFragment).startTimer(60000)
                                                }
                                                "Difficile" -> {
                                                    (mainActivity.supportFragmentManager.findFragmentById(
                                                        R.id.game_stats_frag
                                                    ) as GameStatsFragment).startTimer(30000)
                                                }
                                            }

                                        }
                                    }
                                    if (solo) {
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.text =
                                            "Score solo: " + getScore1() + "\nNombre de tentatives restantes: " + getScore2()
                                    } else {
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.text =
                                            "Score équipe 1: " + getScore1() + "\nScore équipe 2: " + getScore2()
                                    }
                                    if (mainActivity.canDraw) {
                                        showMenu(true)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.INVISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.INVISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            getWord()
                                    } else if (youGuess || solo) {
                                        showMenu(false)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.VISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.VISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez une réponse ou un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            "Devine le mot"
                                    } else if (rightOfReply && (youGuess || mainActivity.canDraw)) {
                                        showMenu(false)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.INVISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.INVISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            "L'autre équipe à le droit de réplique"
                                    } else if (rightOfReply) {
                                        showMenu(false)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.VISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.VISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez une réponse ou un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            "Vous avez le droit de réplique"
                                    } else if (firstCheck) {
                                        showMenu(false)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.INVISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.INVISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            "Bienvenue à la partie"
                                    } else {
                                        showMenu(false)

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                                            View.INVISIBLE
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                                            View.INVISIBLE

                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                                            "Entrez un message"
                                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                                            "Tour de l'autre équipe"
                                    }
                                }
                            })
                        getGame()
                    }
                    "gameLobbyStateUpdate" -> {
                        if (mainActivity.lobby) {
                            (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                                0
                            ) as LobbyFragment).getLobbyInfo()
                        }
                    }
                    "startTurn" -> {
                        if (solo) {
                            youGuess = true
                        } else {
                            (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).startTimer(
                                60000
                            )
                            ad?.dismiss()
                        }
                        getGame()
                    }
                    "youDraw" -> {
                        mainActivity.canDraw = true
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.text =
                            getWord()
                        try {
                            (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                                0
                            ) as DrawFragment).updateCanDraw(mainActivity.canDraw)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                    "youGuess" -> {
                        youGuess = true
                        getGame()
                        // message qui dis ton tour de deviner.
                    }
                    "correctAnswer" -> {
                        mainActivity.runOnUiThread {
                            Toast.makeText(
                                mainActivity,
                                "Bonne réponse!",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                        val mediaPlayer =
                            MediaPlayer.create(mainActivity.applicationContext, R.raw.word)
                        mediaPlayer.start()
                        getGame()
                        if (solo) {
                            when (difficulty) {
                                "Facile" -> {
                                    (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).addTime(
                                        8000
                                    )
                                }
                                "Moyen" -> {
                                    (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).addTime(
                                        6000
                                    )
                                }
                                "Difficile" -> {
                                    (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).addTime(
                                        4000
                                    )
                                }
                            }
                        } else {
                            (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()
                        }

                    }
                    "wrongAnswer" -> {
                        val mediaPlayer =
                            MediaPlayer.create(mainActivity.applicationContext, R.raw.wrong)
                        mediaPlayer.start()
                        mainActivity.runOnUiThread {
                            Toast.makeText(
                                mainActivity,
                                "Mauvaise réponse! :( ",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                        getGame()
                        if (!solo) {
                            (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()
                        }

                    }
                    "rightOfReply" -> {
                        rightOfReply = true
                        getGame()
                    }
                    "endTurn" -> {
                        if (!solo) {
                            (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()
                            actions.clear()
                            actionsToRedo.clear()
                            mainActivity.canDraw = false
                            youGuess = false
                            rightOfReply = false

                            ad =
                                (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                                    0
                                ) as DrawFragment).launchEndTurnStats(getScore1(), getScore2())

                            (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                                0
                            ) as DrawFragment).updateCanDraw(mainActivity.canDraw)

                        }
                        (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                            0
                        ) as DrawFragment).clearDrawing()
                        getGame()
                    }
                    "endGame" -> {
                        showMenu(false)

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                            View.INVISIBLE

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                            "Entrez un message"
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()


                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_timer.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                            0
                        ) as DrawFragment).launchEndGameStats(getScore1(), getScore2(), solo)

                        solo = false
                        firstCheck = true
                        difficulty = ""
                        game.value = null

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).changeChat(
                            "1"
                        )

                        deleteGameChat()

                        uiScope.launch(Dispatchers.IO) {
                            val email = EmailInfo(mainActivity.email)
                            HttpService.makeDetectTrophyRequest(email)
                        }
                    }
                    "disconnected" -> {
                        showMenu(false)

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
                            View.INVISIBLE

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
                            "Entrez un message"
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()


                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_timer.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.visibility =
                            View.INVISIBLE
                        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.visibility =
                            View.INVISIBLE

                        (mainActivity.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                            0
                        ) as DrawFragment).disconnected()
                        solo = false
                        firstCheck = true
                        difficulty = ""
                        game.value = null

                        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).changeChat(
                            "1"
                        )

                        deleteGameChat()
                    }
                    "youWon" -> {
                        val mediaPlayer =
                            MediaPlayer.create(mainActivity.applicationContext, R.raw.victory)
                        mediaPlayer.start()
                    }
                    "youLost" -> {
                        val mediaPlayer =
                            MediaPlayer.create(mainActivity.applicationContext, R.raw.defeat)
                        mediaPlayer.start()
                    }
                    "notYourTurn" -> {
                    }
                    else -> {
                        newTrophy(notif)
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }

    fun back() {
        showMenu(false)

        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).ask_tip_button.visibility =
            View.INVISIBLE
        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).send_guess_button.visibility =
            View.INVISIBLE

        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment).messageBox.hint =
            "Entrez un message"
        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).stopTime()


        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_timer.visibility =
            View.INVISIBLE
        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_score.visibility =
            View.INVISIBLE
        (mainActivity.supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view_wordToGuess.visibility =
            View.INVISIBLE

        solo = false
        firstCheck = true
        difficulty = ""
        game.value = null
        (mainActivity.supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).changeChat(
            "1"
        )
    }

    private fun deleteGameChat() {
        val channels =
            ((mainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).channelList
        for (i in 0..channels.chatName.lastIndex) {
            if (i <= channels.chatName.lastIndex) {
                if (channels.chatName[i] == "Partie en cours") {
                    channels.chatName.removeAt(i)
                    channels.chatID.removeAt(i)
                    channels.isSelected.removeAt(i)
                }
            }
        }

        ((mainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment).getAllChannels()
    }

    @SuppressLint("SetTextI18n")
    private fun newTrophy(trophy: String) {
        val mediaPlayer =
            MediaPlayer.create(mainActivity.applicationContext, R.raw.sheesh)
        mediaPlayer.start()
        val toast = Toast.makeText(
            mainActivity,
            "Nouveau trophée débloqué: $trophy!",
            Toast.LENGTH_LONG
        )
        toast.setGravity(Gravity.TOP, 0, 100)
        toast.show()
    }

    private fun showMenu(bool: Boolean) {
        mainActivity.mOptionsMenu.findItem(R.id.brush_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.erase_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.palette_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.size_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.grid_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.undo_menu).isVisible = bool
        mainActivity.mOptionsMenu.findItem(R.id.redo_menu).isVisible = bool
    }

    private fun getWord(): String? {
        val pair: JSONObject? = game.value?.getJSONObject("pair")
        return pair?.getString("word")
    }

    private fun getDifficulty(): String? {
        return game.value?.getString("difficulty")
    }


    private fun getScore1(): String {
        if (game.value!!.getString("type") == "Solo") {
            return game.value!!.getJSONObject("soloAttributes").getInt("score").toString()
        }
        val team1: JSONObject? =
            game.value!!.getJSONObject("classicAttributes").getJSONArray("teams")
                .getJSONObject(0)
        return team1!!.getInt("Score").toString()
    }

    private fun getScore2(): String {
        if (game.value!!.getString("type") == "Solo") {
            return game.value!!.getJSONObject("soloAttributes").getInt("attempts").toString()
        }
        val team2: JSONObject =
            game.value!!.getJSONObject("classicAttributes").getJSONArray("teams")
                .getJSONObject(1)
        return team2.getString("Score")
    }

    private fun getGame() {
        val gameId = mainActivity.gameSocketListener.currentGameId
        uiScope.launch(Dispatchers.IO) {
            try {
                val games = JSONArray(HttpService.makeGameInfoRequest())

                if (games.length() > 0) {
                    for (i in 0 until games.length()) {
                        val obj: JSONObject = games.getJSONObject(i)
                        val type: String = obj.getString("gameID")
                        if (type == gameId) {
                            game.postValue(obj)
                        }
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
            }
        }
    }
}
