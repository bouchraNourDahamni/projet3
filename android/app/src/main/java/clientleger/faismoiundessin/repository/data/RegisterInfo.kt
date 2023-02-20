package clientleger.faismoiundessin.repository.data

import android.util.Patterns
import kotlinx.serialization.Serializable

@Serializable
data class RegisterInfo(
    var email: String,
    var pseudo: String,
    var lastName: String,
    var firstName: String,
    var password: String
) {
    fun isEmailValid(): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    fun isEmailNotEmpty(): Boolean {
        return email.isNotEmpty()
    }

    fun isPasswordNotEmpty(): Boolean {
        return password.isNotEmpty()
    }

    fun isPseudoNotEmpty(): Boolean {
        return pseudo.isNotEmpty()
    }

    fun isLastNameNotEmpty(): Boolean {
        return lastName.isNotEmpty()
    }

    fun isFirstNameNotEmpty(): Boolean {
        return firstName.isNotEmpty()
    }

    fun isDataValid(): Boolean {
        return isEmailNotEmpty() && isEmailValid() && isPasswordNotEmpty() && isPseudoNotEmpty() && isLastNameNotEmpty() && isFirstNameNotEmpty()
    }
}
