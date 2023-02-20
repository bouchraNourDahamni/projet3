import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
    let component: CreateAccountComponent;
    let fixture: ComponentFixture<CreateAccountComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MatDialogModule, RouterTestingModule, HttpClientModule],
                declarations: [CreateAccountComponent],
                providers: [FormBuilder, MatSnackBar, Overlay, MatDialog],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateAccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
