import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfile } from '@app/classes/profile';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { take } from 'rxjs/operators';

// tslint:disable:deprecation

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    profile: UserProfile;
    avatar: string;
    readonly displayedColumns: string[] = ['Début', 'Fin', 'Joueurs', 'Résultat'];
    readonly soloColumns: string[] = ['Début', 'Fin', 'Résultat'];
    readonly connectionColumns: string[] = ['Connexions', 'Déconnexions'];
    readonly tropheeColumns: string[] = ['Trophées'];

    constructor(private httpClient: HttpClient, private router: Router, private actRoute: ActivatedRoute) {}

    ngOnInit(): void {
        if (this.profile) {
            return;
        }
        const email = this.actRoute.snapshot.params.user;
        this.httpClient.get(`http://${SERVER_HOSTNAME}/user/${email}`).pipe(take(1)).subscribe(this.handleRequest.bind(this), console.log);
    }

    // tslint:disable:no-any
    handleRequest(data: any): void {
        // mapping (ugly)
        this.profile = {
            email: data.email,
            public: data.public,
            private: {
                lastName: data.private.lastname,
                firstName: data.private.firstname,
                password: data.private.password,
            },
            statistics: {
                games: data.statistics.games,
                winRatio: data.statistics.winratio,
                wins: data.statistics.wins,
                losts: data.statistics.losts,
                avarageTime: this.nsToMin(data.statistics.avaragetime), // duration
                totalTime: this.nsToMin(data.statistics.totaltime), // duration
            },
            history: {
                creationDate: data.history.creationdate,
                connections: data.history.connections,
                deconnections: data.history.deconnections,
                gameHistory: {
                    Classic: data.history.gamesHistory?.classic,
                    Solo: data.history.gamesHistory?.solo,
                },
                chatChannels: data.history.chatchannels,
            },
            trophies: data.trophies,
        };
        this.avatar = `http://${SERVER_HOSTNAME}${this.profile.public.avatar}`;
        this.ngOnInit();
    }

    nsToMin(time: number): string {
        const nsToMin = 0.00000000001666667;
        const timeInMinutes: number = time * nsToMin;
        const minutes: number = Math.floor(timeInMinutes);
        const secondsInMinutes = 60;
        const seconds: number = Math.round(Number((timeInMinutes - minutes).toPrecision(2)) * secondsInMinutes);
        return `${minutes} minutes ${seconds} secondes`;
    }

    zipSessions(): Date[][] {
        if (this.profile == null) {
            return [];
        }
        const { connections, deconnections } = this.profile.history;
        return connections.map((connection, i) => [connection, deconnections[i]]);
    }

    convertToLocalTime(time: Date): string {
        return time == null ? '' : new Date(time).toLocaleString('en-US', { timeZone: 'America/New_York' });
    }
    exitLobby(): void {
        this.router.navigate(['/polydessin']);
    }
}
