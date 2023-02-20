import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatGameService } from './chat-game.service';

describe('ChatGameService', () => {
    let service: ChatGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                MatSnackBar,
                Overlay,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        });
        service = TestBed.inject(ChatGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
