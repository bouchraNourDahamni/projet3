@file:Suppress("DEPRECATION")

package clientleger.faismoiundessin.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProviders
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.databinding.RegisterBinding
import clientleger.faismoiundessin.viewmodel.RegisterViewModel

class RegisterActivity : AppCompatActivity() {
    private var mRegisterViewModel: RegisterViewModel? = null
    private var binding: RegisterBinding? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.register)
        binding = DataBindingUtil.setContentView(this, R.layout.register)
        mRegisterViewModel = ViewModelProviders.of(this).get(RegisterViewModel::class.java)
        binding?.viewModel = mRegisterViewModel
        mRegisterViewModel!!.getResult().observe(this,
            { result ->
                if (result != null) {
                    handleResult(result)
                }
            })
    }

    private fun handleResult(result: Int) {
        when (result) {
            0 -> Toast.makeText(
                applicationContext,
                "Inscription refusée par le serveur",
                Toast.LENGTH_SHORT
            ).show()
            1 -> {
                val intent = Intent(this, MainActivity::class.java)
                intent.putExtra("email", mRegisterViewModel?.user?.email)
                intent.putExtra("newUser", true)
                startActivity(intent)
            }
            2 -> binding?.etFirstName?.error = "Entrez votre prénom"
            3 -> binding?.etLastName?.error = "Entrez votre nom"
            4 -> binding?.etPseudo?.error = "Entrez un pseudonyme"
            5 -> binding?.etEmail?.error = "Entrez votre adresse courriel"
            6 -> binding?.etEmail?.error = "Entrez une adresse courriel valide"
            7 -> binding?.etPassword?.error = "Entrez un mot de passe"
            8 -> binding?.etRepeatPassword?.error = "Entrez le même mot de passe à nouveau"
        }
    }


}
