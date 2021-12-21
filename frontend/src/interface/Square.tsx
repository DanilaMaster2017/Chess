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
import { Players } from '../types/Players';
import { PieceType } from '../types/PieceType';
import { chessEngine } from '../сhessEngine/chessEngine';
import { useBoardContext } from './BoardContext';
import long from 'long';

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
        castlingRooks,
        setCastlingRooks,
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

    const top = boardSide
        ? boardOneEighth * y + '%'
        : boardOneEighth * (sideSize - 1 - y) + '%';
    const left = boardSide
        ? boardOneEighth * x + '%'
        : boardOneEighth * (sideSize - 1 - x) + '%';

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
        if (pieceImage.current) {
            pieceImage.current!.style.left = left;
            pieceImage.current!.style.top = top;
        }
    }, [left, top]);

    useEffect(() => {
        if (squareNumber === 0) {
            setCastlingRooks((prev: Players) => {
                return {
                    white: pieceImage,
                    black: prev.black,
                };
            });
        } else if (squareNumber === 56) {
            setCastlingRooks((prev: Players) => {
                return {
                    white: prev.white,
                    black: pieceImage,
                };
            });
        }
    }, []);

    useEffect(() => {
        if (pieceImage.current && piece?.color === playerInfo.color) {
            if (whoseMove === 'player') {
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

                            if (
                                piece!.type === PieceType.pawn &&
                                (to < 8 || to > 55)
                            ) {
                                setOnPromote(() => {
                                    return (promotedPiece: Piece) => {
                                        onMove({
                                            from: squareNumber,
                                            to,
                                            piece: piece!,
                                            capturedPiece,
                                            promotedPiece,
                                        });
                                    };
                                });

                                setWhoseMove('nobodys');
                                setFileWherePromotion(to % sideSize);
                            } else {
                                onMove({
                                    from: squareNumber,
                                    to,
                                    piece: piece!,
                                    capturedPiece,
                                });
                            }

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

                    pieceImage.current!.style.zIndex = '2';

                    //for move animate
                    pieceImage.current!.style.top = top;
                    pieceImage.current!.style.left = left;
                };
            });
        }
    }, [activeSquare, boardSide]);

    useEffect(() => {
        if (pieceImage.current && enemyMove.to === squareNumber) {
            //piece captured
            pieceImage.current.style.opacity = '0.5';

            setTimeout(() => {
                pieceImage.current!.style.opacity = '1';
            }, animationTime + afterAnimationTime - 1); // -1 so the front piece doesn't blink
        }

        if (pieceImage.current && enemyMove.from === squareNumber) {
            const x = enemyMove.to % sideSize;
            const y = Math.floor(enemyMove.to / sideSize);

            //for castling animate
            if (
                piece?.type === PieceType.king &&
                enemyMove.from - enemyMove.to === 2
            ) {
                castlingRooks[piece.color].current.style.left =
                    x === 6 ? '62.5%' : '25%';
            }

            const top = boardSide
                ? boardOneEighth * y + '%'
                : boardOneEighth * (sideSize - 1 - y) + '%';
            const left = boardSide
                ? boardOneEighth * x + '%'
                : boardOneEighth * (sideSize - 1 - x) + '%';

            pieceImage.current!.style.zIndex = '2';

            //for move animate
            pieceImage.current!.style.top = top;
            pieceImage.current!.style.left = left;

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
            onPieceMove(top, left);

            setTimeout(() => {
                if (
                    activePiece!.type === PieceType.pawn &&
                    (squareNumber < 8 || squareNumber > 55)
                ) {
                    setOnPromote(() => {
                        return (promotedPiece: Piece) => {
                            onMove({
                                from: activeSquare!,
                                to: squareNumber,
                                piece: activePiece!,
                                capturedPiece: piece,
                                promotedPiece,
                            });
                        };
                    });

                    setWhoseMove('nobodys');
                    setFileWherePromotion(squareNumber % sideSize);
                } else {
                    onMove({
                        from: activeSquare!,
                        to: squareNumber,
                        piece: activePiece!,
                        capturedPiece: piece,
                    });
                }
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
                        top: ${top};
                        left: ${left};
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
