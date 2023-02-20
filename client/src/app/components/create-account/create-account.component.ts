import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';

// référence : https://github.com/PolyHx/Dashboard2.0/tree/master/project/src/app/pages //
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d$@$!%*?&]{8,}$/;

@Component({
    selector: 'app-create-account',
    templateUrl: './create-account.component.html',
    styleUrls: ['./create-account.component.scss'],
})
export class CreateAccountComponent {
    createAccountForm: FormGroup;
    fail: boolean = false;
    waiting: boolean = false;
    invalidInformation: boolean = false;
    avatar: string;

    constructor(
        formBuilder: FormBuilder,
        private authentificationService: AuthentificationService,
        private router: Router,
        private gameManager: GameManagementService,
        private modalService: ModalHandlerService,
    ) {
        this.createAccountForm = formBuilder.group({
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
            confirmPassword: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
        });
    }

    async createAccount(): Promise<void> {
        if (this.createAccountForm.invalid) {
            this.invalidInformation = true;
            return;
        }
        this.fail = false;
        this.waiting = true;
        const { email, userName, lastName, firstName, password } = this.createAccountForm.controls;
        const jsonCreateAccount = JSON.stringify({
            email: email.value,
            pseudo: userName.value,
            lastName: lastName.value,
            firstName: firstName.value,
            password: password.value,
            avatar: this.avatar,
        });
        const res = await this.authentificationService.createAccount(jsonCreateAccount);
        if (res) {
            this.gameManager.connectToSession(email.value);
            this.authentificationService.email = email.value;
            this.router.navigate(['/polydessin']);
            this.modalService.openUserGuide();
            this.waiting = false;
        } else {
            this.fail = true;
            this.waiting = false;
        }
    }

    confirmPassWord(): boolean {
        const passWordChecked = this.createAccountForm.controls.password.value === this.createAccountForm.controls.confirmPassword.value;
        if (!passWordChecked) {
            this.createAccountForm.controls.confirmPassword.setErrors({ incorrect: true });
        }
        return passWordChecked;
    }
}
