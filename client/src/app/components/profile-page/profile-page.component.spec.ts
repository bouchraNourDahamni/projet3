/* tslint:disable:no-unused-variable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent', () => {
    // let component: ProfilePageComponent;
    let fixture: ComponentFixture<ProfilePageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule],
                declarations: [ProfilePageComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfilePageComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
        expect(component).toBeTruthy();
    });*/
});
