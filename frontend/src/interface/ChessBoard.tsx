/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Cell } from './Cell';
import { useInfoContext } from './InfoContext';
import { Position } from '../сhessEngine/chessEngine';
import { Piece } from '../types/Piece';
import long from 'long';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface Props {
    gamerColor: 'white' | 'black';
    position: Position;
}

const getPieceFromPosition = (
    position: Position,
    cellBitboard: long
): Piece | undefined => {
    if (!position.blackPawns.and(cellBitboard).isZero())
        return { type: 'pawn', color: 'black' };
    if (!position.blackRooks.and(cellBitboard).isZero())
        return { type: 'rook', color: 'black' };
    if (!position.blackBishops.and(cellBitboard).isZero())
        return { type: 'bishop', color: 'black' };
    if (!position.blackKnights.and(cellBitboard).isZero())
        return { type: 'knight', color: 'black' };
    if (!position.blackKing.and(cellBitboard).isZero())
        return { type: 'king', color: 'black' };
    if (!position.blackQueen.and(cellBitboard).isZero())
        return { type: 'queen', color: 'black' };

    if (!position.whitePawns.and(cellBitboard).isZero())
        return { type: 'pawn', color: 'white' };
    if (!position.whiteRooks.and(cellBitboard).isZero())
        return { type: 'rook', color: 'white' };
    if (!position.whiteBishops.and(cellBitboard).isZero())
        return { type: 'bishop', color: 'white' };
    if (!position.whiteKnights.and(cellBitboard).isZero())
        return { type: 'knight', color: 'white' };
    if (!position.whiteKing.and(cellBitboard).isZero())
        return { type: 'king', color: 'white' };
    if (!position.whiteQueen.and(cellBitboard).isZero())
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
