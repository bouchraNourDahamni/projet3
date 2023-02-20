import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagementService } from './game-management.service';

describe('GameManagementService', () => {
    let service: GameManagementService;

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
        service = TestBed.inject(GameManagementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
