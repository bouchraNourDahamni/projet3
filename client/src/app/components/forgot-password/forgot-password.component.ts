import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
    waiting: boolean = false;
    resetPasswordFail: boolean = false;
    resetPasswordForm: FormGroup;

    constructor(
        formBuilder: FormBuilder,
        private authentificationService: AuthentificationService,
        private matSnackBar: MatSnackBar,
        private router: Router,
    ) {
        this.resetPasswordForm = formBuilder.group({ email: ['', [Validators.email]] });
    }

    resetPassword(): void {
        if (this.resetPasswordForm.invalid) {
            return;
        }

        this.resetPasswordFail = false;
        this.waiting = true;
        const next = () => {
            this.matSnackBar.open(
                $localize`:@@forgot-password-snackbar-email-sent:Nous venons de vous envoyer un e-mail avec les informations pour réinitialiser votre mot de passe`,
                '',
                {
                    duration: 3000,
                },
            );
            this.router.navigate(['/confirmPassword']);
        };
        const handleError = () => {
            this.resetPasswordFail = true;
        };
        this.authentificationService.email = this.resetPasswordForm.controls.email.value;
        this.authentificationService.forgotPassword(this.resetPasswordForm.controls.email.value).pipe(take(1)).subscribe(next, handleError);
        this.waiting = false;
    }
}
