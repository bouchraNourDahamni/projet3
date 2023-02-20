import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameManagementService } from '@app/services/game-management/game-management.service';

export interface DialogData {
    team1Score: number;
    team2Score: number;
    round: number;
}

@Component({
    selector: 'app-game-notification',
    templateUrl: './game-notification.component.html',
    styleUrls: ['./game-notification.component.scss'],
})
export class GameNotificationComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<GameNotificationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        public gameManagementService: GameManagementService,
    ) {}

    onNoclick(): void {
        this.gameManagementService.continueGame();
        this.gameManagementService.clearSurprise.next(true);
    }

    ngOnInit(): void {
        this.gameManagementService.updateGameInfo();
    }
    closeDialog(): void {
        this.dialogRef.close();
    }
}
