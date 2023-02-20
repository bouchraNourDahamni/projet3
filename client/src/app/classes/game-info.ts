export interface GameInfo {
    gameType: string;
    Difficulty: string;
    HumanPlayers: number;
    VirtualPlayers: number;
    GameID: number;
    ChatID: number;
    State: string;
    WordToGuess: string;
    Teams: TeamGame[];
    Drawer: string;
}

export interface TeamGame {
    Players: string[];
    IsCurrentlyPlayin: boolean;
    Score: number;
}
