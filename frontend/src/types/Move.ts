import { Piece } from './Piece';

export interface Move {
    from: number;
    to: number;
    piece: Piece;
    takenPiece?: Piece;
    replacePiece?: Piece;
}
