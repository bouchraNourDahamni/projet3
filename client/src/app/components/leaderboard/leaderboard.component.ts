import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LeaderboardService } from '@app/services/leaderboard/leaderboard.service';

interface Player {
    position: number;
    email: string;
    variable: number;
}
const NANOTOMIN = 6000000000;

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
    // tslint:disable-next-line:variable-name
    PositionsGames: number = 1;
    // tslint:disable-next-line:variable-name
    PositionsWinRatio: number = 1;
    // tslint:disable-next-line:variable-name
    PositionsAverageTime: number = 1;
    // tslint:disable-next-line:variable-name
    PostitionsMostTime: number = 1;
    leaderboardGames: Player[] = [];
    leaderboardWinRate: Player[] = [];
    leaderboardAverageTime: Player[] = [];
    leaderboardMostTime: Player[] = [];
    displayedColumns: string[] = ['position', 'email', 'variable'];
    dataSourceGames: MatTableDataSource<Player>;
    dataSourceWinRate: MatTableDataSource<Player>;
    dataSourceAverageTime: MatTableDataSource<Player>;
    dataSourceMostTime: MatTableDataSource<Player>;

    constructor(private leaderboardService: LeaderboardService, private router: Router) {}

    async ngOnInit(): Promise<void> {
        const [resGames, resWinRate, resAverageTime, resMostTime] = await Promise.all([
            this.leaderboardService.games(),
            this.leaderboardService.winRate(),
            this.leaderboardService.averageTime(),
            this.leaderboardService.mostTime(),
        ]);

        if (resGames) {
            // tslint:disable-next-line:no-any
            resGames.forEach((element: any) => {
                const player: Player = { position: this.PositionsGames++, email: element.email, variable: element.statistics.games };
                this.leaderboardGames.push(player);
            });
            this.dataSourceGames = new MatTableDataSource(this.leaderboardGames);
        }

        if (resWinRate) {
            // tslint:disable-next-line:no-any
            resWinRate.forEach((element: any) => {
                const player: Player = { position: this.PositionsWinRatio++, email: element.email, variable: element.statistics.winratio };
                this.leaderboardWinRate.push(player);
            });
            this.dataSourceWinRate = new MatTableDataSource(this.leaderboardWinRate);
        }

        if (resAverageTime) {
            // tslint:disable-next-line:no-any
            resAverageTime.forEach((element: any) => {
                const player: Player = { position: this.PositionsAverageTime++, email: element.email, variable: element.statistics.avaragetime };
                player.variable = player.variable / NANOTOMIN;
                this.leaderboardAverageTime.push(player);
            });
            this.dataSourceAverageTime = new MatTableDataSource(this.leaderboardAverageTime);
        }

        if (resMostTime) {
            // tslint:disable-next-line:no-any
            resMostTime.forEach((element: any) => {
                const player: Player = { position: this.PostitionsMostTime++, email: element.email, variable: element.statistics.totaltime };
                player.variable = player.variable / NANOTOMIN;
                this.leaderboardMostTime.push(player);
            });
            this.dataSourceMostTime = new MatTableDataSource(this.leaderboardMostTime);
        }
    }

    // tslint:disable-next-line:typedef
    applyFilter(filterValue: string) {
        this.dataSourceGames.filter = filterValue.trim().toLowerCase();
    }
    exitLobby(): void {
        this.router.navigate(['/polydessin']);
    }
}
