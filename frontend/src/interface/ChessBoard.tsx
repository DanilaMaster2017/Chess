/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState } from 'react';
import { Cell } from './Cell';
import { useInfoContext } from './InfoContext';
import { Piece } from '../types/Piece';
import long from 'long';
import { Position } from '../types/Position';
import { CellStatus } from '../types/CellStatus';
import { chessEngine } from '../сhessEngine/chessEngine';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface Props {
    gamerColor: 'white' | 'black';
    position: Position;
    onPieceMove: () => void;
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

export const ChessBoard: FC<Props> = ({
    gamerColor,
    position,
    onPieceMove,
}) => {
    const { isReverse, whoseMove } = useInfoContext();
    const [track, setTrack] = useState<long>(long.ZERO);
    const [lastMove, setLastMove] = useState<long>(long.ZERO);
    const [activeCell, setActiveCell] = useState<number>(-1);

    const cells = [];
    const boardSize = letters.length;

    let start: number;
    let end: number;
    let increment: number;
    let cellBitboard: long;

    const boardSide =
        (gamerColor === 'black' && !isReverse) ||
        (gamerColor === 'white' && isReverse);

    if (boardSide) {
        start = 0;
        end = boardSize;
        increment = 1;

        cellBitboard = long.ONE.shiftLeft(boardSize * boardSize - 1);
    } else {
        start = boardSize - 1;
        end = -1;
        increment = -1;

        cellBitboard = long.ONE;
    }

    let selectPieceClick;
    let notValidClick;

    for (let i = start; i !== end; i += increment) {
        for (let j = start; j !== end; j += increment) {
            const piece = getPieceFromPosition(position, cellBitboard);
            const cellNumber = i * boardSize + j;

            if (whoseMove === 'player') {
                notValidClick = () => {
                    setTrack(long.ZERO);
                    setActiveCell(-1);
                };

                selectPieceClick = () => {
                    setActiveCell(cellNumber);
                    setTrack(chessEngine.getPossibleMoves(cellNumber, piece!));
                };
            }

            let status: CellStatus = 0;

            if (activeCell === i * boardSize + j) status |= CellStatus.active;
            if (!track.and(cellBitboard).isZero())
                status |= CellStatus.tracking;
            if (!lastMove.and(cellBitboard).isZero())
                status |= CellStatus.lastMove;

            let onClick;
            if (
                piece &&
                piece.color === gamerColor &&
                cellNumber !== activeCell
            ) {
                onClick = selectPieceClick;
            } else if (status & CellStatus.tracking) {
                onClick = onPieceMove;
            } else {
                onClick = notValidClick;
            }

            cells.push(
                <Cell
                    onClick={onClick}
                    piece={piece}
                    status={status}
                    key={i + ' ' + j}
                    x={j}
                    y={i}
                    letter={
                        end - increment === i
                            ? letters[boardSize - 1 - j]
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
                margin: auto;
                width: 52%;
                display: flex;
                flex-wrap: wrap;
                box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            `}
        >
            {cells}
        </div>
    );
};
