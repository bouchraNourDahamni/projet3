@file:Suppress("DEPRECATION")

package clientleger.faismoiundessin.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProviders
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.databinding.ChangePasswordBinding
import clientleger.faismoiundessin.viewmodel.ChangePasswordViewModel


class ChangePasswordActivity : AppCompatActivity() {
    private var mChangePasswordViewModel: ChangePasswordViewModel? = null
    private var binding: ChangePasswordBinding? = null
    private var email: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.change_password)
        email = intent.getStringExtra("email").toString()
        binding = DataBindingUtil.setContentView(this, R.layout.change_password)
        mChangePasswordViewModel =
            ViewModelProviders.of(this).get(ChangePasswordViewModel::class.java)
        mChangePasswordViewModel!!.email = email
        binding?.viewModel = mChangePasswordViewModel
        mChangePasswordViewModel!!.getResult().observe(this,
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
                "Changement refusé par le serveur",
                Toast.LENGTH_SHORT
            ).show()
            1 -> {
                val intent = Intent(this, MainActivity::class.java)
                intent.putExtra("email", email)
                intent.putExtra("newUser", false)
                startActivity(intent)
            }
            7 -> binding?.etPassword?.error = "Entrez un mot de passe"
            8 -> binding?.etRepeatPassword?.error = "Entrez le même mot de passe à nouveau"
        }
    }


}
