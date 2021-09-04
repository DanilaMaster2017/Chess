/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Cell } from './Cell';
import { useInfoContext } from './InfoContext';
import { Piece } from '../types/Piece';
import long from 'long';
import { Position } from '../types/Position';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface Props {
    gamerColor: 'white' | 'black';
    position: Position;
}

const getPieceFromPosition = (
    position: Position,
    cellBitboard: long
): Piece | undefined => {
    if (!position.pawns.black.and(cellBitboard).isZero())
        return { type: 'pawn', color: 'black' };
    if (!position.rooks.black.and(cellBitboard).isZero())
        return { type: 'rook', color: 'black' };
    if (!position.bishops.black.and(cellBitboard).isZero())
        return { type: 'bishop', color: 'black' };
    if (!position.knights.black.and(cellBitboard).isZero())
        return { type: 'knight', color: 'black' };
    if (!position.king.black.and(cellBitboard).isZero())
        return { type: 'king', color: 'black' };
    if (!position.queen.black.and(cellBitboard).isZero())
        return { type: 'queen', color: 'black' };

    if (!position.pawns.white.and(cellBitboard).isZero())
        return { type: 'pawn', color: 'white' };
    if (!position.rooks.white.and(cellBitboard).isZero())
        return { type: 'rook', color: 'white' };
    if (!position.bishops.white.and(cellBitboard).isZero())
        return { type: 'bishop', color: 'white' };
    if (!position.knights.white.and(cellBitboard).isZero())
        return { type: 'knight', color: 'white' };
    if (!position.king.white.and(cellBitboard).isZero())
        return { type: 'king', color: 'white' };
    if (!position.queen.white.and(cellBitboard).isZero())
        return { type: 'queen', color: 'white' };

    return undefined;
};

const generateCells = (
    position: Position,
    color: 'white' | 'black',
    isReverse: boolean
) => {
    const cells = [];
    const boardSize = letters.length - 1;

    let start: number;
    let end: number;
    let increment: number;
    let cellBitboard: long;

    if ((color === 'black' && !isReverse) || (color === 'white' && isReverse)) {
        start = 0;
        end = boardSize;
        increment = 1;

        cellBitboard = long.ONE.shiftLeft(63);
    } else {
        start = boardSize;
        end = 0;
        increment = -1;

        cellBitboard = long.ONE;
    }

    for (let i = start; i !== end + increment; i += increment) {
        for (let j = start; j !== end + increment; j += increment) {
            cells.push(
                <Cell
                    piece={getPieceFromPosition(position, cellBitboard)}
                    key={i + ' ' + j}
                    x={j}
                    y={i}
                    letter={end - i === 0 ? letters[boardSize - j] : undefined}
                    digit={end - j === 0 ? (i + 1).toString() : undefined}
                ></Cell>
            );

            if (
                (color === 'black' && !isReverse) ||
                (color === 'white' && isReverse)
            ) {
                cellBitboard = cellBitboard.shiftRightUnsigned(1);
            } else {
                cellBitboard = cellBitboard.shiftLeft(1);
            }
        }
    }

    return cells;
};

export const ChessBoard: FC<Props> = ({ gamerColor, position }) => {
    const { isReverse } = useInfoContext();

    return (
        <div
            css={css`
                margin: auto;
                width: 52%;
                display: flex;
                flex-wrap: wrap;
                box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            `}
        >
            {generateCells(position, gamerColor, isReverse)}
        </div>
    );
};
