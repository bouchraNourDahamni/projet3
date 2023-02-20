import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameManagementService } from '@app/services/game-management/game-management.service';

// tslint:disable:no-empty
// tslint:disable:typedef
// tslint:disable:no-any

@Component({
    selector: 'app-waiting-game',
    templateUrl: './waiting-game.component.html',
    styleUrls: ['./waiting-game.component.scss'],
})
export class WaitingGameComponent implements AfterViewInit {
    panelOpenState = false;
    gameInfo: any;
    gamePlayers: string[];
    isDisabled = true;

    constructor(private gameManagementService: GameManagementService, private router: Router) {
        this.gameInfo = this.gameManagementService.gameToJoin;
    }

    ngAfterViewInit(): void {
        this.gameManagementService.gameInfoBehaviour.subscribe((gameInfoBehaviour) => {
            this.gameInfo = gameInfoBehaviour;
            if (this.gameInfo.humanPlayers >= 2) {
                this.isDisabled = false;
            }
        });
        this.gameManagementService.gamePlayersBehaviour.subscribe((gamePlayers) => {
            this.gamePlayers = gamePlayers.emails;
        });
    }
    startGame(): void {
        this.gameManagementService.startGame();
    }

    exitLobby(): void {
        this.gameManagementService.wsDrawing.close();
        this.gameManagementService.inGame = false;
        this.router.navigate(['/polydessin']);
    }
}
