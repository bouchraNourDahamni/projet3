package clientleger.faismoiundessin.repository.data

import android.util.Patterns
import kotlinx.serialization.Serializable

@Serializable
data class LoginInfo(var email: String, var password: String) {

    fun isEmailValid(): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    fun isEmailNotEmpty(): Boolean {
        return email.isNotEmpty()
    }

    fun isPasswordNotEmpty(): Boolean {
        return password.isNotEmpty()
    }

    fun isDataValid(): Boolean {
        return isEmailNotEmpty() && isEmailValid() && isPasswordNotEmpty()
    }

}
