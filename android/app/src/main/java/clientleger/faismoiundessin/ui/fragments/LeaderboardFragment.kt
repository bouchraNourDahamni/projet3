package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.SimpleAdapter
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.android.synthetic.main.fragment_leaderboard.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class LeaderboardFragment : Fragment() {
    private val webService: HttpService = HttpService
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private var leaderboardGame: JSONArray = JSONArray()
    private var leaderboardWinRate: JSONArray = JSONArray()
    private var leaderboardAverage: JSONArray = JSONArray()
    private var leaderboardMost: JSONArray = JSONArray()
    private val imageMLD: MutableLiveData<SimpleAdapter> = MutableLiveData<SimpleAdapter>()
    private var userList: ArrayList<HashMap<String, String>> = ArrayList()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_leaderboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        uiScope.launch(Dispatchers.IO) {
            leaderboardGame = JSONArray(webService.makeLeaderboardGameRequest())
            leaderboardWinRate = JSONArray(webService.makeLeaderboardWinRateRequest())
            leaderboardAverage = JSONArray(webService.makeLeaderboardAverageRequest())
            leaderboardMost = JSONArray(webService.makeLeaderboardTimeRequest())
            showLeaderboard()
        }
        imageMLD.observe(viewLifecycleOwner,
            { result ->
                if (result != null) {
                    list.adapter = imageMLD.value
                }
            })

        val gameButton = view.findViewById<Button>(R.id.nbPartieButton)
        gameButton.setOnClickListener {
            userList.sortByDescending { it["game"]?.toInt() }
            list.adapter = setAdapter()
        }

        val ratioButton = view.findViewById<Button>(R.id.ratioButton)
        ratioButton.setOnClickListener {
            userList.sortByDescending { it["win"]?.toFloat() }
            list.adapter = setAdapter()
        }

        val averageButton = view.findViewById<Button>(R.id.averageButton)
        averageButton.setOnClickListener {
            userList.sortByDescending { it["average"]?.toFloat() }
            list.adapter = setAdapter()
        }

        val mostButton = view.findViewById<Button>(R.id.mostButton)
        mostButton.setOnClickListener {
            userList.sortByDescending { it["most"]?.toFloat() }
            list.adapter = setAdapter()
        }
        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                R.drawable.frame_leaderboard
            )
        }, 50)
    }

    private fun showLeaderboard() {
        for (i in 0 until leaderboardGame.length()) {
            val dataGame = leaderboardGame.getJSONObject(i)
            val email = dataGame.getString("email")
            val game = dataGame.getJSONObject("statistics")
            val win = getInfo(leaderboardWinRate, email)
            val averageTime = getInfo(leaderboardAverage, email)
            val most = getInfo(leaderboardMost, email)
            val temp = HashMap<String, String>()
            temp["email"] = email
            temp["game"] = game.get("games").toString()
            temp["win"] = (if (win.get("winratio")
                    .toString().length < 5
            ) win.getString("winratio") else win.getString("winratio").subSequence(0, 4)).toString()
            val average = averageTime.getString("avaragetime").toLong()
            val mostTime = most.getString("totaltime").toLong()
            temp["average"] = "${average / 60000000000}"
            temp["most"] = "${mostTime / 60000000000}"
            userList.add(temp)
        }
        userList.sortByDescending { it["game"]?.toInt() }
        imageMLD.postValue(setAdapter())
    }

    private fun setAdapter(): SimpleAdapter? {
        return activity?.let {
            SimpleAdapter(
                it.applicationContext,
                userList,
                R.layout.custom_row_view,
                arrayOf("email", "game", "win", "average", "most"),
                intArrayOf(R.id.custom1, R.id.custom2, R.id.custom3, R.id.custom4, R.id.custom5)
            )
        }
    }

    private fun getInfo(leaderboard: JSONArray, email: String): JSONObject {
        for (n in 0 until leaderboard.length()) {
            if (leaderboard.getJSONObject(n).getString("email") == email) {
                return leaderboard.getJSONObject(n).getJSONObject("statistics")
            }
        }
        return JSONObject()
    }
}
