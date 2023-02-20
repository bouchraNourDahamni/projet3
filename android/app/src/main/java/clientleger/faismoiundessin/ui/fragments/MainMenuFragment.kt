package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.navigation.findNavController
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.EmailInfo
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class MainMenuFragment : Fragment() {
    private lateinit var email: String
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.menu, container, false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setMenuVisibility(false)
        setHasOptionsMenu(false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = (activity as MainActivity).email

        activity?.actionBar?.setDisplayShowTitleEnabled(false)
        setHasOptionsMenu(false)

        val playButton = view.findViewById<Button>(R.id.play_button)
        playButton.setOnClickListener {
            navToGameOptions()
        }
        val navToProfil = view.findViewById<Button>(R.id.profil_button)
        navToProfil.setOnClickListener {
            navToProfil()
        }
        val leaderBoardButton = view.findViewById<Button>(R.id.leaderboard_button)
        leaderBoardButton.setOnClickListener {
            navToLeaderBoard()
        }
        val tutorialButton = view.findViewById<Button>(R.id.tutorial_button)
        tutorialButton.setOnClickListener {
            navToTutorial()
        }
        val logoutButton = view.findViewById<Button>(R.id.logout_button)
        logoutButton.setOnClickListener {
            (activity as MainActivity).logout()
        }

        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                R.drawable.frame_welcome
            )
        }, 50)

        uiScope.launch(Dispatchers.IO) {
            val email = EmailInfo((activity as MainActivity).email)
            HttpService.makeDetectTrophyRequest(email)
        }

        Handler(Looper.getMainLooper()).postDelayed({
            if ((activity as MainActivity).newUser and (activity as MainActivity).checkTuto) {
                navToTutorial()
            }
        }, 100)
    }

    private fun navToTutorial() {
        view?.findNavController()?.navigate(R.id.action_mainMenuFragment_to_tutorialFragment)
    }

    private fun navToLeaderBoard() {
        view?.findNavController()?.navigate(R.id.action_mainMenuFragment_to_leaderboardFragment)
    }

    private fun navToProfil() {
        view?.findNavController()?.navigate(R.id.action_mainMenuFragment_to_profilFragment)
    }

    private fun navToGameOptions() {
        view?.findNavController()?.navigate(R.id.action_mainMenuFragment_to_gameOptionsFragment)
    }
}
