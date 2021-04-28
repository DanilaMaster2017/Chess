/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Cell } from './Cell';
import { Position } from '../сhessEngine/chessEngine';
import whitePawn from '../images/chessPieces/wp.svg';
import whiteRook from '../images/chessPieces/wr.svg';
import whiteBishop from '../images/chessPieces/wb.svg';
import whiteKnight from '../images/chessPieces/wn.svg';
import whiteKing from '../images/chessPieces/wk.svg';
import whiteQueen from '../images/chessPieces/wq.svg';
import blackPawn from '../images/chessPieces/bp.svg';
import blackRook from '../images/chessPieces/br.svg';
import blackBishop from '../images/chessPieces/bb.svg';
import blackKnight from '../images/chessPieces/bn.svg';
import blackKing from '../images/chessPieces/bk.svg';
import blackQueen from '../images/chessPieces/bq.svg';
import long from 'long';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface Props {
    gamerColor: 'white' | 'black';
    position: Position;
}

const getPieceFromPosition = (
    position: Position,
    cellBitboard: long
): string | undefined => {
    if (!position.blackPawns.and(cellBitboard).isZero()) return blackPawn;
    if (!position.blackRooks.and(cellBitboard).isZero()) return blackRook;
    if (!position.blackBishops.and(cellBitboard).isZero()) return blackBishop;
    if (!position.blackKnights.and(cellBitboard).isZero()) return blackKnight;
    if (!position.blackKing.and(cellBitboard).isZero()) return blackKing;
    if (!position.blackQueen.and(cellBitboard).isZero()) return blackQueen;

    if (!position.whitePawns.and(cellBitboard).isZero()) return whitePawn;
    if (!position.whiteRooks.and(cellBitboard).isZero()) return whiteRook;
    if (!position.whiteBishops.and(cellBitboard).isZero()) return whiteBishop;
    if (!position.whiteKnights.and(cellBitboard).isZero()) return whiteKnight;
    if (!position.whiteKing.and(cellBitboard).isZero()) return whiteKing;
    if (!position.whiteQueen.and(cellBitboard).isZero()) return whiteQueen;

    return undefined;
};

const generateCells = (color: 'white' | 'black', position: Position) => {
    const cells = [];
    const boardSize = letters.length - 1;

    const start: number = color === 'black' ? 0 : boardSize;
    const end: number = color === 'black' ? boardSize : 0;
    const increment: number = color === 'black' ? 1 : -1;

    let cellBitboard: long =
        color === 'black' ? long.ONE.shiftLeft(63) : long.ONE;

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

            if (color === 'black') {
                cellBitboard = cellBitboard.shiftRightUnsigned(1);
            } else {
                cellBitboard = cellBitboard.shiftLeft(1);
            }
        }
    }

    return cells;
};

export const ChessBoard: FC<Props> = ({ gamerColor, position }) => {
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
            {generateCells(gamerColor, position)}
        </div>
    );
};
