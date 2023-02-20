import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ApiDrawingService } from '@app/services/api/api-drawing/api-drawing.service';
import { SaveService } from '@app/services/save/save.service';
import { ModalSaveComponent } from './modal-save.component';

class HTMLInputElement {
    input: string;
}
// tslint:disable:no-any
describe('ModalSaveComponent', () => {
    let component: ModalSaveComponent;
    let fixture: ComponentFixture<ModalSaveComponent>;
    // let sendMessageToServerSpy: jasmine.Spy<any>;
    // let saveDrawSpy: jasmine.Spy<any>;
    let pushSpy: jasmine.Spy<any>;
    const dialogRefSpy: jasmine.SpyObj<MatDialogRef<ModalSaveComponent, any>> = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MatButtonToggleModule],
                declarations: [ModalSaveComponent],
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: dialogRefSpy },
                    { provide: MatDialog, useValue: {} },
                    { provide: Router, useValue: {} },
                    { provide: MatTabsModule, useValue: {} },
                    SaveService,
                    HttpClientTestingModule,
                    HttpClient,
                    HttpTestingController,
                    HttpHandler,
                    ApiDrawingService,
                    MatSnackBar,
                    Overlay,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalSaveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // tslint:disable:no-magic-numbers

        pushSpy = spyOn(component.tags, 'push').and.callThrough();
        // saveDrawSpy = spyOn<any>((component as any).saveService, 'saveDraw').and.callThrough();
        // sendMessageToServerSpy = spyOn<any>(component, 'sendMessageToServer').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validate all tags should return true if all tags are valid', () => {
        const tags: string[] = ['a', 'b', 'c'];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateAllTags'](tags);
        expect(result).toBeTruthy();
    });

    it('validate all tags should return false if the number og tags is bigger than max', () => {
        const tags: string[] = ['al', 'bl', 'cl', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'z', 'w'];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateAllTags'](tags);
        expect(result).toBeFalse();
    });

    it('validate  a tag should return true if the tag is valid', () => {
        const tag = 'valid';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateTag'](tag);
        expect(result).toBeTruthy();
    });

    it('validate  a tag should return false if the tag is empty', () => {
        const tag = '';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateTag'](tag);
        expect(result).toBeFalse();
    });

    it('validate  a tag should return false if the tag lenght is bigger than max ', () => {
        const tag = 'alsoergdhtryejdklstegreddhud';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateTag'](tag);
        expect(result).toBeFalse();
    });

    it('validate  a name should return true if the name is valid', () => {
        const name = 'valid';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateDrawName'](name);
        expect(result).toBeTruthy();
    });

    it('validate  a name should return false if the name is empty', () => {
        const name = '';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateDrawName'](name);
        expect(result).toBeFalse();
    });

    it('validate  a tag should return false if the tag lenght is bigger than max', () => {
        const name = 'alsoergdhtryejdklstegreddhudalsoergdhtryejdklstegreddhudamskedjrh';
        // tslint:disable-next-line: no-string-literal
        const result = component['validateDrawName'](name);
        expect(result).toBeFalse();
    });

    it('validate value should return true if the name, tags and image source is valid', () => {
        const name = 'dessin';
        const tags: string[] = ['tag2', 'b', 'c'];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateValue'](name, tags);
        expect(result).toBeTruthy();
    });

    it('validate value should return false if the name is invalid', () => {
        const name = '';
        const tags: string[] = ['$$$$', 'b', 'c'];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateValue'](name, tags);
        expect(result).toBeFalse();
    });

    it('validate value should return false if the tags is invalid', () => {
        const name = 'valid';
        const tags: string[] = ['', ''];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateValue'](name, tags);
        expect(result).toBeFalse();
    });

    /* it('validate value should return false if the image source is invalid', () => {
        const name = 'valid';
        const tags: string[] = ['a', 'b', 'c'];
        // tslint:disable-next-line: no-string-literal
        const result = component['validateValue'](name, tags);
        expect(result).toBeFalse();
    });*/

    it('add should call not tags.push if the value is not empty ', () => {
        const event = new HTMLInputElement();
        event.input = 'inp';
        const eventInput: any = { input: event, value: 'val' };
        (component as any).tags = ['a', 'b'];
        component.add(eventInput);
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('add should not call tags.push if the input is empty ', () => {
        const event = new HTMLInputElement();
        event.input = 'input';
        const eventInput: any = { input: event, value: '' };
        (component as any).tags = ['a', 'b'];
        component.add(eventInput);
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('remove tag should  call tags.splice if the tag and index are valid', () => {
        component.tags = ['tag1', 'tag2', 'tag3'];
        spyOn(component, 'remove').and.callThrough();
        const spy = spyOn(component.tags, 'splice');
        component.remove('tag2');
        expect(spy).toHaveBeenCalled();
    });

    it('remove tag should  call tags.splice if the tag and index are invalid', () => {
        component.tags = ['tag1', 'tag2', 'tag3'];
        spyOn(component, 'remove').and.callThrough();
        const spy = spyOn(component.tags, 'splice');
        component.remove('tag5');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should prevent defaut key on Ctrl+S pressed', () => {
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
        const spy = spyOn(event, 'preventDefault');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should not prevent defaut key on other key  pressed', () => {
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'g' });
        const spy = spyOn(event, 'preventDefault');
        component.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not save message to server when validate value is false', () => {
        (component as any).drawingName.value = '';
        (component as any).tags = ['tag1', 'tag2'];
        component.saveToServer();
        // expect(saveDrawSpy).not.toHaveBeenCalled();
        // expect(sendMessageToServerSpy).not.toHaveBeenCalled();
    });
});
