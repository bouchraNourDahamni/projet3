// tslint:disable:prettier
// tslint:disable:quotemark
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// http client de Angular

@Injectable({
    providedIn: 'root',
})
// tslint:disable: object-literal-shorthand
// tslint:disable: object-literal-key-quotes
export class AuthentificationService {
    constructor(private httpClient: HttpClient) {}
    email: string = '';

    async login(email: string, password: string): Promise<boolean> {
        const jsonLogin = JSON.stringify({ email: email, password: password });
        try {
            await this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/login`, jsonLogin).toPromise();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async createAccount(loginInfo: string): Promise<boolean> {
        try {
            await this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/register`, loginInfo).pipe(take(1)).toPromise();
            return true;
        } catch (error) {
            return false;
        }
    }

    forgotPassword(email: string): Observable<JSON> {
        return this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/recovery/start`, JSON.stringify({ email }));
    }

    resetPassWord(password: string): boolean {
        const jsonPasswordReset = JSON.stringify({ password: password });
        console.log(jsonPasswordReset);
        return true;
    }

    confirmCode(code: number): Observable<JSON> {
        return this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/recovery/confirm`, JSON.stringify({ email: this.email, code }));
    }
}
