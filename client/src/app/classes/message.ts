export class Message {
    email: string;
    message: string;
    username: string;
    sendDate: string;

    constructor(email: string, username: string, text: string, sendDate: string) {
        this.message = text;
        this.username = username;
        this.email = email;
        this.sendDate = sendDate;
    }
}
