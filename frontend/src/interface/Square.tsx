/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, { FC, useRef, useEffect } from 'react';
import { Piece } from '../types/Piece';
import { getPieceImage } from '../functions/getPieceImage';
import { useMoveContext } from './MoveContext';
import { useGameInfoContext } from './GameInfoContext';
import {
    afterAnimationTime,
    animationTime,
    sideSize,
} from '../constants/constants';
import { WhichRook } from '../types/WhichRook';
import { PieceType } from '../types/PieceType';
import { chessEngine } from '../сhessEngine/chessEngine';
import { useBoardContext } from './BoardContext';
import long from 'long';

enum Rook {
    distant = -1,
    near = 1,
}

interface Props {
    isTracking: boolean;
    isLastMove: boolean;
    piece?: Piece;
    letter?: string;
    digit?: string;
    x: number;
    y: number;
}

export const Square: FC<Props> = ({
    piece,
    isTracking,
    isLastMove,
    x,
    y,
    letter,
    digit,
}) => {
    const pieceImage = useRef<HTMLImageElement | null>(null);

    const {
        playerInfo,
        isReverse,
        whoseMove,
        setWhoseMove,
    } = useGameInfoContext();

    const {
        onMove,
        setLastMove,
        enemyMove,
        checkSquare,
        setCheckSquare,
        activeSquare,
        setActiveSquare,
        activePiece,
        setActivePiece,
        setTrack,
        setOnPromote,
        fileWherePromotion,
        setFileWherePromotion,
    } = useBoardContext();

    const {
        onPieceMove,
        setOnPieceMove,
        rooks,
        setRooks,
        hoverSquare,
        setHoverSquare,
    } = useMoveContext();

    const squareNumber = x + y * sideSize;
    const boardOneEighth = 100 / sideSize;
    const backgroundColor = (x + y) % 2 ? '#B58863' : '#F0D9B5';
    const symbolСolor = (x + y) % 2 ? '#F0D9B5' : '#B58863';
    const trackingColor = 'rgba(20,85,30,0.5)';
    const hoverColor = 'rgba(20,85, 0, 0.3)';

    let backlightColor;

    if (activeSquare === squareNumber) {
        backlightColor = trackingColor;
    } else if (isLastMove) {
        backlightColor = 'rgba(155,199,0,0.41)';
    } else {
        backlightColor = 'transparent';
    }

    const boardSide =
        (playerInfo.color === 'black' && !isReverse) ||
        (playerInfo.color === 'white' && isReverse);

    const resetBoard = () => {
        setTrack(long.ZERO);
        setActiveSquare(-1);
        setActivePiece(undefined);
    };

    const selectPiece = () => {
        setActiveSquare(squareNumber);
        setActivePiece(piece);
        setTrack(chessEngine.getPossibleMoves(squareNumber, piece!));
    };

    useEffect(() => {
        switch (squareNumber) {
            case 0:
                setRooks((prev: WhichRook) => {
                    return {
                        near: {
                            white: pieceImage,
                            black: prev.near.black,
                        },
                        distant: prev.distant,
                    };
                });
                break;
            case 7:
                setRooks((prev: WhichRook) => {
                    return {
                        near: prev.near,
                        distant: {
                            white: pieceImage,
                            black: prev.distant.black,
                        },
                    };
                });
                break;
            case 56:
                setRooks((prev: WhichRook) => {
                    return {
                        near: {
                            white: prev.near.white,
                            black: pieceImage,
                        },
                        distant: prev.distant,
                    };
                });
                break;
            case 63:
                setRooks((prev: WhichRook) => {
                    return {
                        near: prev.near,
                        distant: {
                            white: prev.distant.white,
                            black: pieceImage,
                        },
                    };
                });
                break;
        }
    }, []);

    const getLeft = (x: number): string => {
        return boardSide
            ? boardOneEighth * x + '%'
            : boardOneEighth * (sideSize - 1 - x) + '%';
    };

    const getTop = (y: number): string => {
        return boardSide
            ? boardOneEighth * y + '%'
            : boardOneEighth * (sideSize - 1 - y) + '%';
    };

    useEffect(() => {
        if (pieceImage.current) {
            pieceImage.current.style.left = getLeft(x);
            pieceImage.current.style.top = getTop(y);
        }
    }, [boardSide]);

    const makeMove = (
        from: number,
        to: number,
        piece: Piece,
        capturedPiece?: Piece
    ) => {
        if (piece.type === PieceType.pawn && (to < 8 || to > 55)) {
            setOnPromote(() => {
                return (promotedPiece: Piece) => {
                    onMove({
                        from,
                        to,
                        piece,
                        capturedPiece,
                        promotedPiece,
                    });
                };
            });

            setWhoseMove('nobodys');
            setFileWherePromotion(to % sideSize);
        } else {
            onMove({
                from,
                to,
                piece,
                capturedPiece,
            });
        }
    };

    const animateMove = (
        pieceImage: HTMLImageElement,
        from: number,
        to: number
    ) => {
        const x: number = to % sideSize;
        const y: number = Math.floor(to / sideSize);

        //for castling animate
        if (piece?.type === PieceType.king && Math.abs(from - to) === 2) {
            const rook: Rook = Math.floor((from - to) / 2);
            const rookNewPosition = x + rook;

            rooks[Rook[rook] as keyof WhichRook][
                piece.color
            ].current.style.left = getLeft(rookNewPosition);
        }

        pieceImage.style.zIndex = '2';

        //for move animate
        pieceImage.style.top = getTop(y);
        pieceImage.style.left = getLeft(x);
    };

    useEffect(() => {
        if (pieceImage.current) {
            if (whoseMove === 'player' && piece!.color === playerInfo.color) {
                pieceImage.current.onmousedown = (e) => {
                    let isSameSquare: boolean = true;

                    if (activeSquare !== squareNumber) {
                        selectPiece();
                    } else {
                        isSameSquare = false;
                    }

                    let originalStyle = getComputedStyle(pieceImage.current!);
                    pieceImage.current!.style.opacity = '0.5';

                    let dragablePieceImage = document.createElement('img');

                    dragablePieceImage.src = pieceImage.current!.src;
                    dragablePieceImage.style.position = 'absolute';
                    dragablePieceImage.style.zIndex = '1000';
                    dragablePieceImage.style.width = originalStyle.width;
                    dragablePieceImage.style.height = originalStyle.height;
                    dragablePieceImage.style.transition = 'none';
                    dragablePieceImage.ondragstart = () => false;

                    document.body.append(dragablePieceImage);

                    const moveAt = (pageX: number, pageY: number) => {
                        dragablePieceImage.style.left =
                            pageX - dragablePieceImage.offsetWidth / 2 + 'px';
                        dragablePieceImage.style.top =
                            pageY - dragablePieceImage.offsetWidth / 2 + 'px';
                    };

                    moveAt(e.pageX, e.pageY);

                    let hoverSquare: HTMLDivElement | undefined | null;
                    const onMouseMove = (e: MouseEvent) => {
                        moveAt(e.pageX, e.pageY);

                        dragablePieceImage.hidden = true;
                        const elemBelow = document.elementFromPoint(
                            e.clientX,
                            e.clientY
                        );
                        dragablePieceImage.hidden = false;

                        hoverSquare = elemBelow?.closest('[id] .track');

                        if (hoverSquare) {
                            setHoverSquare(+hoverSquare.id);
                        } else {
                            setHoverSquare(-1);
                        }

                        const belowSquare = elemBelow?.closest('[id]');
                        if (belowSquare && isSameSquare) {
                            isSameSquare = +belowSquare.id === squareNumber;
                        } else {
                            isSameSquare = false;
                        }
                    };

                    document.addEventListener('mousemove', onMouseMove);

                    dragablePieceImage.onmouseup = function () {
                        if (hoverSquare) {
                            let capturedPiece: Piece | undefined;
                            if (hoverSquare.dataset.pieceType) {
                                capturedPiece = {
                                    type: parseInt(
                                        hoverSquare.dataset.pieceType
                                    ),
                                    color: hoverSquare.dataset.pieceColor as
                                        | 'white'
                                        | 'black',
                                };
                            }

                            const to: number = +hoverSquare.id;
                            makeMove(squareNumber, to, piece!, capturedPiece);

                            resetBoard();
                            setLastMove(squareNumber, to);
                        } else if (isSameSquare) {
                            pieceImage.current!.style.opacity = '1';
                        } else {
                            pieceImage.current!.style.opacity = '1';
                            resetBoard();
                        }

                        document.removeEventListener('mousemove', onMouseMove);

                        dragablePieceImage.onmouseup = null;
                        dragablePieceImage.remove();
                    };
                };
            } else {
                pieceImage.current.onmousedown = null;
            }
        }
    }, [onMove, piece, setLastMove, whoseMove]);

    const onMouseEnter = isTracking
        ? () => setHoverSquare(squareNumber)
        : undefined;
    const onMouseLeave = isTracking ? () => setHoverSquare(-1) : undefined;

    useEffect(() => {
        if (!isTracking) {
            setHoverSquare(-1);
        }
    }, [isTracking]);

    useEffect(() => {
        if (activeSquare === squareNumber) {
            setOnPieceMove((prevState) => {
                return (from: number, to: number) => {
                    animateMove(pieceImage.current!, from, to);
                };
            });
        }
    }, [activeSquare]);

    useEffect(() => {
        if (pieceImage.current && enemyMove.to === squareNumber) {
            //piece captured
            pieceImage.current.style.opacity = '0.5';

            setTimeout(() => {
                pieceImage.current!.style.opacity = '1';
            }, animationTime + afterAnimationTime - 1); // -1 so the front piece doesn't blink
        }

        if (pieceImage.current && enemyMove.from === squareNumber) {
            animateMove(pieceImage.current, enemyMove.from, enemyMove.to);

            if (checkSquare !== undefined) {
                setCheckSquare(undefined);
            }
            setLastMove(enemyMove.from, enemyMove.to);
        }
    }, [enemyMove]);

    useEffect(() => {
        if (piece && piece.type === PieceType.king) {
            if (chessEngine.isCheck(squareNumber, piece.color)) {
                setCheckSquare(squareNumber);
            }
        }
    }, [whoseMove]);

    let onClick;
    if (
        piece &&
        piece.color === playerInfo.color &&
        squareNumber !== activeSquare
    ) {
        onClick = selectPiece;
    } else if (isTracking) {
        onClick = () => {
            resetBoard();
            if (checkSquare !== undefined) {
                setCheckSquare(undefined);
            }

            if (pieceImage.current) {
                //piece captured
                pieceImage.current.style.opacity = '0.5';

                setTimeout(() => {
                    pieceImage.current!.style.opacity = '1';
                }, animationTime + afterAnimationTime - 1); // -1 so the front piece doesn't blink
            }

            setLastMove(activeSquare!, squareNumber);
            onPieceMove(activeSquare!, squareNumber);

            setTimeout(() => {
                makeMove(activeSquare!, squareNumber, activePiece!, piece);
            }, animationTime + afterAnimationTime);
        };
    } else {
        onClick = resetBoard;
    }

    return (
        <div
            id={squareNumber.toString()}
            className={isTracking ? 'track' : ''}
            data-piece-type={piece?.type}
            data-piece-color={piece?.color}
            onClick={whoseMove === 'player' ? onClick : undefined}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            css={css`
                cursor: pointer;
                font-size: 11px;
                width: ${boardOneEighth}%;
                background-color: ${backgroundColor};
                opacity: ${fileWherePromotion !== undefined ? 0.5 : 1};
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
                    onDragStart={(e) => {
                        e.preventDefault();
                    }}
                    css={css`
                        position: absolute;
                        z-index: 1;
                        top: ${getTop(y)};
                        left: ${getLeft(x)};
                        width: ${boardOneEighth}%;
                        transition: top ${animationTime}ms linear,
                            left ${animationTime}ms linear;

                        ${checkSquare === squareNumber
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
                    ${hoverSquare === squareNumber
                        ? `background-color: ${hoverColor};`
                        : ''}
                    ${isTracking && piece && hoverSquare !== squareNumber
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
                {isTracking && !piece && hoverSquare !== squareNumber && (
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
