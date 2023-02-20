package clientleger.faismoiundessin.repository.service

import android.util.Log
import clientleger.faismoiundessin.repository.data.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody

object HttpService {
    private val client = OkHttpClient()

    // Function that makes the network request, blocking the current thread
    fun makeLoginRequest(data: LoginInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/login")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeRegisterRequest(data: RegisterInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/register")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeNewGameRequest(data: NewGameInfo): String {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/new/game")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeNewChatRequest(data: NewChatInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/new/chat")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeNewMemberRequest(data: AddUsers): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/chat/new/member")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeDeleteChatRequest(chatID: String) {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/chat/delete/$chatID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
        }
    }

    fun makeGuessRequest(guess: String, gameID: String): Boolean {
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), guess)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/game/guess/$gameID")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeGuessTipRequest(gameID: String) {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/game/hint/$gameID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
        }
    }

    fun makeGameInfoRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/info/games")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeChatInfoRequest(chatID: String): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/info/chat/$chatID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeChannelsInfoRequest(email: String): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/info/user/chats/$email")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeSessionInfoRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/info/sessions")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeUserInfoRequest(email: String): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/user/$email")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeLeaderboardGameRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/leaderboard/game")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeLeaderboardWinRateRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/leaderboard/win-rate")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeLeaderboardAverageRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/leaderboard/average-time")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeLeaderboardTimeRequest(): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/leaderboard/most-time")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeStartGameRequest(gameID: String) {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/game/start/$gameID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
        }
    }

    fun makeNextTurnRequest(gameID: String) {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/game/next-turn/$gameID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
        }
    }

    fun makeLobbyUpdateRequest(gameID: String): String {
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/game/lobbyUpdate/$gameID")
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) Log.e("ERROR", "Unexpected code $response")
            return response.body()!!.string()
        }
    }

    fun makeGiveTrophyRequest(trophy: TrophyRequest): Boolean {
        val json = Json.encodeToString(trophy)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/trophy/give")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeCodeRequest(data: EmailInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/recovery/start")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeDetectTrophyRequest(email: EmailInfo): Boolean {
        val json = Json.encodeToString(email)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/trophy/detect")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makeCodeValidationRequest(data: RecoveryInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/recovery/confirm")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    fun makePasswordChangeRequest(data: LoginInfo): Boolean {
        val json = Json.encodeToString(data)
        val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
        val request = Request.Builder()
            .url("http://drawitup.ddns.net/recovery/change")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }
}
