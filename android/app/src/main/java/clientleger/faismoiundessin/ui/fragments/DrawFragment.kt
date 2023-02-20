package clientleger.faismoiundessin.ui.fragments

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.pm.ActivityInfo
import android.graphics.Color
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.SeekBar
import android.widget.SeekBar.OnSeekBarChangeListener
import androidx.activity.addCallback
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.navigation.findNavController
import androidx.navigation.fragment.navArgs
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.databinding.BrushBinding
import clientleger.faismoiundessin.databinding.DrawFragmentBinding
import clientleger.faismoiundessin.databinding.GridBinding
import clientleger.faismoiundessin.repository.data.DrawingInfo
import clientleger.faismoiundessin.repository.service.GameSocketListener
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.utils.ColorPickerDialog
import clientleger.faismoiundessin.ui.utils.ColorPickerDialog.OnColorChangedListener
import com.plattysoft.leonids.ParticleSystem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@SuppressLint("ClickableViewAccessibility")
class DrawFragment : Fragment(), OnColorChangedListener {
    var brushBinding: BrushBinding? = null
    private var gridBinding: GridBinding? = null

    private lateinit var gameSocketListener: GameSocketListener

    private var lastColor = Color.BLACK
    private var canDrawFragment = false

    private val args: DrawFragmentArgs by navArgs()
    lateinit var gameID: String

    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    private var endTurnMLD: MutableLiveData<Int> = MutableLiveData<Int>()

    private val endTurnButton = { _: DialogInterface, _: Int ->
        ((activity as MainActivity).supportFragmentManager.primaryNavigationFragment?.childFragmentManager?.fragments?.get(
            0
        ) as DrawFragment).clearDrawing()
        endTurnMLD.postValue(endTurnMLD.value?.plus(1))

    }

    private val endGameButton = { _: DialogInterface, _: Int ->
        gameSocketListener.closeSocket()
        navToMainMenu()
    }

    private var _binding: DrawFragmentBinding? = null
    val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = DrawFragmentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setMenuVisibility(true)
        setHasOptionsMenu(true)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setHasOptionsMenu(true)

        activity?.setTheme(R.style.Theme)
        activity?.actionBar?.setDisplayShowTitleEnabled(false)
        activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE

        gameID = args.gameID

        endTurnMLD.value = 0
        endTurnMLD.observe(viewLifecycleOwner, {
            uiScope.launch(Dispatchers.IO) {
                HttpService.makeNextTurnRequest(gameID)
            }
        })

        gameSocketListener = (activity as MainActivity).gameSocketListener
        binding.canevasView.paintInit(gameSocketListener, canDrawFragment)

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
            (activity as MainActivity).reinitialiseGame()

            gameSocketListener.closeSocket()

            Handler(Looper.getMainLooper()).postDelayed({ navToMainMenu() }, 1000)

