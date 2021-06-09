export interface GameRequest{
    gameId: string;
    status : 'default'|'active'|'canceled';
    color:'white'|'black'|'random';
    playerName: string;
    timeForMove: Number;
    timeForGame: Number;
}

export interface PostGameRequest{
    color:'white'|'black'|'random';
    playerName: string;
    timeForMove: Number;
    timeForGame: Number;
}

export interface PutGameRequest{
    gameId: string;
    color:'white'|'black'|'random';
    timeForMove: Number;
    timeForGame: Number;
}