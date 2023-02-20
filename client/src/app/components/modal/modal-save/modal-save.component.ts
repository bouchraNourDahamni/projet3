import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { Difficulty } from '@app/classes/difficulty';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { AuthentificationService } from '@app/services/authentification/authentification.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { WordImageService } from '@app/services/word-image/word-image.service';

@Component({
    selector: 'app-modal-save',
    templateUrl: './modal-save.component.html',
    styleUrls: ['./modal-save.component.scss'],
})
export class ModalSaveComponent {
    private readonly MAX_NUMBER_OF_TAGS: number = 15;
    private readonly MAX_LENGHT_DRAW_NAME: number = 50;
    private readonly MAX_LENGHT_NAME_TAG: number = 25;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    // tslint:disable:no-any
    @ViewChild('chipList') chipList: any;

    tags: string[] = [];
    drawingName: FormControl = new FormControl('', Validators.required);
    canSaveToServer: boolean = true;
    difficulty: typeof Difficulty = Difficulty;
    constructor(
        public dialogRef: MatDialogRef<ModalSaveComponent>,
        public wordImageService: WordImageService,
        private drawingService: DrawingService,
        private gameManagementService: GameManagementService,
        private authentificationService: AuthentificationService,
        private httpClient: HttpClient,
    ) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault(); // to prevent key of windows
        }
    }

    add(event: MatChipInputEvent): void {
        const INPUT: HTMLInputElement = event.input;
        const VALUE: string = event.value;

        // Add the tag
        if ((VALUE || '').trim() && this.validateTag(VALUE)) {
            this.tags.push(VALUE.trim());
        }

        // Reset the input value
        INPUT.value = '';

        if (this.tags.length >= 1) {
            this.chipList.errorState = false;
        }
    }

    remove(tag: string): void {
        const INDEX = this.tags.indexOf(tag);
        if (INDEX >= 0 && this.tags.length > 0 && INDEX < this.tags.length) {
            this.tags.splice(INDEX, 1);
        }
        if (this.tags.length < 1) {
            this.chipList.errorState = true;
        }
    }

    saveToServer(): void {
        const word: string = this.drawingName.value;
        const clues = this.tags;
        if (this.validateValue(word, clues)) {
            // save
            this.wordImageService.saveImage(word.trim(), clues);
            this.wordImageService.sendImage();
            this.canSaveToServer = false;
            // clean up
            this.drawingService.resetDrawing();
            this.gameManagementService.resetImage();
            // give achievement
            const user = JSON.stringify({ email: this.authentificationService.email, trophy: 'APPELLE-MOI PICASSO!' });
            this.httpClient.post<JSON>('http://' + SERVER_HOSTNAME + '/trophy/give', user).toPromise();
            // quit
            this.dialogRef.close();
        }
    }

    setDifficulty(difficulty: Difficulty): void {
        this.wordImageService.wordImage.difficulty = difficulty;
    }

    isValueValid(): boolean {
        return this.validateValue(this.drawingName.value, this.tags);
    }

    validateValue(name: string, clues: string[]): boolean {
        return this.validateDrawName(name) && this.validateAllTags(clues);
    }

    private validateDrawName(name: string): boolean {
        const size = name.length;
        return size > 0 && size <= this.MAX_LENGHT_DRAW_NAME;
    }

    private validateTag = (tag: string): boolean => tag.length > 0 && tag.length <= this.MAX_LENGHT_NAME_TAG;

    private validateAllTags(tags: string[]): boolean {
        return (
            tags.length > 0 && tags.length <= this.MAX_NUMBER_OF_TAGS && tags.map(this.validateTag).reduce((isValid, value) => isValid && value, true)
        );
    }
}
