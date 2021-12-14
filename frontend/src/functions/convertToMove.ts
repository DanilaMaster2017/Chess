import { Move } from '../types/Move';
import { Piece } from '../types/Piece';

export const convertToMove = (move: number, color: 'white' | 'black'): Move => {
    let capturedPiece: Piece | undefined;

    const capturedPieceType = 0b111 & (move >> 15);
    if (capturedPieceType) {
        capturedPiece = {
            type: capturedPieceType,
            color: color === 'white' ? 'black' : 'white',
        };
    }

    let promotedPiece: Piece | undefined;

    const promotedPieceType = 0b111 & (move >> 18);
    if (promotedPieceType) {
        promotedPiece = {
            type: promotedPieceType,
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
        capturedPiece,
        promotedPiece,
    };
};
