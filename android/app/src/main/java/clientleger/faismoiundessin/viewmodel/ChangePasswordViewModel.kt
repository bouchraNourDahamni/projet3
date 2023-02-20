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
class ChangePasswordViewModel : ViewModel() {
    private val user: LoginInfo = LoginInfo("", "")
    private val webService: HttpService = HttpService
    private val result: MutableLiveData<Int> = MutableLiveData<Int>()
    private var repeatPassword: Boolean = false
    var email: String = ""

    fun getResult(): LiveData<Int?> {
        return result
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

    fun performChangePassword(v: View) {
        user.email = email
        if (user.isDataValid() && repeatPassword) {
            viewModelScope.launch(Dispatchers.IO) {
                if (webService.makePasswordChangeRequest(user)) {
                    result.postValue(1)
                } else {
                    result.postValue(0)
                }
            }
        }
    }


}
