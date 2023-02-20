import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any

export interface Game {
    gamemode: string;
    difficulty: string;
    playerList: string[];
    cpuList: string[];
    gameId: string;
    chatId: string;
}

@Component({
    selector: 'app-lobby-list-page',
    templateUrl: './lobby-list-page.component.html',
    styleUrls: ['./lobby-list-page.component.scss'],
})
export class LobbyListPageComponent {
    newGameInfo: any;
    gameInfo: any;
    isDisable: boolean = false;
    dataSource: any = new MatTableDataSource();
    filteredData: any = new MatTableDataSource();
    displayedColumns: string[] = ['gameID', 'humanPlayers', 'virtualPlayers', 'joinGame'];
    gamemode: string = '';
    difficulty: string = '';

    constructor(private httpClient: HttpClient, private router: Router, private chatGame: ChatGameService, route: ActivatedRoute) {
        route.params.subscribe((params) => {
            this.gamemode = params['gamemode'];
            this.difficulty = params['difficulty'];
        });
        this.getGameList();
    }

    getGameList(): void {
        this.httpClient
            .get<JSON>('http://' + SERVER_HOSTNAME + '/info/games')
            .toPromise()
            .then((data) => {
                this.gameInfo = data;
                this.setUpList();
            });
    }

    setUpList(): void {
        if (this.gameInfo !== null) {
            this.dataSource = new MatTableDataSource(this.gameInfo);
            this.dataSource.filter = this.gamemode;
            this.filteredData = new MatTableDataSource(this.dataSource.filteredData);
            this.filteredData.filter = this.difficulty;
        }
    }

    createGame(): void {
        const jsonGameSetUp = JSON.stringify({ type: this.gamemode, difficulty: this.difficulty });
        this.httpClient.post<JSON>('http://' + SERVER_HOSTNAME + '/new/game', jsonGameSetUp).subscribe((data) => {
            this.newGameInfo = data;
        });
        this.getGameList();
    }

    // tslint:disable-next-line:typedef
    async joinGame(gameId: number, chatID: number) {
        this.isDisable = true;
        await this.chatGame.joinChatGame(gameId, chatID);
    }
    exitLobby(): void {
        this.router.navigate(['/polydessin']);
    }
}
