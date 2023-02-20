import { User } from '@app/classes/user';
import { Message } from './message';

export class Chatroom {
    history: Message[];
    users: User[];
    chatroomId: number;
    name: string;

    constructor(history: Message[], users: User[], id: number, name: string = '') {
        this.history = history;
        this.users = users;
        this.chatroomId = id;
        this.name = name;
    }
}
