import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { EditorPageComponent } from './editor-page.component';

describe('EditorPageComponent', () => {
    let component: EditorPageComponent;
    let fixture: ComponentFixture<EditorPageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, MatDialogModule, HttpClientModule],
                declarations: [EditorPageComponent, DrawingComponent, SidebarComponent],
                providers: [MatSnackBar, Overlay],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
