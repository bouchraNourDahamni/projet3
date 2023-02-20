import { Component } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(
        private modalHandler: ModalHandlerService,
        private autoSaveService: AutoSaveService,
        public authentificationService: AuthentificationService,
        private chatService: ChatGameService,
    ) {
        this.chatService.removeGameChat();
    }

    openUserGuide(): void {
        this.modalHandler.openUserGuide();
    }

    openGameLobby(): void {
        this.modalHandler.openLobbySetup();
    }

    hasSavedDrawing(): boolean {
        return this.autoSaveService.hasSavedDrawing();
    }
    disconnect(): void {
        this.chatService.wsChat.close();
        this.chatService.gameManager.wsSession.close();
    }
}
