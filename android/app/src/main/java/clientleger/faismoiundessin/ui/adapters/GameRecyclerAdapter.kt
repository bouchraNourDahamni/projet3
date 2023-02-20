package clientleger.faismoiundessin.ui.adapters

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.GameInfo
import clientleger.faismoiundessin.ui.fragments.GameListFragmentDirections

class GameRecyclerAdapter(gameInfo: GameInfo) :
    RecyclerView.Adapter<GameRecyclerAdapter.ViewHolder>() {

    private val gameMode = gameInfo.type
    private val gameDiff = gameInfo.difficulty
    private val numOfPlayers = gameInfo.humanPlayers
    private val numOfPCU = gameInfo.virtualPlayers
    private val gameID = gameInfo.gameID
    private val chatID = gameInfo.chatID

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var itemGameMode: TextView
        var itemGameDiff: TextView
        var itemNumOfPlayers: TextView
        var itemNumOfCPU: TextView
        var itemGameID: TextView
        var itemChatID: TextView

        init {
            itemGameMode = itemView.findViewById(R.id.gameMode)
            itemGameDiff = itemView.findViewById(R.id.gameDiff)
            itemNumOfPlayers = itemView.findViewById(R.id.numOfPlayers)
            itemNumOfCPU = itemView.findViewById(R.id.numOfCPU)
            itemGameID = itemView.findViewById(R.id.gameID)
            itemChatID = itemView.findViewById(R.id.chatID)

            itemView.setOnClickListener {
                navToLobby(
                    (itemGameID.text).subSequence(26, itemGameID.text.length) as String,
                    (itemChatID.text).subSequence(27, itemChatID.text.length) as String
                )
            }
        }

        private fun navToLobby(gameID: String, chatID: String) {
            val action =
                GameListFragmentDirections.actionGameListFragmentToLobbyFragment(gameID, chatID)
            itemView.findNavController().navigate(action)
        }

    }

    override fun onCreateViewHolder(viewGroup: ViewGroup, i: Int): ViewHolder {
        val v = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.card_game_list, viewGroup, false)
        return ViewHolder(v)
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(viewHolder: ViewHolder, i: Int) {
        viewHolder.itemGameMode.text = "Mode de jeu: " + gameMode[i]
        viewHolder.itemGameDiff.text = "Difficulté: " + gameDiff[i]
        viewHolder.itemNumOfPlayers.text = "Joueurs humains: " + numOfPlayers[i]
        viewHolder.itemNumOfCPU.text = "Joueurs virtuels: " + numOfPCU[i]
        viewHolder.itemGameID.text = "Identifiant de la partie: " + gameID[i]
        viewHolder.itemChatID.text = "Identifiant du clavardage: " + chatID[i]
    }

    override fun getItemCount(): Int {
        return gameID.size
    }
}
