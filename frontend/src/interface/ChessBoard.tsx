/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Cell } from './Cell';
import { useGameInfoContext } from './GameInfoContext';
import { Piece } from '../types/Piece';
import long from 'long';
import { Position } from '../types/Position';
import { MoveContext } from './MoveContext';
import { numberOfCells, sideSize } from '../constants/constants';
import { PieceType } from '../types/PieceType';
import { useBoardContext } from './BoardContext';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface Props {
    position: Position;
}

const getPieceFromPosition = (
    position: Position,
    cellBitboard: long
): Piece | undefined => {
    if (!position.pawn.black.and(cellBitboard).isZero())
        return { type: PieceType.pawn, color: 'black' };
    if (!position.rook.black.and(cellBitboard).isZero())
        return { type: PieceType.rook, color: 'black' };
    if (!position.bishop.black.and(cellBitboard).isZero())
        return { type: PieceType.bishop, color: 'black' };
    if (!position.knight.black.and(cellBitboard).isZero())
        return { type: PieceType.knight, color: 'black' };
    if (!position.king.black.and(cellBitboard).isZero())
        return { type: PieceType.king, color: 'black' };
    if (!position.queen.black.and(cellBitboard).isZero())
        return { type: PieceType.queen, color: 'black' };

    if (!position.pawn.white.and(cellBitboard).isZero())
        return { type: PieceType.pawn, color: 'white' };
    if (!position.rook.white.and(cellBitboard).isZero())
        return { type: PieceType.rook, color: 'white' };
    if (!position.bishop.white.and(cellBitboard).isZero())
        return { type: PieceType.bishop, color: 'white' };
    if (!position.knight.white.and(cellBitboard).isZero())
        return { type: PieceType.knight, color: 'white' };
    if (!position.king.white.and(cellBitboard).isZero())
        return { type: PieceType.king, color: 'white' };
    if (!position.queen.white.and(cellBitboard).isZero())
        return { type: PieceType.queen, color: 'white' };

    return undefined;
};

export const ChessBoard: FC<Props> = ({ position }) => {
    const { isReverse, playerInfo } = useGameInfoContext();
    const { lastMove, track } = useBoardContext();

    const cells = [];

    let start: number;
    let end: number;
    let increment: number;
    let cellBitboard: long;

    const boardSide =
        (playerInfo.color === 'black' && !isReverse) ||
        (playerInfo.color === 'white' && isReverse);

    if (boardSide) {
        start = 0;
        end = sideSize;
        increment = 1;

        cellBitboard = long.ONE.shiftLeft(numberOfCells - 1);
    } else {
        start = sideSize - 1;
        end = -1;
        increment = -1;

        cellBitboard = long.ONE;
    }

    for (let i = start; i !== end; i += increment) {
        for (let j = start; j !== end; j += increment) {
            const piece = getPieceFromPosition(position, cellBitboard);

            cells.push(
                <Cell
                    piece={piece}
                    isTracking={!track.and(cellBitboard).isZero()}
                    isLastMove={!lastMove.and(cellBitboard).isZero()}
                    key={'' + (i * sideSize + j)}
                    x={j}
                    y={i}
                    letter={
                        end - increment === i
                            ? letters[sideSize - 1 - j]
                            : undefined
                    }
                    digit={
                        end - increment === j ? (i + 1).toString() : undefined
                    }
                ></Cell>
            );

            if (boardSide) {
                cellBitboard = cellBitboard.shiftRightUnsigned(1);
            } else {
                cellBitboard = cellBitboard.shiftLeft(1);
            }
        }
    }

    return (
        <div
            css={css`
                position: relative;
                margin: auto;
                width: 52%;
                display: flex;
                flex-wrap: wrap;
                box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            `}
        >
            <MoveContext>{cells}</MoveContext>
        </div>
    );
};
