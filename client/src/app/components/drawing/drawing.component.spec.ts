import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Description } from '@app/classes/description';
import { Tool } from '@app/classes/tool';
import { DrawingStateTrackerService } from '@app/services/drawing-state-tracker/drawing-state-tracker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';
import { GridOpacityService } from '@app/services/tool-modifier/grid-opacity/grid-opacity.service';
import { SpacingService } from '@app/services/tool-modifier/spacing/spacing.service';
import { ToolboxService } from '@app/services/toolbox/toolbox.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { WorkzoneSizeService } from '@app/services/workzone-size-service/workzone-size.service';
import { DrawingComponent } from './drawing.component';
class ToolStub extends Tool {}
// tslint:disable:no-any
// tslint:disable:max-file-line-count
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let gridStub: GridService;
    let drawingStub: DrawingService;
    let toolboxService: ToolboxService;
    let modalHandlerService: ModalHandlerService;
    // let tracker: DrawingStateTrackerService;
    let pencil: PencilService;
    let eraser: EraserService;
    let clearCanvasSpy: jasmine.Spy<any>;
    let resetDrawingSpy: jasmine.Spy<any>;
    let onResizeSpy: jasmine.Spy<any>;
    let openSaveDialogSpy: jasmine.Spy<any>;
    let openDrawingCarouselDialogSpy: jasmine.Spy<any>;
    let openExportDialogSpy: jasmine.Spy<any>;
    // let onCtrlZDownSpy: jasmine.Spy<any>;
    // let onCtrlShiftZDownSpy: jasmine.Spy<any>;

    beforeEach(
        waitForAsync(() => {
            toolStub = new ToolStub({} as DrawingService, {} as Description);
            drawingStub = new DrawingService({} as WorkzoneSizeService, {} as GridService);
            gridStub = new GridService({} as SpacingService, {} as GridOpacityService);

            TestBed.configureTestingModule({
                declarations: [DrawingComponent],
                imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule],
                providers: [
                    { provide: DrawingService, useValue: drawingStub },
                    { provide: GridService, useValue: gridStub },
                    PencilService,
                    EraserService,
                    ToolboxService,
                    ModalHandlerService,
                    DrawingStateTrackerService,
                    WorkzoneSizeService,
                    MatDialog,
                    Overlay,
                    MatSnackBar,
                    FormBuilder,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        pencil = TestBed.inject(PencilService);
        eraser = TestBed.inject(EraserService);
        toolboxService = TestBed.inject(ToolboxService);
        modalHandlerService = TestBed.inject(ModalHandlerService);
        // tracker = TestBed.inject(DrawingStateTrackerService);
        component = fixture.componentInstance;
        clearCanvasSpy = spyOn<any>(drawingStub, 'clearCanvas').and.callThrough();
        resetDrawingSpy = spyOn<any>(drawingStub, 'resetDrawing').and.callThrough();
        onResizeSpy = spyOn<any>((component as any).workzoneSizeService, 'onResize');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get stubTool', () => {
        toolboxService.setSelectedTool(toolStub);
        const currentTool = component.toolbox.getCurrentTool();
        expect(currentTool).toEqual(toolStub);
    });

    it('should not call openSaveDialog', () => {
        toolboxService.setSelectedTool(toolStub);
        openSaveDialogSpy = spyOn<any>(modalHandlerService, 'openSaveDialog');
        const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        component.onShiftDown(event);
        expect(openSaveDialogSpy).toHaveBeenCalled();
    });

    it('should not call openDrawingCarouselDialog', () => {
        toolboxService.setSelectedTool(toolStub);
        openDrawingCarouselDialogSpy = spyOn<any>(modalHandlerService, 'openDrawingCarouselDialog');
        const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });
        component.onShiftDown(event);
        expect(openDrawingCarouselDialogSpy).toHaveBeenCalled();
    });

    it('should not call openExportDialog', () => {
        toolboxService.setSelectedTool(toolStub);
        openExportDialogSpy = spyOn<any>(modalHandlerService, 'openExportDialog');
        const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true });
        component.onShiftDown(event);
        expect(openExportDialogSpy).toHaveBeenCalled();
    });

    it('should return nothing on b key and ctrlkey press and short cut enable on shift down', () => {
        toolboxService.setSelectedTool(toolStub);
        // onCtrlZDownSpy = spyOn<any>(tracker, 'onCtrlZDown');
        (component as any).drawingService.shortcutEnable = false;
        const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
        const result = component.onShiftDown(event);
        expect(result).toBe(undefined);
    });

    it('should return nothing on b key and ctrlkey press and short cut enable on shift down', () => {
        toolboxService.setSelectedTool(toolStub);
        // onCtrlZDownSpy = spyOn<any>(tracker, 'onCtrlZDown');
        (component as any).drawingService.shortcutEnable = false;
        const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: false });
        const result = component.onShiftDown(event);
        expect(result).toBe(undefined);
    });

    it('should return nothing ig ctrl key and shift key and key a onCtrlShiftZDown', () => {
        toolboxService.setSelectedTool(toolStub);
        // onCtrlShiftZDownSpy = spyOn<any>(tracker, 'onCtrlShiftZDown');
        const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, shiftKey: true });
        const result = component.onShiftDown(event);
        expect(result).toBe(undefined);
    });

    it('should call the tool pencil when pressing the key C', () => {
        const event = new KeyboardEvent('keyup', { key: 'C' });
        component.keyEventUp(event);
        expect(toolboxService.getCurrentTool()).toBe(pencil);
    });

    it('should toogle the grid when pressing the key G', () => {
        const toggleGridSpy: jasmine.Spy<any> = spyOn<any>(gridStub, 'toogleGrid');
        const event = new KeyboardEvent('keydown', { key: 'G' });
        component.onShiftDown(event);
        expect(toggleGridSpy).toHaveBeenCalled();
    });

    it('should call the increment the spacing of the grid when pressing the key +', () => {
        const incrementSpacingSpy: jasmine.Spy<any> = spyOn<any>(gridStub, 'incrementSpacing');
        const event = new KeyboardEvent('keydown', { key: '+' });
        component.onShiftDown(event);
        expect(incrementSpacingSpy).toHaveBeenCalled();
    });

    it('should call the decrementSpacing the spacing of the grid when pressing the key -', () => {
        const decrementSpacingSpy: jasmine.Spy<any> = spyOn<any>(gridStub, 'decrementSpacing');
        const event = new KeyboardEvent('keydown', { key: '-' });
        component.onShiftDown(event);
        expect(decrementSpacingSpy).toHaveBeenCalled();
    });

    it('should call the tool eraser when pressing the key E', () => {
        const event = new KeyboardEvent('keyup', { key: 'E' });
        component.keyEventUp(event);
        expect(toolboxService.getCurrentTool()).toBe(eraser);
    });

    it('should return null if event keyCode is false', () => {
        const event = new KeyboardEvent('keyup');
        (component as any).drawingService.shortcutEnable = false;
        const result = component.keyEventUp(event);
        expect(result).toBe(undefined);
    });

    it('should call no tool by default', () => {
        const event = new KeyboardEvent('keyup', { key: 'default' });
        component.keyEventUp(event);
    });

    it('should reset the drawing', () => {
        drawingStub.resetDrawing();
        expect(clearCanvasSpy).toHaveBeenCalled();
    });

    it('should call resetDrawing and ask before delete with answer true', () => {
        component.hasBeenDrawnOnto = true;
        const event = new KeyboardEvent('keyup', { key: 'o' });
        spyOn(window, 'confirm').and.returnValue(true);
        component.createNewDrawingKeyboardEvent(event);
        expect(resetDrawingSpy).toHaveBeenCalled();
    });

    it('should call resetDrawing and not ask before delete', () => {
        component.hasBeenDrawnOnto = false;
        const event = new KeyboardEvent('keyup', { key: 'o' });
        component.createNewDrawingKeyboardEvent(event);
        expect(resetDrawingSpy).toHaveBeenCalled();
    });

    it('should call onResize', () => {
        component.onResize(new Event('resize'));
        expect(onResizeSpy).toHaveBeenCalled();
    });
});
