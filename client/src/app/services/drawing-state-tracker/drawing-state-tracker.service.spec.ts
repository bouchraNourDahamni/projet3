import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService } from '@app/services/tools/grid/grid.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { DrawingStateTrackerService } from './drawing-state-tracker.service';
// The disablement of the "any" tslint rule is justified in this situation as the prototype
// of the jasmine.Spy type takes a generic argument whose type is by convention of type "any"
// tslint:disable:no-any
describe('DrawingStateTrackerService', () => {
    let service: DrawingStateTrackerService;
    let servicePencil: PencilService;
    let gridService: GridService;
    let onCtrlZDownSpy: jasmine.Spy<any>;
    let onCtrlShiftZDownSpy: jasmine.Spy<any>;
    let undoSpy: jasmine.Spy<any>;
    let redoSpy: jasmine.Spy<any>;
    let reconstituteCanvasSpy: jasmine.Spy<any>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                MatSnackBar,
                Overlay,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        });
        service = TestBed.inject(DrawingStateTrackerService);
        servicePencil = TestBed.inject(PencilService);

        gridService = TestBed.inject(GridService);
        gridService.gridCanvas = canvasTestHelper.canvas;
        gridService.gridCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        onCtrlZDownSpy = spyOn<any>(service, 'onCtrlZDown').and.callThrough();
        onCtrlShiftZDownSpy = spyOn<any>(service, 'onCtrlShiftZDown').and.callThrough();
        undoSpy = spyOn<any>(service, 'undo').and.callThrough();
        redoSpy = spyOn<any>(service, 'redo').and.callThrough();
        reconstituteCanvasSpy = spyOn<any>(service, 'reconstituteCanvas').and.callThrough();
        // Configuration of spy service
        const canvasWidth = 1000;
        const canvasHeight = 800;
        (service as any).drawingService.baseCtx = baseCtxStub;
        (service as any).drawingService.previewCtx = previewCtxStub;
        (service as any).drawingService.selectionCtx = selectionCtxStub;
        (service as any).drawingService.canvas = canvasStub;
        (service as any).drawingService.canvas.width = canvasWidth;
        (service as any).drawingService.canvas.height = canvasHeight;
        (gridService as any).gridCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call undo when  Ctrl + Z is pressed', () => {
        service.onCtrlZDown();
        expect(onCtrlZDownSpy).toHaveBeenCalled();
        expect(undoSpy).toHaveBeenCalled();
    });

    it('should call redo when  Ctrl + Z + Shift is pressed', () => {
        service.onCtrlShiftZDown();
        expect(onCtrlShiftZDownSpy).toHaveBeenCalled();
        expect(redoSpy).toHaveBeenCalled();
    });

    it('should call reconstituteCanvas when undo is called', () => {
        servicePencil.mouseDown = true;
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.undo();
        expect(reconstituteCanvasSpy).toHaveBeenCalled();
    });
    it('should early return when undo is called when there is no action to pop', () => {
        servicePencil.mouseDown = false;
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.undo();
    });

    it('should push actionsToRedo with action that was undone and push canvasesToRedo with canvas that was undone', () => {
        servicePencil.mouseDown = true;
        (service as any).actions.length = 0;
        (service as any).actionsToRedo = [];
        (service as any).canvasesToRedo = [];
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.undo();
        expect(reconstituteCanvasSpy).toHaveBeenCalled();
    });

    it('should call reconstituteCanvas when redo is called', () => {
        servicePencil.mouseDown = true;
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.undo();
        service.redo();
        expect(reconstituteCanvasSpy).toHaveBeenCalled();
    });
    it('should early return when undo is called when there is no action to pop', () => {
        servicePencil.mouseDown = false;
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.redo();
        expect(reconstituteCanvasSpy).not.toHaveBeenCalled();
    });

    it('should push actionsToRedo with action that was undone and push canvasesToRedo with canvas that was undone', () => {
        servicePencil.mouseDown = true;
        (service as any).actions.length = 0;
        (service as any).actionsToRedo = [];
        (service as any).canvasesToRedo = [];
        const mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        (servicePencil as any).pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        servicePencil.onMouseUp(mouseEvent);
        service.undo();
        service.redo();
        expect(reconstituteCanvasSpy).toHaveBeenCalled();
    });

    it('should reset all arrays (actions,canvases,actionsToRedo,canvasesToRedo)', () => {
        (service as any).canvases = [1];
        (service as any).actions = [1];
        (service as any).actionsToRedo.length = [1];

        service.reset();
        expect((service as any).actions.length).toEqual(0);
        expect((service as any).actionsToRedo.length).toEqual(0);
    });
});
