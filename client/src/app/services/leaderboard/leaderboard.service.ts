import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';

@Injectable({
    providedIn: 'root',
})
export class LeaderboardService {
    constructor(private httpClient: HttpClient) {}

    // tslint:disable-next-line:no-any
    async games(): Promise<any> {
        try {
            const res = await this.httpClient.get<JSON>(`http://${SERVER_HOSTNAME}/leaderboard/game`).toPromise();
            return res;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // tslint:disable-next-line:no-any
    async winRate(): Promise<any> {
        try {
            const res = await this.httpClient.get<JSON>(`http://${SERVER_HOSTNAME}/leaderboard/win-rate`).toPromise();
            return res;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // tslint:disable-next-line:no-any
    async averageTime(): Promise<any> {
        try {
            const res = await this.httpClient.get<JSON>(`http://${SERVER_HOSTNAME}/leaderboard/average-time`).toPromise();
            return res;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // tslint:disable-next-line:no-any
    async mostTime(): Promise<any> {
        try {
            const res = await this.httpClient.get<JSON>(`http://${SERVER_HOSTNAME}/leaderboard/most-time`).toPromise();
            return res;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
