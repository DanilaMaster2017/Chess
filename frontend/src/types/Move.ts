import { Piece } from './Piece';

export interface Move {
    from: number;
    to: number;
    piece: Piece;
    capturedPiece?: Piece;
    promotedPiece?: Piece;
}