            deleteGameChat()
        }
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

    fun launchEndTurnStats(score1: String, score2: String): AlertDialog {
        return AlertDialog.Builder(activity)
            .setTitle("Fin d'un tour")
            .setMessage(
                "Voici les résultats du jeu !\n\n" +
                        "Pointage de l'équipe 1: $score1 \n" +
                        "Pointage de l'équipe 2: $score2"
            )
            .setPositiveButton(
                "Continuer le jeu",
                DialogInterface.OnClickListener(function = endTurnButton)
            )
            .setCancelable(false)
            .show()
    }

    fun disconnected() {
        AlertDialog.Builder(activity)
            .setTitle("Déconnexion!")
            .setMessage(
                "Un joueur à été déconnecté. !\n\n" +
                        "La partie est terminée. :( \n"
            )
            .setPositiveButton(
                "Revenir au Menu Principal ",
                DialogInterface.OnClickListener(function = endGameButton)
            )
            .setCancelable(false)
            .show()
    }

    fun launchEndGameStats(score1: String, score2: String, solo: Boolean) {
        onVictory(
            activity as MainActivity,
            (activity as MainActivity).applicationContext!!,
            this.requireView().rootView
        )
        if (solo) {
            if (score1 == "0") {
                val mediaPlayer =
                    MediaPlayer.create((activity as MainActivity).applicationContext, R.raw.defeat)
                mediaPlayer.start()
            } else {
                val mediaPlayer =
                    MediaPlayer.create((activity as MainActivity).applicationContext, R.raw.victory)
                mediaPlayer.start()
            }
            AlertDialog.Builder(activity)
                .setTitle("La partie est terminée !!")
                .setMessage(
                    "Voici les résultats de la partie !\n\n" +
                            "Pointage solo: $score1 \n"
                )
                .setPositiveButton(
                    "Revenir au Menu Principal ",
                    DialogInterface.OnClickListener(function = endGameButton)
                )
                .setCancelable(false)
                .show()
        } else {
            AlertDialog.Builder(activity)
                .setTitle("La partie est terminée !!")
                .setMessage(
                    "Voici les résultats de la partie !\n\n" +
                            "Pointage de l'équipe 1: $score1 \n" +
                            "Pointage de l'équipe 2: $score2"
                )
                .setPositiveButton(
                    "Revenir au Menu Principal ",
                    DialogInterface.OnClickListener(function = endGameButton)
                )
                .setCancelable(false)
                .show()
        }
    }

    private fun onVictory(activity: Activity, context: Context, origin: View) {
        val numParticles = 150
        val timeToLive = 2000
        val unwrappedConfetti = ContextCompat.getDrawable(context, R.drawable.confetti)
        val confetti = DrawableCompat.wrap(unwrappedConfetti!!)
        DrawableCompat.setTint(confetti, Color.MAGENTA)
        ParticleSystem(activity, numParticles, confetti, timeToLive.toLong())
            .setSpeedRange(0.01f, 0.8f)
            .setRotationSpeedRange(80f, 144f)
            .setInitialRotationRange(0, 180)
            .setScaleRange(0.8f, 1.2f)
            .setFadeOut(1500)
            .oneShot(origin, numParticles)
        DrawableCompat.setTint(confetti, Color.RED)
        ParticleSystem(activity, numParticles, confetti, timeToLive.toLong())
            .setSpeedRange(0.01f, 0.8f)
            .setRotationSpeedRange(80f, 144f)
            .setInitialRotationRange(0, 180)
            .setScaleRange(0.8f, 1.2f)
            .setFadeOut(1500)
            .oneShot(origin, numParticles)
        DrawableCompat.setTint(confetti, Color.GREEN)
        ParticleSystem(activity, numParticles, confetti, timeToLive.toLong())
            .setSpeedRange(0.01f, 0.8f)
            .setRotationSpeedRange(80f, 144f)
            .setInitialRotationRange(0, 180)
            .setScaleRange(0.8f, 1.2f)
            .setFadeOut(1500)
            .oneShot(origin, numParticles)
    }

    override fun colorChanged(color: Int) {
        binding.canevasView.mPaint?.color = color
        binding.canevasView.tmpColor = color
    }

    fun updateCanDraw(canDraw: Boolean) {
        canDrawFragment = canDraw
        binding.canevasView.canDrawCanvas = canDrawFragment
    }

    fun clearDrawing() {
        binding.canevasView.clearDrawing()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        binding.canevasView.mPaint!!.xfermode = null
        binding.canevasView.mPaint!!.alpha = 0xFF // degree of transparency

        when (item.itemId) {
            R.id.brush_menu -> {
                binding.canevasView.isErasing = false
                binding.canevasView.mPaint!!.shader = null
                binding.canevasView.mPaint!!.maskFilter = null
                binding.canevasView.mPaint!!.color = lastColor
                return true
            }
            R.id.palette_menu -> {
                binding.canevasView.isErasing = false
                activity?.let {
                    ColorPickerDialog(
                        it,
                        this,
                        binding.canevasView.mPaint!!.color,
                        binding.canevasView.drawing
                    ).show()
                }
                lastColor = binding.canevasView.mPaint!!.color
                return true
            }
            R.id.size_menu -> {
                setBrushSize()
                return true
            }
            R.id.erase_menu -> {
                binding.canevasView.isErasing = true
                binding.canevasView.mPaint!!.shader = null
                binding.canevasView.mPaint!!.maskFilter = null
                binding.canevasView.mPaint!!.color = Color.WHITE

                return true
            }
            R.id.grid_menu -> {
                setGridSize()
                return true
            }
            R.id.undo_menu -> {
                binding.canevasView.gameSocketListener.ws.send(
                    Json.encodeToString(
                        DrawingInfo(
                            ArrayList(),
                            "",
                            0,
                            0.0F,
                            "undo"
                        )
                    )
                )
            }
            R.id.redo_menu -> {
                binding.canevasView.gameSocketListener.ws.send(
                    Json.encodeToString(
                        DrawingInfo(
                            ArrayList(),
                            "",
                            0,
                            0.0F,
                            "redo"
                        )
                    )
                )
            }
        }
        return super.onOptionsItemSelected(item)
    }

    private fun setGridSize() {
        gridBinding = GridBinding.inflate(LayoutInflater.from(activity))
        val builder = AlertDialog.Builder(activity)
            .setView(gridBinding!!.root)
        builder.setTitle("Activation de la grille")
        val alertDialog = builder.create()
        alertDialog.show()
        gridBinding!!.radioGroup.setOnCheckedChangeListener { _, p1 ->
            if (p1 == gridBinding!!.gridOff.id)
                binding.canevasView.showGrid(false)
            else if (p1 == gridBinding!!.gridOn.id)
                binding.canevasView.showGrid(true)
        }
    }

    private fun setBrushSize() {
        brushBinding = BrushBinding.inflate(LayoutInflater.from(activity))
        val builder = AlertDialog.Builder(activity)
            .setView(brushBinding!!.root)
        builder.setTitle(R.string.choose_width)
        val alertDialog = builder.create()
        alertDialog.show()
        brushBinding!!.brushSizeSeekBar.progress = strokeSize
        brushBinding!!.sizeValueTextView.text = String.format(
            resources.getString(R.string.your_selected_size_is),
            strokeSize + 1
        )
        brushBinding!!.brushSizeSeekBar.setOnSeekBarChangeListener(object :
            OnSeekBarChangeListener {
            override fun onProgressChanged(
                seekBar: SeekBar,
                progress: Int, fromUser: Boolean,
            ) {
                // Do something here with new value
                binding.canevasView.mPaint!!.strokeWidth = progress.toFloat()
                binding.canevasView.tmpWidth = progress.toFloat()
                brushBinding!!.sizeValueTextView.text = String.format(
                    resources.getString(
                        R.string.your_selected_size_is
                    ), progress + 1
                )
            }

            override fun onStartTrackingTouch(seekBar: SeekBar) {
                // TODO Auto-generated method stub
            }

            override fun onStopTrackingTouch(seekBar: SeekBar) {
                // TODO Auto-generated method stub
            }
        })
    }

    private fun navToMainMenu() {
        view?.findNavController()?.navigate(R.id.action_drawFragment_to_mainMenuFragment)
    }

    private val strokeSize: Int
        get() = binding.canevasView.mPaint!!.strokeWidth.toInt()

    private val gridZoom: Int
        get() = binding.canevasView.gridZoom!!.toInt()

    companion object {
        const val TOUCH_TOLERANCE = 4f
        var DEFAULT_BRUSH_SIZE = 10
        const val MAX_POINTERS = 10
    }
}
