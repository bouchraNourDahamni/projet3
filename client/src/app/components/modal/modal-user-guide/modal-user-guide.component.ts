import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { DialogData } from '@app/classes/dialog-data';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
// tslint:disable:no-any

@Component({
    selector: 'app-modal-user-guide',
    templateUrl: './modal-user-guide.component.html',
    styleUrls: ['./modal-user-guide.component.scss'],
})
export class UserGuideModalComponent {
    tabList: boolean[] = [true, false, false, false, false];
    constructor(
        public dialogRef: MatDialogRef<UserGuideModalComponent>,
        private httpClient: HttpClient,
        private authentificationService: AuthentificationService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        d: MatTabsModule,
        dialog: MatDialog,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    changedTab(event: any): void {
        this.tabList[event.index] = true;
        const allOpened = this.tabList.every((e: boolean) => {
            return e;
        });
        if (allOpened) {
            const user = JSON.stringify({ email: this.authentificationService.email, trophy: 'MAÎTRE DES TUTORIELS!' });
            this.httpClient.post<JSON>('http://' + SERVER_HOSTNAME + '/trophy/give', user).toPromise();
        }
    }
}
