import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';

@Injectable({
    providedIn: 'root',
})
export class ToolboxService {
    private availableTools: Tool[] = [];
    private currentTool: Tool;

    constructor(gridService: GridService, pencilService: PencilService, eraserService: EraserService, private drawingService: DrawingService) {
        this.currentTool = pencilService;
        this.availableTools.push(gridService);
        this.availableTools.push(pencilService);
        this.availableTools.push(eraserService);
    }

    getAvailableTools(): Tool[] {
        return this.availableTools;
    }

    getCurrentTool(): Tool {
        return this.currentTool;
    }

    setSelectedTool(selectedTool: Tool): void {
        this.currentTool = selectedTool;
        this.currentTool.mouseDown = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }
}
