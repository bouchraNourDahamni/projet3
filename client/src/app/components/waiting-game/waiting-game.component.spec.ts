import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { WaitingGameComponent } from './waiting-game.component';

describe('WaitingGameComponent', () => {
    // let component: WaitingGameComponent;
    let fixture: ComponentFixture<WaitingGameComponent>;
    let gameManagement: GameManagementService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [WaitingGameComponent],
            providers: [MatSnackBar, Overlay],
        }).compileComponents();
    });

    beforeEach(() => {
        gameManagement = TestBed.inject(GameManagementService);
        gameManagement.gameToJoin = JSON.parse('{"humanPlayers":1}');
        fixture = TestBed.createComponent(WaitingGameComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
        expect(component).toBeTruthy();
    });*/
});
