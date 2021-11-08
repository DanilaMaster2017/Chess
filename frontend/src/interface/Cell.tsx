/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, { FC, useRef, useState, useEffect } from 'react';
import { Piece } from '../types/Piece';
import { getPieceImage } from '../functions/getPieceImage';
import { CellStatus } from '../types/CellStatus';
import { useMoveContext } from './MoveContext';
import { useInfoContext } from './InfoContext';
import { sideSize } from '../constants/constants';
import { Players } from '../types/Players';
import { PieceType } from '../types/PieceType';

interface Props {
    onClick?: () => void;
    resetBoard: () => void;
    piece?: Piece;
    status: CellStatus;
    letter?: string;
    digit?: string;
    x: number;
    y: number;
}

export const Cell: FC<Props> = ({
    piece,
    status,
    x,
    y,
    letter,
    digit,
    onClick,
    resetBoard,
}) => {
    const pieceImage = useRef<HTMLImageElement | null>(null);
    const [isHover, setIsHover] = useState<Boolean>(false);
    const { playerInfo, isReverse } = useInfoContext();
    const {
        onPieceMove,
        setOnPieceMove,
        castlingRooks,
        setCastlingRooks,
    } = useMoveContext();

    const boardOneEighth = 100 / sideSize;
    const backgroundColor = (x + y) % 2 ? '#B58863' : '#F0D9B5';
    const symbolСolor = (x + y) % 2 ? '#F0D9B5' : '#B58863';
    const trackingColor = 'rgba(20,85,30,0.5)';
    const hoverColor = 'rgba(20,85, 0, 0.3)';

    let backlightColor;

    if (status & CellStatus.active) {
        backlightColor = trackingColor;
    } else if (status & CellStatus.lastMove) {
        backlightColor = 'rgba(155,199,0,0.41)';
    } else {
        backlightColor = 'transparent';
    }

    const boardSide =
        (playerInfo.color === 'black' && !isReverse) ||
        (playerInfo.color === 'white' && isReverse);

    const top = boardSide
        ? boardOneEighth * y + '%'
        : boardOneEighth * (sideSize - 1 - y) + '%';
    const left = boardSide
        ? boardOneEighth * x + '%'
        : boardOneEighth * (sideSize - 1 - x) + '%';

    useEffect(() => {
        if (pieceImage.current) {
            pieceImage.current!.style.left = left;
            pieceImage.current!.style.top = top;
        }
    }, [left, top]);

    useEffect(() => {
        const cell = x + y * sideSize;

        if (cell === 0) {
            setCastlingRooks((prev: Players) => {
                return {
                    white: pieceImage,
                    black: prev.black,
                };
            });
        } else if (cell === 56) {
            setCastlingRooks((prev: Players) => {
                return {
                    white: prev.white,
                    black: pieceImage,
                };
            });
        }
    }, []);

    const onMouseEnter =
        status & CellStatus.tracking ? () => setIsHover(true) : undefined;
    const onMouseLeave =
        status & CellStatus.tracking ? () => setIsHover(false) : undefined;

    useEffect(() => {
        if (!(status & CellStatus.tracking)) {
            setIsHover(false);
        }
    }, [status]);

    useEffect(() => {
        if (status & CellStatus.active) {
            setOnPieceMove((prevState) => {
                return (top: string, left: string) => {
                    //for castling animate
                    if (piece?.type === PieceType.king) {
                        const kingPosition = parseFloat(
                            pieceImage.current!.style.left
                        );
                        const kingNewPosition = parseFloat(left);

                        if (Math.abs(kingPosition - kingNewPosition) === 25) {
                            castlingRooks[piece.color].current.style.left =
                                left === '75%' ? '62.5%' : '25%';
                        }
                    }

                    //for move animate
                    pieceImage.current!.style.top = top;
                    pieceImage.current!.style.left = left;
                };
            });
        }
    }, [status, boardSide]);

    let onClickByCell;

    if (status & CellStatus.tracking) {
        onClickByCell = () => {
            resetBoard();
            onPieceMove(top, left);
            setTimeout(onClick!, 300);
        };
    } else {
        onClickByCell = onClick;
    }

    return (
        <div
            onClick={onClickByCell}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            css={css`
                cursor: pointer;
                font-size: 11px;
                width: ${boardOneEighth}%;
                background-color: ${backgroundColor};
                overflow: hidden;
                &::before {
                    content: '';
                    padding-top: 100%;
                    float: left;
                }
            `}
        >
            {piece && (
                <img
                    ref={pieceImage}
                    css={css`
                        position: absolute;
                        z-index: 1;
                        top: ${top};
                        left: ${left};
                        width: ${boardOneEighth}%;
                        transition: all 0.3s linear;

                        ${status & CellStatus.shah
                            ? `background: radial-gradient(
                            red 0%,
                            rgba(220, 0, 0, 128) 25%,
                            rgba(0, 0, 0, 0) 89%
                        );`
                            : ''}
                    `}
                    src={getPieceImage(piece)}
                    alt=""
                />
            )}
            <div
                css={css`
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    width: 100%;
                    height: 100%;
                    background-color: ${backlightColor};
                    ${isHover ? `background-color: ${hoverColor};` : ''}
                    ${status & CellStatus.tracking && piece && !isHover
                        ? `&:after {
                            content: "";
                            position: absolute;
                            border-radius: 50%;
                            width: 110%;
                            height: 110%;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            box-shadow: 0px 0px 0px 2000px ${hoverColor};
                            }`
                        : ''}
                `}
            >
                {letter && (
                    <span
                        css={css`
                            position: absolute;
                            z-index: 1;
                            left: 2px;
                            bottom: 2px;
                            color: ${symbolСolor};
                        `}
                    >
                        {letter}
                    </span>
                )}
                {digit && (
                    <span
                        css={css`
                            position: absolute;
                            z-index: 1;
                            right: 2px;
                            top: 2px;
                            color: ${symbolСolor};
                        `}
                    >
                        {digit}
                    </span>
                )}
                {!!(status & CellStatus.tracking) && !piece && !isHover && (
                    <div
                        css={css`
                            margin: auto;
                            width: 25%;
                            height: 25%;
                            border-radius: 50%;
                            background-color: ${trackingColor};
                        `}
                    ></div>
                )}
            </div>
        </div>
    );
};
