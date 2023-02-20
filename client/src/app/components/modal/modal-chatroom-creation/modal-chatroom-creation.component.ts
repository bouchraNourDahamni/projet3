import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';

@Component({
    selector: 'app-modal-chatroom-creation',
    templateUrl: './modal-chatroom-creation.component.html',
    styleUrls: ['./modal-chatroom-creation.component.scss'],
})
export class ModalChatroomCreationComponent {
    chatForm: FormGroup;
    emailForm: FormGroup;
    isValidForm: boolean = true;
    isValidEmail: boolean = true;
    emailList: string[] = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    constructor(
        private formBuilder: FormBuilder,
        public dialog: MatDialog,
        private authentificationService: AuthentificationService,
        private chatService: ChatGameService,
        private httpClient: HttpClient,
    ) {
        this.chatForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });

        this.emailForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });

        this.emailList.push(this.authentificationService.email);
    }

    add(event: MatChipInputEvent): void {
        const INPUT: HTMLInputElement = event.input;
        const VALUE: string = event.value.trim();

        if (this.emailForm.invalid) {
            INPUT.value = '';
            this.isValidEmail = false;
            return;
        }
        this.emailList.push(VALUE);
        INPUT.value = '';
    }

    remove(tag: string): void {
        const INDEX = this.emailList.indexOf(tag);
        if (INDEX >= 0 && this.emailList.length > 0 && INDEX < this.emailList.length) {
            this.emailList.splice(INDEX, 1);
        }
    }

    sendSetup(): void {
        if (this.chatForm.invalid || this.emailList.length <= 1) {
            this.isValidForm = false;
            return;
        }
        this.dialog.closeAll();
        this.isValidForm = true;
        const NAME: string = this.chatForm.controls.name.value;
        this.chatService.createChatroom(NAME, this.emailList);
        const user = JSON.stringify({ email: this.authentificationService.email, trophy: 'SEUL AVEC LES CHUMS!' });
        this.httpClient.post<JSON>('http://' + SERVER_HOSTNAME + '/trophy/give', user).toPromise();
    }
}
