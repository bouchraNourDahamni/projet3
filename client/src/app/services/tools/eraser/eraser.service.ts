import { Injectable } from '@angular/core';
import { Action } from '@app/classes/action-line';
import { InteractionPath } from '@app/classes/action/interaction-path';
import { Description } from '@app/classes/description';
import { TICK_RATE } from '@app/classes/drawing-info';
import { MouseButton } from '@app/classes/mouse';
import { StrokeAction } from '@app/classes/stroke-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { WidthService } from '@app/services/tool-modifier/width/width.service';

// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions
// tslint:disable:no-any
// tslint:disable:no-magic-numbers

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private pathData: Vec2[];
    private pathData2: Vec2[];
    private eraserColor: string = '#FFFFFF';
    minWidth: number = 5;
    private interval: any;
    constructor(drawingService: DrawingService, private widthService: WidthService, private gameManagement: GameManagementService) {
        super(drawingService, new Description('efface', 'e', 'erase_icon.png'));
        this.modifiers.push(this.widthService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.pathData2.push(this.mouseDownCoord);
            this.sendData();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const MOUSE_POSITION = this.getPositionFromMouse(event);
            this.pathData.push(MOUSE_POSITION);
            this.pathData2.push(MOUSE_POSITION);
            const stroke: StrokeAction = {
                pathData: this.pathData,
                color: '#ffffff',
                size: this.widthService.getWidth(),
                opacity: 1,
                action: Action.save,
            };
            this.gameManagement.savePath(stroke);
        }
        this.mouseDown = false;
        clearInterval(this.interval);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const MOUSE_POSITION = this.getPositionFromMouse(event);
            this.pathData.push(MOUSE_POSITION);
            this.pathData2.push(MOUSE_POSITION);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
        this.eraserVisual(event);
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineWidth = Math.max(this.widthService.getWidth(), this.minWidth); // width ajustment
        ctx.strokeStyle = this.eraserColor;
        ctx.fillStyle = this.eraserColor;
        const STARTING_PONT_ADJUSTMENT = 2;
        ctx.fillRect(
            path[0].x - this.widthService.getWidth() / STARTING_PONT_ADJUSTMENT,
            path[0].y - this.widthService.getWidth() / STARTING_PONT_ADJUSTMENT,
            this.widthService.getWidth(),
            this.widthService.getWidth(),
        );
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private eraserVisual(event: MouseEvent): void {
        const MOUSE_POSITION: Vec2 = { x: event.offsetX, y: event.offsetY };
        if (!this.isInCanvas(MOUSE_POSITION)) this.drawingService.clearCanvas(this.drawingService.previewCtx);
        else {
            const BORDER_COLOR = '#000000';
            const BORDER_WIDTH = 1;
            const SQARE_WIDTH: number = Math.max(this.widthService.getWidth(), this.minWidth);

            this.drawingService.previewCtx.strokeStyle = BORDER_COLOR;
            this.drawingService.previewCtx.fillStyle = this.eraserColor;
            this.drawingService.previewCtx.lineWidth = BORDER_WIDTH;

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.strokeRect(
                event.offsetX - SQARE_WIDTH / 2,
                event.offsetY - SQARE_WIDTH / 2,
                SQARE_WIDTH + 1,
                SQARE_WIDTH + 1,
            );
            this.drawingService.previewCtx.fillRect(
                event.offsetX - SQARE_WIDTH / 2,
                event.offsetY - SQARE_WIDTH / 2,
                SQARE_WIDTH + 1,
                SQARE_WIDTH + 1,
            );
        }
    }

    private clearPath(): void {
        this.pathData = [];
        this.pathData2 = [];
    }

    execute(interaction: InteractionPath): void {
        this.drawLine(this.drawingService.baseCtx, interaction.path);
    }

    private sendData(): void {
        const SELF = this;
        this.interval = setInterval(function (): void {
            if (SELF.pathData2.length !== 2 && SELF.mouseDown) {
                const stroke: StrokeAction = {
                    pathData: SELF.pathData2,
                    color: '#ffffff',
                    size: SELF.widthService.getWidth(),
                    opacity: 1,
                    action: Action.stroke,
                };
                SELF.gameManagement.sendPath(stroke);
                SELF.pathData2 = [];
                if (SELF.pathData.length !== 0) {
                    if (SELF.pathData.length !== 1) {
                        SELF.pathData2.push(SELF.pathData[SELF.pathData.length - 2]);
                    }
                    SELF.pathData2.push(SELF.pathData[SELF.pathData.length - 1]);
                }
            }
        }, 1000 / TICK_RATE);
    }
}
