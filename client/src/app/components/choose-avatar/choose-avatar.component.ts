import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';

@Component({
    selector: 'app-choose-avatar',
    templateUrl: './choose-avatar.component.html',
    styleUrls: ['./choose-avatar.component.scss'],
})
export class ChooseAvatarComponent implements OnInit {
    constructor(private httpClient: HttpClient) {}

    @Output() choice: EventEmitter<string> = new EventEmitter<string>();
    chosenAvatar: string = '/avatar/default.jpg';

    async ngOnInit(): Promise<void> {
        this.httpClient.get(`http://${SERVER_HOSTNAME}/avatar`).subscribe(console.log);
    }

    setAvatar(avatar: string): void {
        this.chosenAvatar = avatar;
        this.choice.emit(avatar);
    }
}
