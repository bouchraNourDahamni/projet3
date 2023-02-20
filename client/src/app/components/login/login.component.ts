// tslint:disable:prettier
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    ws: WebSocket;
    waiting: boolean = false;
    fail: boolean = false;
    loginForm: FormGroup;
    constructor(
        formBuilder: FormBuilder,
        private authentificationService: AuthentificationService,
        private gameManagementService: GameManagementService,
    ) {
        this.loginForm = formBuilder.group({
            email: ['', [Validators.required, Validators.email]], // Inserted value for ease of use in testing
            password: ['', [Validators.required]],
        });
    }

    // tslint:disable-next-line:typedef
    async login() {
        if (this.loginForm.invalid) {
            return;
        }
        this.fail = false;
        this.waiting = true;
        const response = await this.authentificationService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
        if (response) {
            this.authentificationService.email = this.loginForm.controls.email.value;
            this.gameManagementService.connectToSession(this.authentificationService.email);
            this.fail = false;
            return;
        } else {
            this.fail = true;
            this.waiting = false;
        }
    }
}
