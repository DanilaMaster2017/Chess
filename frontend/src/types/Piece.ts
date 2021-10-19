import { PieceType } from './PieceType';
export interface Piece {
    color: 'white' | 'black';
    type: PieceType;
}
