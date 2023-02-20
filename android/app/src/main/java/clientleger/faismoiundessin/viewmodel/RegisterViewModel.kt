package clientleger.faismoiundessin.viewmodel

import android.text.Editable
import android.text.TextWatcher
import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import clientleger.faismoiundessin.repository.data.RegisterInfo
import clientleger.faismoiundessin.repository.service.HttpService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Suppress("UNUSED_PARAMETER")
class RegisterViewModel : ViewModel() {
    val user: RegisterInfo = RegisterInfo("", "", "", "", "")
    private val webService: HttpService = HttpService
    private val result: MutableLiveData<Int> = MutableLiveData<Int>()
    private var repeatPassword: Boolean = false

    fun getResult(): LiveData<Int?> {
        return result
    }


    //create function to set Email after user finish enter text
    val firstNameTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.firstName = (s.toString())
                if (!user.isFirstNameNotEmpty()) {
                    result.postValue(2)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    val lastNameTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.lastName = (s.toString())
                if (!user.isLastNameNotEmpty()) {
                    result.postValue(3)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    val pseudoTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.pseudo = (s.toString())
                if (!user.isPseudoNotEmpty()) {
                    result.postValue(4)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    val emailTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.email = (s.toString())
                if (!user.isEmailNotEmpty()) {
                    result.postValue(5)
                } else if (!user.isEmailValid()) {
                    result.postValue(6)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }


    //create function to set Password after user finish enter text
    val passwordTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.password = (s.toString())
                if (!user.isPasswordNotEmpty()) {
                    result.postValue(7)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    val repeatPasswordTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (user.password != (s.toString())) {
                    repeatPassword = false
                    result.postValue(8)
                } else {
                    repeatPassword = true
                }

            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    fun performRegister(v: View) {
        if (user.isDataValid() && repeatPassword) {
            viewModelScope.launch(Dispatchers.IO) {
                if (webService.makeRegisterRequest(user)) {
                    result.postValue(1)
                } else {
                    result.postValue(0)
                }
            }
        }
    }


}
