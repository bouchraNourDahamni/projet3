/* tslint:disable:no-unused-variable */
import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { WordImageService } from './word-image.service';

describe('Service: WordImage', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                WordImageService,
                MatSnackBar,
                Overlay,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        });
    });

    it('should ...', inject([WordImageService], (service: WordImageService) => {
        expect(service).toBeTruthy();
    }));
});
