import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalChatroomCreationComponent } from './modal-chatroom-creation.component';

describe('ModalChatroomCreationComponent', () => {
    let component: ModalChatroomCreationComponent;
    let fixture: ComponentFixture<ModalChatroomCreationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ModalChatroomCreationComponent],
            providers: [
                FormBuilder,
                { provide: Router, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
                MatSnackBar,
                Overlay,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalChatroomCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
