import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingStateTrackerService } from '@app/services/drawing-state-tracker/drawing-state-tracker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';
import { ToolboxService } from '@app/services/toolbox/toolbox.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { WorkzoneSizeService } from '@app/services/workzone-size-service/workzone-size.service';
import * as confetti from 'canvas-confetti';
export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 800;
@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('animationCanvas', { static: false }) animationCanvas: ElementRef<HTMLCanvasElement>;

    readonly BACKSPACE_KEYCODE: number = 32;
    openDialog: boolean;
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    hasBeenDrawnOnto: boolean;

    constructor(
        public modalHandlerService: ModalHandlerService,
        public toolbox: ToolboxService,
        public dialog: MatDialog,
        private drawingService: DrawingService,
        private workzoneSizeService: WorkzoneSizeService,
        private gridService: GridService,
        private drawingStateTrackingService: DrawingStateTrackerService,
        private gameManagementService: GameManagementService,
    ) {
        this.openDialog = false;
    }

    // tslint:disable:no-magic-numbers
    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.baseCtx.canvas.width = DEFAULT_WIDTH;
        this.drawingService.baseCtx.canvas.height = DEFAULT_HEIGHT;
        this.drawingService.previewCtx.canvas.width = DEFAULT_WIDTH;
        this.drawingService.previewCtx.canvas.height = DEFAULT_HEIGHT;
        this.gridCtx.canvas.width = DEFAULT_WIDTH;
        this.gridCtx.canvas.height = DEFAULT_HEIGHT;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.hasBeenDrawnOnto = false;
        this.gridService.gridCtx = this.gridCtx;
        this.gridService.gridCanvas = this.gridCanvas.nativeElement;
        // Fills the canvas with white
        this.baseCtx.fillStyle = '#FFFFFF';
        this.baseCtx.fillRect(0, 0, this.baseCtx.canvas.width, this.baseCtx.canvas.height);
        this.gridService.resetGrid();
        this.surpriseEndGame();
    }

    surpriseEndGame(): void {
        // tslint:disable-next-line: deprecation
        this.gameManagementService.openEndGameDialogBehaviour.subscribe((openDialog) => {
            if (openDialog) {
                this.openDialog = openDialog;
                this.surprise();
            }
        });
    }

    resetDrawing(): void {
        this.drawingStateTrackingService.reset();
        this.drawingService.resetDrawingWithWarning();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.workzoneSizeService.onResize();
    }

    @HostListener('document:keydown.control.o', ['$event'])
    createNewDrawingKeyboardEvent(event: KeyboardEvent): void {
        event.preventDefault();
        this.resetDrawing();
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        event.preventDefault();
        this.toolbox.getCurrentTool().onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.gameManagementService.activateDrawing.subscribe((activateDrawring) => {
            if (activateDrawring) {
                this.toolbox.getCurrentTool().onMouseDown(event);
                this.drawingService.hasBeenDrawnOnto = true;
            }
        });
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        this.toolbox.getCurrentTool().onMouseUp(event);
    }

    @HostListener('window:keyup', ['$event'])
    keyEventUp(event: KeyboardEvent): void {
        const IS_CTRL_KEY: boolean = event.ctrlKey;
        if (this.drawingService.shortcutEnable && !IS_CTRL_KEY && document.activeElement?.id !== 'chatInput') {
            for (const i in this.toolbox.getAvailableTools()) {
                if (this.toolbox.getAvailableTools()[i].shortcut === event.key.toLowerCase()) {
                    this.toolbox.setSelectedTool(this.toolbox.getAvailableTools()[i]);
                }
            }
        }
    }

    // tslint:disable:cyclomatic-complexity
    @HostListener('window:keydown', ['$event'])
    onShiftDown(event: KeyboardEvent): void {
        const KEY_CODE: string = event.key;
        const KEY_CODE_LOWER_CASE = KEY_CODE.toLowerCase();
        const IS_CTRL_KEY: boolean = event.ctrlKey;
        const IS_SHIFT_KEY: boolean = event.shiftKey;
        const SHORT_CUT_ENABLE: boolean = this.drawingService.shortcutEnable;

        if (!KEY_CODE) {
            return;
        }

        if (IS_CTRL_KEY) {
            if (IS_SHIFT_KEY) {
                if (KEY_CODE_LOWER_CASE === 'z') {
                    event.preventDefault(); // to prevent key of windows
                    this.gameManagementService.sendRedo();
                }
            } else {
                if (KEY_CODE_LOWER_CASE === 'z') {
                    event.preventDefault(); // to prevent key of windows
                    this.gameManagementService.sendUndo();
                }
                if (SHORT_CUT_ENABLE) {
                    switch (KEY_CODE_LOWER_CASE) {
                        case 's':
                            event.preventDefault(); // to prevent key of windows
                            this.modalHandlerService.openSaveDialog();
                            break;
                        case 'g':
                            event.preventDefault(); // to prevent key of windows
                            this.modalHandlerService.openDrawingCarouselDialog();
                            break;
                        case 'e':
                            event.preventDefault(); // to prevent key of windows
                            this.modalHandlerService.openExportDialog();
                            break;
                    }
                }
            }
        } else if (document.activeElement?.id !== 'chatInput') {
            if (!SHORT_CUT_ENABLE) return;
            switch (KEY_CODE_LOWER_CASE) {
                case 'g':
                    event.preventDefault(); // to prevent key of windows
                    this.gridService.toogleGrid();
                    break;
                case '+':
                    event.preventDefault(); // to prevent key of windows
                    this.gridService.incrementSpacing();
                    break;
                case '-':
                    event.preventDefault(); // to prevent key of windows
                    this.gridService.decrementSpacing();
                    break;
            }
        }
    }

    get width(): number {
        return this.workzoneSizeService.drawingZoneWidth;
    }

    get height(): number {
        return this.workzoneSizeService.drawingZoneHeight;
    }
    async surprise(): Promise<void> {
        // tslint:disable-next-line:prettier
        await this.delay(500);
        if (this.openDialog) {
            const myConfetti = confetti.create(this.animationCanvas.nativeElement, {
                resize: true, // will fit all screen sizes
                useWorker: true,
            });
            myConfetti({
                particleCount: 5000,
                spread: 360,
                gravity: 3,
            });
            myConfetti({
                particleCount: 5000,
                angle: 60,
                spread: 360,
                gravity: 3,
                origin: { x: 0 },
            });
            // and launch a few from the right edge
            myConfetti({
                particleCount: 5000,
                angle: 120,
                spread: 360,
                gravity: 3,
                origin: { x: 1 },
            });
        }
        this.gameManagementService.openEndGameDialogBehaviour.next(false);
    }

    // tslint:disable-next-line: no-any
    // tslint:disable-next-line:typedef
    async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
