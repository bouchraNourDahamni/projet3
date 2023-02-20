package clientleger.faismoiundessin.ui.fragments

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.InputType
import android.text.TextUtils
import android.text.TextWatcher
import android.util.Log
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.AddUsers
import clientleger.faismoiundessin.repository.data.Channels
import clientleger.faismoiundessin.repository.data.NewChatInfo
import clientleger.faismoiundessin.repository.data.TrophyRequest
import clientleger.faismoiundessin.repository.service.ChatSocketListener
import clientleger.faismoiundessin.repository.service.HttpService
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.adapters.ChannelsRecyclerAdapter
import kotlinx.android.synthetic.main.chatroom.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONObject


class ChannelsFragment : Fragment() {
    lateinit var email: String
    private var layoutManager: RecyclerView.LayoutManager? = null
    private var adapter: RecyclerView.Adapter<ChannelsRecyclerAdapter.ViewHolder>? = null
    val ml: MutableLiveData<MutableMap<String, String>> =
        MutableLiveData<MutableMap<String, String>>()
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)
    private lateinit var chatSocketListener: ChatSocketListener
    private var chatID = "" // default chat -> 1 : General

    var channelList: Channels = Channels(
        arrayListOf(),
        arrayListOf(),
        arrayListOf()
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.chatroom, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = (activity as MainActivity).email
        chatSocketListener = (activity as MainActivity).chatSocketListener

        val newChatButton = view.findViewById<Button>(R.id.new_chat_button)
        newChatButton.setOnClickListener {
            openNewChatDialog()
        }
        val addUsersButton = view.findViewById<Button>(R.id.add_users_button)
        addUsersButton.setOnClickListener {
            openAddUsersDialog()
        }
        val deleteChatButton = view.findViewById<Button>(R.id.delete_chat_button)
        deleteChatButton.setOnClickListener {
            openDeleteChatDialog()
        }

        getAllChannels()
        ml.observe(viewLifecycleOwner,
            {
                if (ml.value?.isNotEmpty() == true) {
                    displayChannels(ml.value!!)
                    changeChat("1")
                    channels_recycler_view.apply {
                        layoutManager = LinearLayoutManager(activity)
                        adapter = ChannelsRecyclerAdapter(
                            channelList,
                            (activity as MainActivity).supportFragmentManager.findFragmentById(R.id.chat_room_frag) as ChannelsFragment
                        )
                    }
                }
            }
        )
    }

    fun getAllChannels() {
        uiScope.launch(Dispatchers.IO) {
            val channelsML: MutableMap<String, String> = mutableMapOf()
            try {
                val channels = JSONObject(HttpService.makeChannelsInfoRequest(email))

                for (key in channels.keys()) {
                    channelsML[key] = channels.getString(key)
                }
            } catch (e: Exception) {
                Log.e("ERROR", e.toString())
            }
            ml.postValue(channelsML)
            adapter?.notifyDataSetChanged()
        }
    }

    fun changeChat(chatID_: String) {
        chatID = chatID_
        chatSocketListener.instantiateWebSocket(chatID_)
        updateSelectedChat(chatID_)
    }

    private fun updateSelectedChat(chatID_: String) {
        for (i in 0 until channelList.chatID.size) {
            channelList.isSelected[i] = chatID_ == channelList.chatID[i]
        }
    }

    private fun displayChannels(channels: MutableMap<String, String>) {
        channels.forEach { (k, v) ->
            if (v != "" && !channelList.chatID.contains(k)) {
                channelList.chatID.add(k)
                channelList.chatName.add(v)
                channelList.isSelected.add(false)
            }
        }
    }

    @SuppressLint("SetTextI18n")
    private fun openNewChatDialog() {
        var nameEntered = false
        var usersEntered = false

        val nameInput = EditText(activity)
        nameInput.inputType = InputType.TYPE_CLASS_TEXT
        nameInput.hint = "Ex: BFF <3"
        nameInput.setPadding(20, 20, 20, 20)

        val usersInput = EditText(activity)
        usersInput.inputType = InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
        usersInput.hint = "Ex: open_the_gyms@gmail.ca"
        usersInput.setPadding(20, 20, 20, 20)

        val nameText = TextView(activity)
        nameText.text = "Nom du clavardage:"
        nameText.setTextColor(Color.BLACK)
        nameText.setPadding(20, 20, 20, 0)

        val usersText = TextView(activity)
        usersText.text = "Emails de l'utilisateur que vous désirez joindre:"
        usersText.setTextColor(Color.BLACK)
        usersText.setPadding(20, 20, 20, 0)

        val layout = LinearLayout(activity)
        layout.orientation = LinearLayout.VERTICAL
        layout.addView(nameText)
        layout.addView(nameInput)
        layout.addView(usersText)
        layout.addView(usersInput)

        val builder = AlertDialog.Builder(activity)
        builder.setTitle("Nouveau clavardage !")
        builder.setPositiveButton(
            "Créer"
        ) { _, _ ->
            val newChatInfo = NewChatInfo(
                nameInput.text.toString(),
                arrayListOf(email, usersInput.text.toString())
            )
            uiScope.launch(Dispatchers.IO) {
                if (HttpService.makeNewChatRequest(newChatInfo)) {
                    channelList = Channels(arrayListOf(), arrayListOf(), arrayListOf())
                    getAllChannels()

                    val trophy = "SEUL AVEC LES CHUMS!"
                    val trophyRequest = TrophyRequest(email, trophy)

                    try {
                        HttpService.makeGiveTrophyRequest(trophyRequest)
                    } catch (e: Exception) {
                        Log.e("ERROR", e.toString())
                    }
                }
            }
        }
        builder.setNegativeButton(
            "Annuler"
        ) { dialog, _ -> dialog.cancel() }

        builder.setView(layout)

        val dialog = builder.create()
        dialog.show()

        // Initially disable the button
        (dialog as AlertDialog).getButton(AlertDialog.BUTTON_POSITIVE).isEnabled = false

        nameInput.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(
                s: CharSequence, start: Int, before: Int,
                count: Int
            ) {
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int, count: Int,
                after: Int
            ) {
            }

            override fun afterTextChanged(s: Editable) {
                // Check if editText are empty
                nameEntered = !TextUtils.isEmpty(s)
                dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled =
                    usersEntered and nameEntered
            }
        })
        usersInput.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(
                s: CharSequence, start: Int, before: Int,
                count: Int
            ) {
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int, count: Int,
                after: Int
            ) {
            }

            override fun afterTextChanged(s: Editable) {
                // Check if editText is empty
                usersEntered = !TextUtils.isEmpty(s)
                dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled =
                    usersEntered and nameEntered and Patterns.EMAIL_ADDRESS.matcher(usersInput.text)
                        .matches()
            }
        })
    }

    @SuppressLint("SetTextI18n")
    private fun openDeleteChatDialog() {
        AlertDialog.Builder(activity)
            .setTitle("Êtes-vous sûr de vouloir supprimer ce clavardage ?")
            .setPositiveButton(
                "Supprimer"
            ) { _, _ ->
                uiScope.launch(Dispatchers.IO) {
                    for (i in 0..channelList.chatID.lastIndex) {
                        if (i <= channelList.chatID.lastIndex) {
                            if (chatID == channelList.chatID[i]) {
                                channelList.chatID.removeAt(i)
                                channelList.chatName.removeAt(i)
                                channelList.isSelected.removeAt(i)
                            }
                        }
                    }
                    HttpService.makeDeleteChatRequest(chatID)
                }
                Handler(Looper.getMainLooper()).postDelayed({
                    getAllChannels()
                    changeChat("1")
                }, 150)
            }
            .setNegativeButton(
                "Annuler"
            ) { dialog, _ -> dialog.cancel() }
            .setCancelable(false)
            .show()
    }

    @SuppressLint("SetTextI18n")
    private fun openAddUsersDialog() {
        val usersInput = EditText(activity)
        usersInput.inputType = InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
        usersInput.hint =
            "Ex: bob@gmail.ca; tonton@hotmail.ca"
        usersInput.setPadding(20, 20, 20, 20)

        val usersText = TextView(activity)
        usersText.text =
            "Veuillez séparer chaque utilisateur d'un point-virgule ( ; ) avec un espace."
        usersText.setTextColor(Color.BLACK)
        usersText.setPadding(20, 20, 20, 0)

        val layout = LinearLayout(activity)
        layout.orientation = LinearLayout.VERTICAL
        layout.addView(usersText)
        layout.addView(usersInput)

        val builder = AlertDialog.Builder(activity)
        builder.setTitle("Qui voulez-vous ajouter au clavardage actuel?")
            .setPositiveButton(
                "Ajouter"
            ) { _, _ ->
                uiScope.launch(Dispatchers.IO) {
                    val tmp = usersInput.text.split(";").toMutableList()
                    for (i in 0 until tmp.size) {
                        val newUser = AddUsers(tmp[i], chatID.toInt())
                        if (HttpService.makeNewMemberRequest(newUser)) {
                            channelList = Channels(arrayListOf(), arrayListOf(), arrayListOf())
                            getAllChannels()
                        }
                    }
                }
            }
            .setNegativeButton(
                "Annuler"
            ) { dialog, _ -> dialog.cancel() }

        builder.setView(layout)

        val dialog = builder.create()
        dialog.show()

        // Initially disable the button
        (dialog as AlertDialog).getButton(AlertDialog.BUTTON_POSITIVE).isEnabled = false

        usersInput.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(
                s: CharSequence, start: Int, before: Int,
                count: Int
            ) {
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int, count: Int,
                after: Int
            ) {
            }

            override fun afterTextChanged(s: Editable) {
                // Check if editText is empty
                val tmp = usersInput.text.split("; ").toMutableList()
                for (i in 0 until tmp.size) {
                    dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled =
                        !TextUtils.isEmpty(s) and Patterns.EMAIL_ADDRESS.matcher(tmp[i]).matches()
                }
            }
        })
    }
}
