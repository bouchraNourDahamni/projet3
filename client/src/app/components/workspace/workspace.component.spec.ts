import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkspaceComponent } from './workspace.component';
// tslint:disable:no-any
describe('WorkspaceComponent', () => {
    let component: WorkspaceComponent;
    let fixture: ComponentFixture<WorkspaceComponent>;

    const dialogRefSpy: jasmine.SpyObj<MatDialogRef<WorkspaceComponent, any>> = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientTestingModule],
                declarations: [WorkspaceComponent],
                providers: [
                    MatSnackBar,
                    Overlay,
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: dialogRefSpy },
                    { provide: MatDialog, useValue: {} },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkspaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
