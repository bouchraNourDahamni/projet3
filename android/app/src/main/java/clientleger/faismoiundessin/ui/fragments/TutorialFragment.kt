package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.TrophyRequest
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import kotlinx.android.synthetic.main.fragment_tutorial.view.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class TutorialFragment : Fragment() {
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    private var tutoDone1 = true
    private var tutoDone2 = false
    private var tutoDone3 = false
    private var tutoDone4 = false
    private lateinit var email: String

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_tutorial, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = (activity as MainActivity).email
        (activity as MainActivity).checkTuto = false

        Handler(Looper.getMainLooper()).postDelayed({
            ((activity as MainActivity).supportFragmentManager.findFragmentById(R.id.game_stats_frag) as GameStatsFragment).view?.setBackgroundResource(
                R.drawable.frame_tutorial
            )
        }, 50)

        val playTutorial = view.findViewById<Button>(R.id.tutorial_play_button)
        playTutorial.setOnClickListener {
            view.tutorial_1.visibility = View.VISIBLE
            view.tutorial_2.visibility = View.GONE
            view.tutorial_3.visibility = View.GONE
            view.tutorial_4.visibility = View.GONE

            view.tutorial_play_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.guess_button
            )
            view.tutorial_draw_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_chat_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_profil_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )

            Handler(Looper.getMainLooper()).postDelayed({
                view.tutorial_play_scrollView.smoothScrollTo(
                    0,
                    0
                )
            }, 100)

            tutoDone1 = true
            isTutoDone()
        }
        val drawTutorial = view.findViewById<Button>(R.id.tutorial_draw_button)
        drawTutorial.setOnClickListener {
            view.tutorial_1.visibility = View.GONE
            view.tutorial_2.visibility = View.VISIBLE
            view.tutorial_3.visibility = View.GONE
            view.tutorial_4.visibility = View.GONE

            view.tutorial_play_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_draw_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.guess_button
            )
            view.tutorial_chat_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_profil_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )

            Handler(Looper.getMainLooper()).postDelayed({
                view.tutorial_play_scrollView.smoothScrollTo(
                    0,
                    0
                )
            }, 100)

            tutoDone2 = true
            isTutoDone()
        }
        val chatTutorial = view.findViewById<Button>(R.id.tutorial_chat_button)
        chatTutorial.setOnClickListener {
            view.tutorial_1.visibility = View.GONE
            view.tutorial_2.visibility = View.GONE
            view.tutorial_3.visibility = View.VISIBLE
            view.tutorial_4.visibility = View.GONE

            view.tutorial_play_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_draw_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_chat_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.guess_button
            )
            view.tutorial_profil_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )

            Handler(Looper.getMainLooper()).postDelayed({
                view.tutorial_play_scrollView.smoothScrollTo(
                    0,
                    0
                )
            }, 100)

            tutoDone3 = true
            isTutoDone()
        }
        val profilTutorial = view.findViewById<Button>(R.id.tutorial_profil_button)
        profilTutorial.setOnClickListener {
            view.tutorial_1.visibility = View.GONE
            view.tutorial_2.visibility = View.GONE
            view.tutorial_3.visibility = View.GONE
            view.tutorial_4.visibility = View.VISIBLE

            view.tutorial_play_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_draw_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_chat_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.chat_button
            )
            view.tutorial_profil_button.background = ContextCompat.getDrawable(
                (activity as MainActivity).applicationContext,
                R.drawable.guess_button
            )

            Handler(Looper.getMainLooper()).postDelayed({
                view.tutorial_play_scrollView.smoothScrollTo(
                    0,
                    0
                )
            }, 100)

            tutoDone4 = true
            isTutoDone()
        }
    }

    private fun isTutoDone() {
        if (tutoDone1 && tutoDone2 && tutoDone3 && tutoDone4) {
            uiScope.launch(Dispatchers.IO) {
                tutoDone1 = false
                tutoDone2 = false
                tutoDone3 = false
                tutoDone4 = false

                val trophy = "MAÎTRE DES TUTORIELS!"
                val trophyRequest = TrophyRequest(email, trophy)

                try {
                    HttpService.makeGiveTrophyRequest(trophyRequest)
                } catch (e: Exception) {
                    Log.e("ERROR", e.toString())
                }
            }
        }
    }
}
