package clientleger.faismoiundessin.ui.adapters

import android.annotation.SuppressLint
import android.media.MediaPlayer
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.ui.activities.MainActivity
import clientleger.faismoiundessin.ui.fragments.ChatFragment
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class MessageAdapter(private var fragment: ChatFragment) : BaseAdapter() {
    var messagesList: MutableList<JSONObject> = ArrayList<JSONObject>()

    override fun getCount(): Int {
        return messagesList.size
    }

    override fun getItem(i: Int): Any {
        return messagesList[i]
    }

    override fun getItemId(i: Int): Long {
        return i.toLong()
    }

    @SuppressLint("SimpleDateFormat")
    private fun String.timeStampConverter(): String {
        val utcFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        utcFormat.timeZone = TimeZone.getTimeZone("UTC")

        val date = utcFormat.parse(this)

        val localFormat = SimpleDateFormat("HH:mm:ss")
        localFormat.timeZone = TimeZone.getTimeZone("America/New_York")

        return localFormat.format(date!!)
    }

    override fun getView(i: Int, view: View?, viewGroup: ViewGroup): View? {
        var currView: View? = view
        if (currView == null) currView =
            fragment.layoutInflater.inflate(R.layout.message_list_item, viewGroup, false)

        val sentUsername: TextView? = currView?.findViewById(R.id.sentUsername)
        val sentTime: TextView? = currView?.findViewById(R.id.sentTime)
        val sentMessage: TextView? = currView?.findViewById(R.id.sentMessage)

        val receivedUsername: TextView? = currView?.findViewById(R.id.receivedUsername)
        val receivedTime: TextView? = currView?.findViewById(R.id.receivedTime)
        val receivedMessage: TextView? = currView?.findViewById(R.id.receivedMessage)

        val item: JSONObject = messagesList[i]

        try {
            if (item.getBoolean("byServer")) {
                if (receivedUsername != null && receivedTime != null && receivedMessage != null && sentUsername != null && sentTime != null && sentMessage != null) {
                    val currentTime = Calendar.getInstance().time.toString().subSequence(11, 20)
                    val messageTime = item.getString("sendDate").timeStampConverter()

                    // checks if hours and mins are the same
                    if (currentTime.subSequence(0, 5) == messageTime.subSequence(0, 5)) {
                        // check if message was received in the last 5 seconds
                        if (currentTime.subSequence(6, 8).toString()
                                .toInt() - 1 < messageTime.subSequence(6, 8).toString().toInt()
                        ) {
                            // make sound
                            val mediaPlayer =
                                MediaPlayer.create(
                                    (fragment.activity as MainActivity).applicationContext,
                                    R.raw.message
                                )
                            mediaPlayer.start()
                        }
                    }

                    receivedUsername.visibility = View.VISIBLE
                    receivedTime.visibility = View.VISIBLE
                    receivedMessage.visibility = View.VISIBLE


                    receivedUsername.text = item.getString("email")
                    receivedTime.text = item.getString("sendDate").timeStampConverter()
                    receivedMessage.text = item.getString("message")

                    sentUsername.visibility = View.INVISIBLE
                    sentTime.visibility = View.INVISIBLE
                    sentMessage.visibility = View.INVISIBLE
                }
            } else {
                if (receivedUsername != null && receivedTime != null && receivedMessage != null && sentUsername != null && sentTime != null && sentMessage != null) {
                    sentUsername.visibility = View.INVISIBLE
                    sentTime.visibility = View.VISIBLE
                    sentMessage.visibility = View.VISIBLE


                    sentTime.text = item.getString("sendDate").timeStampConverter()
                    sentMessage.text = item.getString("message")

                    receivedUsername.visibility = View.INVISIBLE
                    receivedTime.visibility = View.INVISIBLE
                    receivedMessage.visibility = View.INVISIBLE
                }
            }
        } catch (e: JSONException) {
            e.printStackTrace()
        }
        return currView
    }

    fun addItem(item: JSONObject) {
        notifyDataSetChanged()
        messagesList.add(item)
        notifyDataSetChanged()
    }
}
