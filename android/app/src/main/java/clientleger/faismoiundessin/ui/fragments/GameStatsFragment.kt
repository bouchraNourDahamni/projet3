package clientleger.faismoiundessin.ui.fragments

import android.os.Bundle
import android.os.SystemClock
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import clientleger.faismoiundessin.R
import kotlinx.android.synthetic.main.fragment_game_stats.*

class GameStatsFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_game_stats, container, false)
    }

    fun startTimer(time: Long) {
        view_timer.isCountDown = true
        view_timer.base = SystemClock.elapsedRealtime() + time
        view_timer.start()
    }

    fun addTime(time: Long) {
        if (view_timer.isCountDown) {
            view_timer.base = view_timer.base + time
        }
    }

    fun stopTime() {
        view_timer.isCountDown = false
        view_timer.base = SystemClock.elapsedRealtime()
        view_timer.stop()
    }
}
