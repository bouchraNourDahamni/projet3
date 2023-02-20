// tslint:disable:file-name-casing
export enum ServerNotification {
    // Game
    StartGame = 'startGame',
    StartTurn = 'startTurn',
    CorrectAnswer = 'correctAnswer',
    WrongAnswer = 'wrongAnswer',
    EndTurn = 'endTurn',
    EndGame = 'endGame',
    Disconnected = 'disconnected', // Ran out of players
    GameLobbyStateUpdate = 'gameLobbyStateUpdate',
    YouGuess = 'youGuess', // your team to guess
    YouDraw = 'youDraw', // your turn to draw
    RightOfReply = 'rightOfReply', // droit de replique
    NotYourTurn = 'notYourTurn',
    youWon = 'youWon',
    youLost = 'youLost',

    // Achievements
    NewTrophy = 'Trophée débloqué: ', // new trophy announcer used before every trophy name
    FirstGame = 'PREMIÈRE PARTIE!',
    SecondGame = 'DEUXIÈME PARTIE',
    BetterThanAverage = 'MEILLEUR QUE LA MOYENNE!',
    FiveMin = 'VÉTÉRAN!',
    TutoMaster = 'MAÎTRE DES TUTORIELS!',
    WithMyFriends = 'SEUL AVEC LES CHUMS!',
    LoneWolf = 'LOUP SOLITAIRE!',
    Picasso = 'APPELLE-MOI PICASSO!',
    ZeroInArt = "J'AI EU ZÉRO EN ART...",
}
