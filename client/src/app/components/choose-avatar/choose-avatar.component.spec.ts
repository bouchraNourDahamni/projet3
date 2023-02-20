import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ChooseAvatarComponent } from './choose-avatar.component';

describe('ChooseAvatarComponent', () => {
    // let component: ChooseAvatarComponent;
    let fixture: ComponentFixture<ChooseAvatarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, FormBuilder],
            declarations: [ChooseAvatarComponent],
            providers: [FormBuilder],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChooseAvatarComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /* it('should create', () => {
        expect(component).toBeTruthy();
    });*/
});
