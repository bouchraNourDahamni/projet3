package clientleger.faismoiundessin.repository.data

import android.util.Patterns
import kotlinx.serialization.Serializable

@Suppress("EqualsBetweenInconvertibleTypes")
@Serializable
data class RecoveryInfo(var Email: String, var code: Long) {

    fun isEmailValid(): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(Email).matches()
    }

    fun isEmailNotEmpty(): Boolean {
        return Email.isNotEmpty()
    }

    fun isCodeNotEmpty(): Boolean {
        return !code.equals(0)
    }

    fun isDataValid(): Boolean {
        return isEmailNotEmpty() && isEmailValid() && isCodeNotEmpty()
    }

}
