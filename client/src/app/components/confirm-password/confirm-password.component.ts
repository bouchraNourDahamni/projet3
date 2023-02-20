import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification/authentification.service';

@Component({
    selector: 'app-confirm-password',
    templateUrl: './confirm-password.component.html',
    styleUrls: ['./confirm-password.component.scss'],
})
export class ConfirmPasswordComponent {
    code: string = '';
    constructor(private authentificationService: AuthentificationService, private router: Router) {}

    confirm(code: string): void {
        const next = () => {
            this.router.navigate(['/resetPassWord']);
        };
        const errorHandler = () => {
            // TODO
        };
        this.authentificationService.confirmCode(parseInt(code, undefined)).subscribe(next, errorHandler);
    }
}
