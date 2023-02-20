import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ChatGameService } from '@app/services/chat-game/chat-game.service';

@Component({
    selector: 'app-modal-add-member',
    templateUrl: './modal-add-member.component.html',
    styleUrls: ['./modal-add-member.component.scss'],
})
export class ModalAddMemberComponent {
    emailForm: FormGroup;
    isValidEmail: boolean = true;
    emailList: string[] = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private chatService: ChatGameService) {
        this.emailForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    add(event: MatChipInputEvent): void {
        const INPUT: HTMLInputElement = event.input;
        const VALUE: string = event.value.trim();

        if (this.emailForm.invalid) {
            INPUT.value = '';
            this.isValidEmail = false;
            return;
        }
        this.emailList.push(VALUE);
        INPUT.value = '';
    }

    remove(tag: string): void {
        const INDEX = this.emailList.indexOf(tag);
        if (INDEX >= 0 && this.emailList.length > 0 && INDEX < this.emailList.length) {
            this.emailList.splice(INDEX, 1);
        }
    }

    sendSetup(): void {
        this.dialog.closeAll();
        this.chatService.addMember(this.emailList);
    }
}
