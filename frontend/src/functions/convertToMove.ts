import { Move } from '../types/Move';
import { Piece } from '../types/Piece';

export const convertToMove = (move: number, color: 'white' | 'black'): Move => {
    let takenPiece: Piece | undefined;

    const takenPieceType = 0b111 & (move >> 15);
    if (takenPieceType) {
        takenPiece = {
            type: takenPieceType,
            color: color === 'white' ? 'black' : 'white',
        };
    }

    let replacePiece: Piece | undefined;

    const replacePieceType = 0b111 & (move >> 18);
    if (replacePieceType) {
        replacePiece = {
            type: replacePieceType,
            color: color,
        };
    }

    return {
        from: 0b111111 & move,
        to: 0b111111 & (move >> 6),
        piece: {
            type: 0b111 & (move >> 12),
            color: color,
        },
        takenPiece: takenPiece,
        replacePiece: replacePiece,
    };
};
