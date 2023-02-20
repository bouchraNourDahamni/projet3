// tslint:disable:no-any
// UserPublicInformation : It is all the public information of a user.
interface UserPublicInformation {
    pseudo: string;
    avatar: string;
}

// UserPrivateInformation : It is all the private information of a user.
interface UserPrivateInformation {
    lastName: string;
    firstName: string;
    password: string;
}

// UserStatistics : It is all the statistics linked to a user.
interface UserStatistics {
    games: number;
    winRatio: number;
    wins: number;
    losts: number;
    avarageTime: string; // duration
    totalTime: string; // duration
}

interface BasicGameHistory {
    start: Date;
    end: Date;
}

// GameHistory : Represent the information linked to a game.
interface ClassicGameHistory {
    basicgamehistory: BasicGameHistory;
    players: string[];
    result: any; // string -> bool
}

interface SoloGameHistory {
    basicgamehistory: BasicGameHistory;
    result: number;
}

// UserHistory : Represent the user information linked to time.
interface UserHistory {
    creationDate: Date;
    connections: Date[];
    deconnections: Date[];
    gameHistory: DeadGameHistory;
    chatChannels: number[];
}

interface DeadGameHistory {
    Classic: ClassicGameHistory[];
    Solo: SoloGameHistory[];
}

// Profile : Regroups all the information linked to a profile.
export interface UserProfile {
    email: string;
    public: UserPublicInformation;
    private: UserPrivateInformation;
    statistics: UserStatistics;
    history: UserHistory;
    trophies: string[];
}
