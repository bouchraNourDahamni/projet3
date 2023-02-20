package clientleger.faismoiundessin.ui.adapters

import android.annotation.SuppressLint
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.Channels
import clientleger.faismoiundessin.ui.fragments.ChannelsFragment
import kotlinx.android.synthetic.main.card_channels_list.view.*

class ChannelsRecyclerAdapter(channels: Channels, var channelsFrag: ChannelsFragment) :
    RecyclerView.Adapter<ChannelsRecyclerAdapter.ViewHolder>() {

    private val chatID = channels.chatID
    private val channelName = channels.chatName
    private val isSelected = channels.isSelected

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var itemChannelID: TextView
        var itemChannelName: TextView

        init {
            itemChannelID = itemView.findViewById(R.id.channel_id)
            itemChannelName = itemView.findViewById(R.id.channel_name)

            itemView.setOnClickListener {
                changeChat(itemChannelID.text as String)
                notifyDataSetChanged()
            }
        }

        private fun changeChat(chatID: String) {
            channelsFrag.changeChat(chatID)
        }
    }

    override fun onCreateViewHolder(viewGroup: ViewGroup, i: Int): ViewHolder {
        val v = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.card_channels_list, viewGroup, false)
        return ViewHolder(v)
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(viewHolder: ViewHolder, i: Int) {
        if (channelName[i] != "") {
            viewHolder.itemChannelID.text = chatID[i]
            viewHolder.itemChannelName.text = chatID[i] + " : " + channelName[i]

            if (isSelected[i])
                viewHolder.itemView.card_channels_list.setCardBackgroundColor(Color.parseColor("#D81B60"))
            else
                viewHolder.itemView.card_channels_list.setCardBackgroundColor(Color.parseColor("#483D8B"))
        }

    }

    override fun getItemCount(): Int {
        return channelName.size
    }
}
