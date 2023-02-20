import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';

@Component({
    selector: 'app-modal-game-setup',
    templateUrl: './modal-game-setup.component.html',
    styleUrls: ['./modal-game-setup.component.scss'],
})
export class ModalGameSetupComponent {
    gameForm: FormGroup;
    isValid: boolean = true;
    // tslint:disable-next-line:no-any
    soloGameInfo: any;
    // tslint:disable-next-line:max-line-length
    constructor(
        formBuilder: FormBuilder,
        private router: Router,
        public dialog: MatDialog,
        private httpClient: HttpClient,
        private chatGame: ChatGameService,
    ) {
        this.gameForm = formBuilder.group({
            gamemode: ['', [Validators.required]],
            difficulty: ['', [Validators.required]],
        });
    }

    sendSetup(): void {
        if (this.gameForm.invalid) {
            this.isValid = false;
            return;
        }
        this.dialog.closeAll();
        this.isValid = true;
        switch (this.gameForm.controls.gamemode.value) {
            case 'Classique':
                const GAMEMODE = this.gameForm.controls.gamemode.value;
                const DIFF = this.gameForm.controls.difficulty.value;
                this.router.navigate(['/lobbylist', { gamemode: GAMEMODE, difficulty: DIFF }]);
                break;
            case 'Solo':
                this.startSprintSolo();
                break;
            default:
                break;
        }
    }

    // tslint:disable-next-line:typedef
    async startSprintSolo() {
        if (this.gameForm.controls.gamemode.value === 'Solo') {
            const jsonGameSetUp = JSON.stringify({
                type: this.gameForm.controls.gamemode.value,
                difficulty: this.gameForm.controls.difficulty.value,
            });
            this.chatGame.gameManager.inGame = true;
            this.soloGameInfo = await this.httpClient.post<JSON>('http://' + SERVER_HOSTNAME + '/new/game', jsonGameSetUp).toPromise();
            await this.chatGame.joinChatGame(this.soloGameInfo.gameID, this.soloGameInfo.chatID);
        }
    }
}
