import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameManagementService } from '@app/services/game-management/game-management.service';

export interface EndGameData {
    team1Score?: number;
    team2Score?: number;
    score?: number;
}

@Component({
    selector: 'app-endgamenotification',
    templateUrl: './endgamenotification.component.html',
    styleUrls: ['./endgamenotification.component.scss'],
})
export class EndgamenotificationComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<EndgamenotificationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EndGameData,
        public gameManagementService: GameManagementService,
        private router: Router,
    ) {
        // tslint:disable-next-line: deprecation
    }

    onNoclick(): void {
        this.gameManagementService.openEndGameDialogBehaviour.next(false);
        this.closeDialog();
        // tslint:disable-next-line: deprecation
        this.dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/polydessin']);
        });
    }

    ngOnInit(): void {
        this.gameManagementService.updateGameInfo();
    }
    closeDialog(): void {
        this.dialogRef.close();
    }
}
