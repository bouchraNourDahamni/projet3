import { AfterViewInit, Component } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';
import { IpcRenderer } from 'electron';

// tslint:disable:only-arrow-functions
// tslint:disable:no-magic-numbers
// tslint:disable:no-angle-bracket-type-assertion
// tslint:disable:no-any
// tslint:disable: radix

@Component({
    selector: 'app-textchat',
    templateUrl: './textchat.component.html',
    styleUrls: ['./textchat.component.scss'],
})
export class TextchatComponent implements AfterViewInit {
    currentEmail: string = '';
    newMessage: string = '';
    currentChatroom: string = '1- General';
    chatroomList: any[] = [];
    private ipcRenderer: IpcRenderer;

    constructor(
        private authentificationService: AuthentificationService,
        public chatGame: ChatGameService,
        private modalHandler: ModalHandlerService,
    ) {
        this.currentEmail = this.authentificationService.email;
        if ((<any>window).require) {
            try {
                this.ipcRenderer = (<any>window).require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        }
        const index = this.chatGame.chatIdList.find((obj) => obj.includes(this.chatGame.currentChatroom.chatroomId.toString()));
        this.currentChatroom = index ? index : '1- General';
    }

    ngAfterViewInit(): void {
        this.chatGame.scrollDown();
    }

    sendMessage(): void {
        if (this.newMessage.trim() !== '') {
            this.chatGame.sendMessage(this.newMessage, this.currentEmail);
        }
        this.newMessage = '';
    }

    windowMode(): void {
        let message = this.currentEmail;
        for (const id of this.chatGame.chatIdList) {
            message += ':';
            message += id;
        }
        this.ipcRenderer.send('openModal', message);
    }

    changeChat(): void {
        if (this.chatGame.wsChat.readyState === WebSocket.OPEN) {
            this.chatGame.wsChat.close();
        }
        const chatId = this.currentChatroom.split('-');
        this.chatGame.connectToChatWebSocket(+chatId[0]);
        this.chatGame.receiveMessage();
    }

    createChat(): void {
        this.modalHandler.openChatroomCreation();
    }

    addMember(): void {
        this.modalHandler.openAddMember();
    }
    refreshChat(): void {
        this.chatGame.getUserChatrooms();
    }

    guessMessage(): void {
        if (this.newMessage.trim() !== '') {
            this.chatGame.gameManager.sendGuess(JSON.stringify({ email: this.currentEmail, username: this.currentEmail, message: this.newMessage }));
        }
        this.newMessage = '';
    }

    deleteChat(): void {
        if (this.chatGame.currentChatroom.chatroomId !== 1) {
            if (confirm('Voulez-vous supprimer définitivement le salon ' + this.currentChatroom + ' ?')) {
                this.currentChatroom = '1- General';
                this.chatGame.deleteChatroom(parseInt(this.currentChatroom));
            }
        }
    }
    askHint(): void {
        this.chatGame.askHint();
    }
}
