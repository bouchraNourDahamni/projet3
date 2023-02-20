import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Description } from '@app/classes/description';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolboxService } from './toolbox.service';
class ToolStub extends Tool {}

// tslint:disable:no-any
describe('ToolboxService', () => {
    let service: ToolboxService;
    let toolStub: ToolStub;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    beforeEach(() => {
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                ToolboxService,
                MatSnackBar,
                Overlay,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        });
        service = TestBed.inject(ToolboxService);
        toolStub = new ToolStub({} as DrawingService, {} as Description);

        const canvasWidth = 1000;
        const canvasHeight = 800;
        (service as any).drawingService.baseCtx = baseCtxStub;
        (service as any).drawingService.previewCtx = previewCtxStub;
        (service as any).drawingService.selectionCtx = selectionCtxStub;
        (service as any).drawingService.canvas = canvasStub;
        (service as any).drawingService.canvas.width = canvasWidth;
        (service as any).drawingService.canvas.height = canvasHeight;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setSelectedTool shoud set the current tool to the tool given as an input', () => {
        service.setSelectedTool(toolStub);
        const currentTool: Tool = service.getCurrentTool();
        expect(currentTool).toEqual(toolStub);
    });

    it('getAvailableTools shoud return a list of tools', () => {
        const availableTools: Tool[] = service.getAvailableTools();
        const outputIsArrau = Array.isArray(availableTools);
        expect(outputIsArrau).toEqual(true);
    });
});
