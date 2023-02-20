package clientleger.faismoiundessin.viewmodel

import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import clientleger.faismoiundessin.repository.data.EmailInfo
import clientleger.faismoiundessin.repository.data.RecoveryInfo
import clientleger.faismoiundessin.repository.service.HttpService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


@Suppress("UNUSED_PARAMETER")
class RecoveryEmailViewModel : ViewModel() {
    private val userCode: RecoveryInfo = RecoveryInfo("", 0)
    private val emailCode: EmailInfo = EmailInfo("")
    private val webService: HttpService = HttpService
    private val result: MutableLiveData<Int> = MutableLiveData<Int>()

    fun getResult(): LiveData<Int?> {
        return result
    }


    //create function to set Email after user finish enter text
    val emailTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                userCode.Email = (s.toString())
                emailCode.email = (s.toString())
                if (!userCode.isEmailNotEmpty()) {
                    result.postValue(2)
                } else if (!userCode.isEmailValid()) {
                    result.postValue(3)
                }

            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }


    //create function to set Code after user finish enter text
    val codeTextWatcher: TextWatcher
        get() = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (TextUtils.isDigitsOnly(s)) {
                    userCode.code = if (s.toString() != "") s.toString().toLong() else 0L
                    if (!userCode.isCodeNotEmpty() && TextUtils.isDigitsOnly(s)) {
                        result.postValue(4)
                    }
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        }

    //create function to process Login Button clicked
    fun performSendCode(v: View) {
        if (userCode.isEmailValid()) {
            viewModelScope.launch(Dispatchers.IO) {
                if (webService.makeCodeRequest(emailCode)) {
                    result.postValue(7)
                } else {
                    result.postValue(5)
                }
            }
        }
    }

    fun performVerifyCode(v: View) {
        if (userCode.isDataValid()) {
            viewModelScope.launch(Dispatchers.IO) {
                if (webService.makeCodeValidationRequest(userCode)) {
                    result.postValue(1)
                } else {
                    result.postValue(6)
                }
            }
        }
    }

}
