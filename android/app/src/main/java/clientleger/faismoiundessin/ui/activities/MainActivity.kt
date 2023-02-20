package clientleger.faismoiundessin.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import androidx.appcompat.app.AppCompatActivity
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.DrawingInfo
import clientleger.faismoiundessin.repository.service.ChatSocketListener
import clientleger.faismoiundessin.repository.service.GameSocketListener
import clientleger.faismoiundessin.repository.service.SessionSocketListener
import clientleger.faismoiundessin.ui.fragments.ChatFragment
import clientleger.faismoiundessin.ui.fragments.DrawFragment
import clientleger.faismoiundessin.ui.fragments.MainMenuFragment

class MainActivity : AppCompatActivity() {
    val gameSocketListener = GameSocketListener(this)
    lateinit var chatSocketListener: ChatSocketListener
    var canDraw: Boolean = false
    var lobby: Boolean = false
    lateinit var mOptionsMenu: Menu

    lateinit var email: String
    private lateinit var sessionSocketListener: SessionSocketListener
    var newUser: Boolean = false
    var checkTuto: Boolean = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        chatSocketListener =
            ChatSocketListener(this.supportFragmentManager.findFragmentById(R.id.chat_frag) as ChatFragment)

        email = intent.getStringExtra("email").toString()
        newUser = intent.getBooleanExtra("newUser", false)


        sessionSocketListener = SessionSocketListener(this)
        sessionSocketListener.connectToSession(email)
    }

    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        mOptionsMenu = menu
        menuInflater.inflate(R.menu.main, menu)
        return true
    }

    fun drawing(drawingInfo: DrawingInfo) {
        try {
            (this.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                0
            ) as DrawFragment?)?.binding?.canevasView?.drawLine(drawingInfo)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun reconstitute() {
        (this.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
            0
        ) as DrawFragment?)?.binding?.canevasView?.reconstituteCanvas()
    }

    fun makeSolo() {
        sessionSocketListener.solo = true
    }

    fun logout() {
        sessionSocketListener.closeSocket()
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
    }

    override fun onBackPressed() {
        val f =
            this.supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
                0
            )
        if (f is MainMenuFragment) {
            logout()
        } else {
            super.onBackPressed()
        }
    }

    fun reinitialiseGame() {
        sessionSocketListener.back()
    }

}
