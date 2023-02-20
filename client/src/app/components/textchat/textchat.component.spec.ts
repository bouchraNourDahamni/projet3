import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { TextchatComponent } from './textchat.component';

describe('TextchatComponent', () => {
    let component: TextchatComponent;
    let fixture: ComponentFixture<TextchatComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientModule, RouterTestingModule],
                declarations: [TextchatComponent],
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: {} },
                    { provide: MatDialog, useValue: {} },
                    MatSnackBar,
                    Overlay,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TextchatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
