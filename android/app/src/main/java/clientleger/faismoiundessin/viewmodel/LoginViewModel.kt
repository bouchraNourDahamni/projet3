package clientleger.faismoiundessin.viewmodel

import android.text.Editable
import android.text.TextWatcher
import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import clientleger.faismoiundessin.repository.data.LoginInfo
import clientleger.faismoiundessin.repository.service.HttpService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


@Suppress("UNUSED_PARAMETER")
class LoginViewModel : ViewModel() {
    private val user: LoginInfo = LoginInfo("", "")
    private val webService: HttpService = HttpService
    private val result: MutableLiveData<Int> = MutableLiveData<Int>()

    fun getResult(): LiveData<Int?> {
        return result
    }


    //create function to set Email after user finish enter text
    val emailTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                user.email = (s.toString())
                if (!user.isEmailNotEmpty()) {
                    result.postValue(2)
                } else if (!user.isEmailValid()) {
                    result.postValue(3)
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
                    result.postValue(4)
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    //create function to process Login Button clicked
    fun performSignIn(v: View) {
        if (user.isDataValid()) {
            viewModelScope.launch(Dispatchers.IO) {
                if (webService.makeLoginRequest(user)) {
                    result.postValue(1)
                } else {
                    result.postValue(5)
                }
            }
        }
    }

}
