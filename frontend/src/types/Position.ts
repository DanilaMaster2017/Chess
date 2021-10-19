import { Players } from './Players';

export interface Position {
    pawn: Players;
    knight: Players;
    rook: Players;
    bishop: Players;
    queen: Players;
    king: Players;
}
