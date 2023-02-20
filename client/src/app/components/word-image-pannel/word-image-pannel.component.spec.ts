/* tslint:disable:no-unused-variable */
import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { WordImagePannelComponent } from './word-image-pannel.component';

describe('WordImagePannelComponent', () => {
    let component: WordImagePannelComponent;
    let fixture: ComponentFixture<WordImagePannelComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, MatButtonToggleModule, RouterTestingModule],
            declarations: [WordImagePannelComponent],
            providers: [MatSnackBar, Overlay],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WordImagePannelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
