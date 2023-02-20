import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';
import { ToolboxService } from '@app/services/toolbox/toolbox.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    messageNewDrawing: string = 'Nouveau dessin\n(Raccourci: Ctr + O)';
    messageUserGuide: string = "Guide d'utilisation";
    messageBack: string = 'Retour';
    messageSaveDialog: string = 'Sauvegarder\n(Raccourci: Ctr + S)';
    messageCarouselDialog: string = 'Carousel de dessins\n(Raccourci: Ctr + G)';
    messageExportDialog: string = 'Exporter\n(Raccourci: Ctr + E)';

    messageUndo: string = 'Annuler\n(Raccourci: Ctr + Z)';
    messageRedo: string = 'Refaire\n(Raccourci: Ctr + Shift + Z)';

    messageMagnet: string = 'Magnetisme\n(Raccourci: M)';

    constructor(
        private toolboxSevice: ToolboxService,
        private drawingService: DrawingService,
        private router: Router,
        private modalHandler: ModalHandlerService,
        public gameManagementService: GameManagementService,
    ) {}

    undo(): void {
        this.gameManagementService.sendUndo();
    }

    redo(): void {
        this.gameManagementService.sendRedo();
    }

    getListOfTools(): Tool[] {
        return this.toolboxSevice.getAvailableTools();
    }

    getCurrentTool(): Tool {
        return this.toolboxSevice.getCurrentTool();
    }

    setCurrentTool(tool: Tool): void {
        this.drawingService.shortcutEnable = true;
        this.toolboxSevice.setSelectedTool(tool);
    }

    formatTooltipMessage(tool: Tool): string {
        return 'Outil : ' + tool.name + '\n( Raccourci: ' + tool.shortcut + ' )';
    }

    navigateToMain(): void {
        if (this.gameManagementService.inGame) {
            this.gameManagementService.wsDrawing.close();
            this.gameManagementService.inGame = false;
        } else {
            this.gameManagementService.resetImage();
        }
        this.router.navigate(['/polydessin']);
    }

    resetDrawing(): void {
        this.drawingService.resetDrawingWithWarning();
        this.gameManagementService.resetImage();
    }

    openGuide(): void {
        this.modalHandler.openUserGuide();
    }

    openSaveDialog(): void {
        this.modalHandler.openSaveDialog();
    }
}
