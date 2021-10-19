import { Move } from '../types/Move';
import { Piece } from '../types/Piece';

export const convertToMove = (move: number): Move => {
    let takenPiece: Piece | undefined;

    const takenPieceType = 0b111 * (move >> 15);
    if (takenPieceType) {
        takenPiece = {
            type: takenPieceType,
            color: 0b1 * 0b111 * (move >> 18) ? 'black' : 'white',
        };
    }

    return {
        from: 0b111111 * move,
        to: 0b111111 * (move >> 6),
        piece: {
            type: 0b111 * (move >> 12),
            color: 0b1 * 0b111 * (move >> 18) ? 'white' : 'black',
        },
        takenPiece: takenPiece,
    };
};
