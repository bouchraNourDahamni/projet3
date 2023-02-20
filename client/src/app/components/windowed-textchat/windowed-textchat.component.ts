// tslint:disable:prettier
import { Component, OnInit } from '@angular/core';
import { Chatroom } from '@app/classes/chatroom';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { IpcRenderer } from 'electron';

// tslint:disable:only-arrow-functions
// tslint:disable:no-magic-numbers
// tslint:disable:no-angle-bracket-type-assertion
// tslint:disable:no-any

@Component({
    selector: 'app-windowed-textchat',
    templateUrl: './windowed-textchat.component.html',
    styleUrls: ['./windowed-textchat.component.scss'],
})
export class WindowedTextchatComponent implements OnInit {
    currentEmail: string = '';
    currentChatroomId: number = 1;
    chatIdList: string[] = [];
    selected: string = '1- General';
    newMessage: string = '';
    currentChatroom: Chatroom = new Chatroom([], [], 0);
    ws: WebSocket;
    private ipcRenderer: IpcRenderer;

    constructor() {
        if ((<any>window).require) {
            try {
                this.ipcRenderer = (<any>window).require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        } else {
            console.warn('App not running inside Electron!');
        }
    }

    ngOnInit(): void {
        const SELF = this;
        this.ipcRenderer.on('forChatWindow', function (event: any, message: string): void {
            const messageSplit = message.split(':');
            SELF.currentEmail = messageSplit[0];
            for (let i = 1; i < messageSplit.length; i++) {
                SELF.chatIdList.push(messageSplit[i]);
            }
        });
        this.connectToWebSocket();
        this.receiveMessage();
    }

    connectToWebSocket(): void {
        this.ws = new WebSocket(`ws://${SERVER_HOSTNAME}/chat/join/${this.currentChatroomId}`);
        this.waitForConnection(this.ws);
        this.currentChatroom = new Chatroom([], [], this.currentChatroomId);
    }

    waitForConnection(socket: WebSocket): void {
        const SELF = this;
        setTimeout(function (): void {
            if (socket.readyState === 1) {
                console.log('Connection is made to chat: ' + SELF.currentChatroomId);
            } else {
                SELF.waitForConnection(socket);
            }
        }, 1000);
    }

    receiveMessage(): void {
        const SELF = this;
        SELF.ws.addEventListener('message', function (e: MessageEvent): void {
            const data = JSON.parse(e.data);
            const date = new Date(data.sendDate);
            data.sendDate = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
            SELF.currentChatroom.history.push(data);
            SELF.scrollDown();
        });
    }

    async sendMessage(): Promise<void> {
        if (this.newMessage.trim() !== '') {
            this.ws.send(JSON.stringify({ email: this.currentEmail, username: this.currentEmail, message: this.newMessage }));
        }
        this.newMessage = '';
    }

    scrollDown(): void {
        const messageHistory = document.getElementById('msg_history');
        if (messageHistory) {
            setTimeout(() => {
                messageHistory.scrollTop = messageHistory.scrollHeight;
            }, 0);
        }
    }

    changeChat(): void {
        this.ws.close();
        this.currentChatroomId = +this.selected.split('-')[0];
        this.connectToWebSocket();
        this.receiveMessage();
    }
}
