import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Chatroom } from '@app/classes/chatroom';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';

// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions
// tslint:disable:no-magic-numbers
// tslint:disable:typedef
// tslint:disable:no-any
// tslint:disable:no-empty

const CONNECTIONWAIT = 1000;
const SECONDS = 1000;
const NOTIFICATION_DELAY = 1 * SECONDS;

@Injectable({
    providedIn: 'root',
})
export class ChatGameService {
    userEmail: string = '';
    wsChat: WebSocket;
    currentChatroom: Chatroom = new Chatroom([], [], 1);
    chatIdList: string[] = ['1- General'];

    constructor(public gameManager: GameManagementService, authentificationService: AuthentificationService, private httpClient: HttpClient) {
        this.userEmail = authentificationService.email;
        this.getUserChatrooms();
        this.connectToChatWebSocket(1);
        this.receiveMessage();
    }

    async joinChatGame(gameId: number, chatId: number) {
        if (this.wsChat.readyState === WebSocket.OPEN) {
            this.wsChat.close();
        }
        this.connectToChatWebSocket(chatId);
        this.receiveMessage();
        this.chatIdList.push(chatId + '- Partie Courante');
        this.gameManager.joinDrawing(gameId.toString(), this.userEmail); // connecter au ws pour le dessin
    }

    // Permet de se connecter au WebSocket du chat
    connectToChatWebSocket(chatId: number): void {
        this.wsChat = new WebSocket(`ws://${SERVER_HOSTNAME}/chat/join/${chatId}`);
        this.waitForConnection(this.wsChat);
        this.currentChatroom = new Chatroom([], [], chatId);
    }

    receiveMessage(): void {
        const SELF = this;
        this.wsChat.addEventListener('message', function (e: MessageEvent): void {
            const data = JSON.parse(e.data);
            const date = new Date(data.sendDate);
            data.sendDate = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
            SELF.currentChatroom.history.push(data);
            SELF.scrollDown();
            if (data.email !== SELF.userEmail && Date.now() - date.getTime() < NOTIFICATION_DELAY) {
                SELF.playGameSound();
            }
        });
    }

    playGameSound(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/When_Notification_Ringtone.mp3';
        audio.load();
        audio.play();
    }

    waitForConnection(socket: WebSocket): void {
        const SELF = this;
        setTimeout(function (): void {
            if (socket.readyState === WebSocket.OPEN) {
                console.log('Connection is made to chat ' + SELF.currentChatroom.chatroomId);
            } else {
                SELF.waitForConnection(socket);
            }
        }, CONNECTIONWAIT);
    }

    // Envoie les messages du chat au serveur en utilisant le ws de chat
    async sendMessage(message: string, currentEmail: string): Promise<void> {
        this.wsChat.send(JSON.stringify({ email: currentEmail, username: currentEmail, message: message }));
    }

    createChatroom(name: string, member: string[]): void {
        const jsonChat = JSON.stringify({ name: name, members: member });
        this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/new/chat`, jsonChat).subscribe((data) => {
            this.getUserChatrooms();
        });
    }

    async getUserChatrooms(): Promise<void> {
        const data = await this.httpClient.get<any>('http://' + SERVER_HOSTNAME + '/info/user/chats/' + this.userEmail).toPromise();
        for (const value in data) {
            if (!this.chatIdList.includes(value + '- ' + data[value]) && data[value] !== '') {
                this.chatIdList.push(value + '- ' + data[value]);
            }
        }
    }

    addMember(emailList: string[]): void {
        emailList.forEach((element) => {
            const jsonChat = JSON.stringify({ email: element, chatID: this.currentChatroom.chatroomId });
            this.httpClient.post<JSON>(`http://${SERVER_HOSTNAME}/chat/new/member`, jsonChat).toPromise();
        });
    }

    scrollDown(): void {
        const messageHistory = document.getElementById('msg_history');
        if (messageHistory) {
            setTimeout(() => {
                messageHistory.scrollTop = messageHistory.scrollHeight;
            }, 0);
        }
    }

    removeGameChat(): void {
        let isCurrentChatDead = false;
        this.chatIdList.forEach((element) => {
            if (element.includes(this.currentChatroom.chatroomId.toString() + '- Partie Courante')) isCurrentChatDead = true;
        });
        this.chatIdList = this.chatIdList.filter((obj) => !obj.includes('Partie Courante'));
        if (isCurrentChatDead) {
            this.connectToChatWebSocket(1);
            this.receiveMessage();
        }
    }

    askHint(): void {
        this.httpClient
            .get<JSON>('http://' + SERVER_HOSTNAME + '/game/hint/' + this.gameManager.gameId)
            .toPromise()
            .then(() => {});
    }

    deleteChatroom(chatId: number) {
        this.wsChat.close();
        this.httpClient.get(`http://${SERVER_HOSTNAME}/chat/delete/${chatId}`).toPromise();
        this.getUserChatrooms();
        this.connectToChatWebSocket(1);
        this.receiveMessage();
    }
}
