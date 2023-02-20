import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { UserGuideModalComponent } from '@app/components/modal/modal-user-guide/modal-user-guide.component';
import { ModalHandlerService } from '@app/services/modal-handler/modal-handler';
import { MainPageComponent } from './main-page.component';

// tslint:disable: no-any
describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let modalHandlerService: ModalHandlerService;
    let openGuideSpy: jasmine.Spy<any>;
    let modalHandlerServiceSpy: jasmine.Spy<any>;
    const dialogSpy: jasmine.SpyObj<MatDialog> = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy: jasmine.SpyObj<MatDialogRef<MainPageComponent, any>> = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogSpy.open.and.returnValue(dialogRefSpy);

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule],
                declarations: [MainPageComponent, UserGuideModalComponent],
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: {} },
                    { provide: MatDialog, useValue: dialogSpy },
                    ModalHandlerService,
                    MatSnackBar,
                    Overlay,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        modalHandlerService = TestBed.inject(ModalHandlerService);
        component = fixture.componentInstance;
        openGuideSpy = spyOn<any>((component as any).modalHandler, 'openUserGuide');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call openGameLobby', () => {
        modalHandlerServiceSpy = spyOn<any>(modalHandlerService, 'openLobbySetup');
        component.openGameLobby();
        expect(modalHandlerServiceSpy).toHaveBeenCalled();
    });

    it('should call openUserGuide', () => {
        component.openUserGuide();
        expect(openGuideSpy).toHaveBeenCalled();
    });
});
