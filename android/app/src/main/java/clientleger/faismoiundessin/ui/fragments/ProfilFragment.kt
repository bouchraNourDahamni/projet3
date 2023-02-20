package clientleger.faismoiundessin.ui.fragments

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SimpleAdapter
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.android.synthetic.main.profil_fragment.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

@Suppress("NULLABILITY_MISMATCH_BASED_ON_JAVA_ANNOTATIONS")
class ProfilFragment : Fragment() {

    private val webService: HttpService = HttpService
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private lateinit var email: String
    private var profilInfo: JSONObject = JSONObject()

    private val imageMLD: MutableLiveData<Int> = MutableLiveData<Int>()
    private val infoConnexionMLD: MutableLiveData<SimpleAdapter> = MutableLiveData<SimpleAdapter>()
    private val infoGameMLD: MutableLiveData<SimpleAdapter> = MutableLiveData<SimpleAdapter>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.profil_fragment, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = (activity as MainActivity).email
        uiScope.launch(Dispatchers.IO) {
            profilInfo = JSONObject(webService.makeUserInfoRequest(email))
            showInfo()
        }

        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                R.drawable.frame_profil
            )
        }, 50)
        imageMLD.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    imageView.setBackgroundResource(imageMLD.value!!)
                }
            })

        infoConnexionMLD.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    listConnexion.adapter = infoConnexionMLD.value
                }
            })

        infoGameMLD.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    listSolo.adapter = infoGameMLD.value
                }
            })

    }

    private fun showInfo() {
        val statsInfo = profilInfo.getJSONObject("statistics")
        val publicInfo = profilInfo.getJSONObject("public")

        val path = publicInfo.get("avatar").toString()

        imageMLD.postValue(
            when (path) {
                "/avatar/1.png" -> R.drawable.one
                "/avatar/2.png" -> R.drawable.two
                "/avatar/3.png" -> R.drawable.three
                "/avatar/4.png" -> R.drawable.four
                else -> R.drawable.basic_avatar
            }
        )

        val courriel = "Email : ${profilInfo.get("email")}"
        val pseudo = "Pseudo : ${publicInfo.get("pseudo")}"

        val average =
            "Temps moyen : ${statsInfo.getString("avaragetime").toLong() / 60000000000} min"
        val total = "Temps total : ${statsInfo.getString("totaltime").toLong() / 60000000000} min"
        val nbGame = "Nombre de partie jouées : ${statsInfo.get("games")}"
        val ratioVal: String =
            if (statsInfo.getString("winratio").length < 5) statsInfo.getString("winratio") else statsInfo.getString(
                "winratio"
            ).subSequence(0, 4)
                .toString()
        val ratio = "Ratio Victore/Défaite : $ratioVal"

        emailText.text = courriel
        pseudoText.text = pseudo
        gamePlayedText.text = nbGame
        winRatioText.text = ratio
        averageTime.text = average
        mostTime.text = total
        showConnexion()
        showGame()
    }

    private fun showConnexion() {
        val historyInfo = profilInfo.getJSONObject("history")
        val connexionList = historyInfo.getJSONArray("connections")
        val deconnexionList = historyInfo.getJSONArray("deconnections")
        val connection = ArrayList<HashMap<String, String>>()
        for (i in 0 until deconnexionList.length()) {
            val temp = HashMap<String, String>()
            temp["connexions"] = connexionList[i].toString().timeStampConverter()
            temp["deconnexions"] = deconnexionList[i].toString().timeStampConverter()
            connection.add(temp)
        }
        val simpleAdapter = activity?.let {
            SimpleAdapter(
                it.applicationContext,
                connection,
                R.layout.custom_row_view_profile_connexion,
                arrayOf("connexions", "deconnexions"),
                intArrayOf(R.id.custom2, R.id.custom3)
            )
        }
        infoConnexionMLD.postValue(simpleAdapter)
    }

    private fun showGame() {
        val historyInfo = profilInfo.getJSONObject("history")
        var gameHistoryInfo: JSONObject
        var classicHistory = JSONArray()
        var soloHistory = JSONArray()
        try {
            gameHistoryInfo = historyInfo.getJSONObject("gamesHistory")
            classicHistory = gameHistoryInfo.getJSONArray("classic")
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {
            gameHistoryInfo = historyInfo.getJSONObject("gamesHistory")
            soloHistory = gameHistoryInfo.getJSONArray("solo")
        } catch (e: Exception) {
            e.printStackTrace()
        }

        var gameHistory = ArrayList<HashMap<String, String>>()
        gameHistory = getTypeHistorySolo(gameHistory, soloHistory)
        gameHistory = getTypeHistoryClassic(gameHistory, classicHistory)

        if (gameHistory.size == 0) {
            val temp = HashMap<String, String>()
            temp["start"] = "Aucune partie à montrer"
            gameHistory.add(temp)
        }

        val simpleAdapter = activity?.let {
            SimpleAdapter(
                it.applicationContext,
                gameHistory,
                R.layout.custom_row_view_profile_game,
                arrayOf("start", "end", "players", "result"),
                intArrayOf(R.id.custom2, R.id.custom3, R.id.custom4, R.id.custom5)
            )
        }
        infoGameMLD.postValue(simpleAdapter)
    }

    private fun getTypeHistoryClassic(
        gameHistory: ArrayList<HashMap<String, String>>,
        history: JSONArray
    ): ArrayList<HashMap<String, String>> {
        for (i in 0 until history.length()) {
            val temp = HashMap<String, String>()
            temp["start"] =
                history.getJSONObject(i).getJSONObject("basicgamehistory").getString("start")
                    .timeStampConverter()
            temp["end"] =
                history.getJSONObject(i).getJSONObject("basicgamehistory").getString("end")
                    .timeStampConverter()
            var playerList = JSONArray()
            try {
                playerList = history.getJSONObject(i).getJSONArray("players")
            } catch (e: java.lang.Exception) {
            }
            var list = ""
            for (n in 0 until playerList.length()) {
                list += " " + playerList[n]
            }
            temp["players"] = list.trim()
            val result = history.getJSONObject(i).getJSONObject("result")
            try {
                temp["result"] = result[profilInfo.get("email").toString()].toString()
            } catch (e: java.lang.Exception) {
                temp["result"] = "Égalité"
            }

            gameHistory.add(temp)
        }
        return gameHistory
    }

    private fun getTypeHistorySolo(
        gameHistory: ArrayList<HashMap<String, String>>,
        history: JSONArray
    ): ArrayList<HashMap<String, String>> {
        for (i in 0 until history.length()) {
            val temp = HashMap<String, String>()
            temp["start"] =
                history.getJSONObject(i).getJSONObject("basicgamehistory").getString("start")
                    .timeStampConverter()
            temp["end"] =
                history.getJSONObject(i).getJSONObject("basicgamehistory").getString("end")
                    .timeStampConverter()
            temp["players"] = profilInfo.get("email").toString()
            val result = history.getJSONObject(i).get("result")
            temp["result"] = result.toString()
            gameHistory.add(temp)
        }
        return gameHistory
    }

    @SuppressLint("SimpleDateFormat")
    private fun String.timeStampConverter(): String {
        val utcFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        val utcFormat2 = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
        utcFormat.timeZone = TimeZone.getTimeZone("UTC")
        val date: Date
        date = try {
            utcFormat.parse(this)
        } catch (e: java.lang.Exception) {
            utcFormat2.parse(this)
        }

        val localFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
        localFormat.timeZone = TimeZone.getTimeZone("America/New_York")

        return localFormat.format(date)
    }

}
