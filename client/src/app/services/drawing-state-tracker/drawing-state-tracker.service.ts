import { Injectable } from '@angular/core';
import { Stroke } from '@app/classes/stroke';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingStateTrackerService {
    actions: Stroke[] = [];
    private actionsToRedo: Stroke[] = [];

    constructor(private drawingService: DrawingService, private autoSaveService: AutoSaveService) {}

    onCtrlZDown(): void {
        this.undo();
    }

    onCtrlShiftZDown(): void {
        this.redo();
    }

    addAction(stroke: Stroke): void {
        this.actionsToRedo = [];
        this.actions.push(stroke);

        // autosave
        const DATA_URL: string = this.drawingService.baseCtx.canvas.toDataURL() as string;
        this.autoSaveService.autoSave(DATA_URL);
    }

    undo(): void {
        // Add the undone action and canvas to the redo state
        const ACTION_UNDONE: Stroke | undefined = this.actions.pop();
        if (!ACTION_UNDONE) return;
        this.actionsToRedo.push(ACTION_UNDONE);
        this.reconstituteCanvas();
    }

    redo(): void {
        // Add the redone action and canvas to the done actions state
        const ACTION_TO_REDO: Stroke | undefined = this.actionsToRedo.pop();
        if (!ACTION_TO_REDO) return;
        this.actions.push(ACTION_TO_REDO);
        this.reconstituteCanvas();
    }

    reset(): void {
        this.actions = [];
        this.actionsToRedo = [];
    }

    private reconstituteCanvas(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (const stroke of this.actions) {
            this.drawLine(stroke);
        }
    }

    private drawLine(stroke: Stroke): void {
        const { opacity, size, color, pathData: path } = stroke;
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.globalAlpha = opacity;
        this.drawingService.baseCtx.lineWidth = size;
        this.drawingService.baseCtx.strokeStyle = color;
        this.drawingService.baseCtx.fillStyle = color;

        if (2 >= path.length) {
            const { x, y } = path[0];
            this.drawingService.baseCtx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        for (const point of path) {
            this.drawingService.baseCtx.lineTo(point.x, point.y);
        }
        this.drawingService.baseCtx.stroke();
    }
}
