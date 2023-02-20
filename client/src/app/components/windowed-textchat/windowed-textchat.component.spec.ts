import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowedTextchatComponent } from './windowed-textchat.component';

describe('WindowedTextchatComponent', () => {
    // let component: WindowedTextchatComponent;
    let fixture: ComponentFixture<WindowedTextchatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WindowedTextchatComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WindowedTextchatComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /* it('should create', () => {
        expect(component).toBeTruthy();
    });*/
});
