@file:Suppress("DEPRECATION")

package clientleger.faismoiundessin.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProviders
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.databinding.LoginBinding
import clientleger.faismoiundessin.viewmodel.LoginViewModel


@Suppress("UNUSED_PARAMETER")
class LoginActivity : AppCompatActivity() {
    private var mLoginViewModel: LoginViewModel? = null
    private var binding: LoginBinding? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)
        binding = DataBindingUtil.setContentView(this, R.layout.login)
        mLoginViewModel = ViewModelProviders.of(this).get(LoginViewModel::class.java)
        binding?.viewModel = mLoginViewModel
        mLoginViewModel!!.getResult().observe(this,
            { result ->
                if (result != null) {
                    handleResult(result)
                }
            })
    }

    private fun handleResult(result: Int) {
        when (result) {
            1 -> {
                val intent = Intent(this, MainActivity::class.java)
                intent.putExtra("email", binding?.etEmail?.text.toString())
                intent.putExtra("newUser", false)
                startActivity(intent)
            }
            2 -> binding?.etEmail?.error = "Entrez votre adresse courriel"
            3 -> binding?.etEmail?.error = "Entrez une adresse courriel valide"
            4 -> binding?.etPassword?.error = "Entrez votre mot de passe"
            5 -> Toast.makeText(applicationContext, "Authentification refusée", Toast.LENGTH_SHORT)
                .show()
        }
    }

    fun goToSignup(v: View) {
        val intent = Intent(this, RegisterActivity::class.java)
        startActivity(intent)
    }

    fun goToRecovery(v: View) {
        val intent = Intent(this, RecoveryEmailActivity::class.java)
        startActivity(intent)
    }


}

