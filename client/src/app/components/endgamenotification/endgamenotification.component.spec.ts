import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { EndgamenotificationComponent } from './endgamenotification.component';

describe('EndgamenotificationComponent', () => {
    let component: EndgamenotificationComponent;
    let fixture: ComponentFixture<EndgamenotificationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule],
            declarations: [EndgamenotificationComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }, MatDialog, Overlay, MatSnackBar],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EndgamenotificationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
