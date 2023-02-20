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
import { ColorService } from '@app/services/tool-modifier/color/color.service';
import { WidthService } from '@app/services/tool-modifier/width/width.service';

// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions
// tslint:disable:no-any
// tslint:disable:no-magic-numbers

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    private pathData2: Vec2[];
    private interval: any;

    constructor(
        drawingService: DrawingService,
        private colorService: ColorService,
        private widthService: WidthService,
        private gameManagement: GameManagementService,
    ) {
        super(drawingService, new Description('crayon', 'c', 'pencil_icon.png'));
        this.modifiers.push(this.colorService);
        this.modifiers.push(this.widthService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.setLineDash([0]);
        this.drawingService.baseCtx.setLineDash([0]);
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
                color: this.colorService.getPrimaryColor(),
                size: this.widthService.getWidth(),
                opacity: this.colorService.getPrimaryColorOpacity() || 1,
                action: Action.save,
            };
            this.gameManagement.savePath(stroke);
        }
        this.mouseDown = false;
        clearInterval(this.interval);
        this.clearPath();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }
        const MOUSE_POSITION = this.getPositionFromMouse(event);
        if (this.isInCanvas(MOUSE_POSITION)) {
            this.pathData.push(MOUSE_POSITION);
            this.pathData2.push(MOUSE_POSITION);
            // We draw on the preview canvas and erase it each time the mouse is moved
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        } else {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearPath();
            this.mouseDown = false;
        }
    }

    setColor(color: string): void {
        this.colorService.setPrimaryColor(color);
    }

    setWidth(width: number): void {
        this.widthService.setWidth(width);
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.globalAlpha = this.colorService.getPrimaryColorOpacity();
        ctx.lineWidth = this.widthService.getWidth(); // width ajustment
        ctx.strokeStyle = this.colorService.getPrimaryColor(); // color of the line
        ctx.fillStyle = this.colorService.getPrimaryColor(); // color of the starting point

        if (2 >= path.length) {
            ctx.fillRect(
                path[0].x - this.widthService.getWidth() / 2,
                path[0].y - this.widthService.getWidth() / 2,
                this.widthService.getWidth(),
                this.widthService.getWidth(),
            );
        }
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
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
                    color: SELF.colorService.getPrimaryColor(),
                    size: SELF.widthService.getWidth(),
                    opacity: SELF.colorService.getPrimaryColorOpacity() || 1,
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
