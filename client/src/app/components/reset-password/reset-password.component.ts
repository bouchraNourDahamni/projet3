import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
// référence : https://github.com/PolyHx/Dashboard2.0/tree/master/project/src/app/pages //
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d$@$!%*?&]{8,}$/;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
    resetForm: FormGroup;
    fail: boolean = false;
    waiting: boolean = false;
    invalidSubmit: boolean = false;

    constructor(
        private router: Router,
        private matSnackBar: MatSnackBar,
        formBuilder: FormBuilder,
        private authentificationService: AuthentificationService,
    ) {
        this.resetForm = formBuilder.group({
            password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    reset(): void {
        if (this.resetForm.invalid) {
            this.invalidSubmit = true;
            return;
        }
        this.fail = false;
        this.waiting = true;
        const resetPassWordResponse = this.authentificationService.resetPassWord(this.resetForm.controls.password.value);
        if (resetPassWordResponse) {
            this.matSnackBar.open($localize`:@@reset-password-snackbar-success: tu es a Poly Dessin !`, '', {
                duration: 2000,
            });
            this.router.navigate(['/polydessin']);
        } else {
            this.matSnackBar.open($localize`:@@reset-password-snackbar-fail: Quleque chose ne va pas ...`, '', {
                duration: 2000,
            });
        }
        this.waiting = false;
    }

    confirmPassWord(): boolean {
        const passWordChecked = this.resetForm.controls.password.value === this.resetForm.controls.confirmPassword.value;
        if (!passWordChecked) {
            this.resetForm.controls.confirmPassword.setErrors({ incorrect: true });
        }
        return passWordChecked;
    }
}
