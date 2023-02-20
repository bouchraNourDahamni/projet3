@file:Suppress("DEPRECATION")

package clientleger.faismoiundessin.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProviders
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.databinding.PasswordRecoveryBinding
import clientleger.faismoiundessin.viewmodel.RecoveryEmailViewModel


@Suppress("UNUSED_PARAMETER")
class RecoveryEmailActivity : AppCompatActivity() {
    private var mRecoveryEmailViewModel: RecoveryEmailViewModel? = null
    private var binding: PasswordRecoveryBinding? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.password_recovery)
        binding = DataBindingUtil.setContentView(this, R.layout.password_recovery)
        mRecoveryEmailViewModel =
            ViewModelProviders.of(this).get(RecoveryEmailViewModel::class.java)
        binding?.viewModel = mRecoveryEmailViewModel
        mRecoveryEmailViewModel!!.getResult().observe(this,
            { result ->
                if (result != null) {
                    handleResult(result)
                }
            })
    }

    private fun handleResult(result: Int) {
        when (result) {
            1 -> {
                val intent = Intent(this, ChangePasswordActivity::class.java)
                intent.putExtra("email", binding?.etEmail?.text.toString())
                startActivity(intent)
            }
            2 -> binding?.etEmail?.error = "Entrez votre adresse courriel"
            3 -> binding?.etEmail?.error = "Entrez une adresse courriel valide"
            4 -> binding?.etCode?.error = "Entrez votre code de vérification"
            5 -> Toast.makeText(applicationContext, "Ce compte n'existe pas.", Toast.LENGTH_SHORT)
                .show()
            6 -> Toast.makeText(
                applicationContext,
                "Le code entré n'est pas le bon.",
                Toast.LENGTH_SHORT
            )
                .show()
            7 -> {
                Toast.makeText(
                    applicationContext,
                    "Vous recevrez le code dans quelques instants!",
                    Toast.LENGTH_SHORT
                )
                    .show()
            }
        }
    }


}

