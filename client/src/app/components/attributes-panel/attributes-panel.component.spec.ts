import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Description } from '@app/classes/description';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TracingService } from '@app/services/tool-modifier/tracing/tracing.service';
import { WidthService } from '@app/services/tool-modifier/width/width.service';
import { ToolboxService } from '@app/services/toolbox/toolbox.service';
import { AttributesPanelComponent } from './attributes-panel.component';
class ToolStub extends Tool {}

// The disablement of the "any" tslint rule is justified in this situation as the prototype
// of the jasmine.Spy type takes a generic argument whose type is by convention of type "any"
// tslint:disable:no-any
describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;
    let toolStub: ToolStub;
    const canvasWidth = 1200;
    const canvasHeight = 1000;

    let toolBoxService: ToolboxService;
    let tracingService: TracingService;
    let widthService: WidthService;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule],
                declarations: [AttributesPanelComponent],
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: {} },
                    { provide: MatDialog, useValue: {} },
                    ToolboxService,
                    TracingService,
                    WidthService,
                    MatSnackBar,
                    Overlay,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        selectionCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        fixture = TestBed.createComponent(AttributesPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        toolStub = new ToolStub({} as DrawingService, {} as Description);
        toolBoxService = TestBed.inject(ToolboxService);
        tracingService = TestBed.inject(TracingService);
        widthService = TestBed.inject(WidthService);
        (toolBoxService as any).drawingService.selectionCtx = selectionCtxStub;
        (toolBoxService as any).drawingService.previewCtx = previewCtxStub;
        (toolBoxService as any).drawingService.canvas = canvasStub;
        (toolBoxService as any).drawingService.canvas.width = canvasWidth;
        (toolBoxService as any).drawingService.canvas.height = canvasHeight;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('the capitalizeFirstLetter function should set the first character to a capital letter', () => {
        const inputString = 'string';
        const expectedOutput = 'String';
        const ouputString = component.capitalizeFirstLetter(inputString);
        expect(ouputString).toEqual(expectedOutput);
    });

    it('if the current tool possesses a tracing modifier there should be a need for a tracing atrribute modifier', () => {
        (toolStub as any).modifiers = [tracingService];
        toolBoxService.setSelectedTool(toolStub);
        const expectedOutput = true;
        const ouput = component.needsTracingAttribute();
        expect(ouput).toEqual(expectedOutput);
    });

    it('if the current tool does not possess a tracing modifier there should be a need for a tracing atrribute modifier', () => {
        (toolStub as any).modifiers = [];
        toolBoxService.setSelectedTool(toolStub);
        const expectedOutput = false;
        const ouput = component.needsTracingAttribute();
        expect(ouput).toEqual(expectedOutput);
    });

    it('if the current tool possesses a width modifier there should be a need for a width atrribute modifier', () => {
        (toolStub as any).modifiers = [widthService];
        toolBoxService.setSelectedTool(toolStub);
        const expectedOutput = true;
        const ouput = component.needsWidthAttribute();
        expect(ouput).toEqual(expectedOutput);
    });

    it('if the current tool does not possesses a width modifier there should be a need for a width atrribute modifier', () => {
        (toolStub as any).modifiers = [];
        toolBoxService.setSelectedTool(toolStub);
        const expectedOutput = false;
        const ouput = component.needsWidthAttribute();
        expect(ouput).toEqual(expectedOutput);
    });
});
