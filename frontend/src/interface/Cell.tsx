/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState } from 'react';
import { Piece } from '../types/Piece';
import { getPieceImage } from '../functions/getPieceImage';
import { CellStatus } from '../types/CellStatus';

interface Props {
    onClick?: () => void;
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
}) => {
    const [isHover, setIsHover] = useState<Boolean>(false);

    const onMouseEnter =
        status & CellStatus.tracking ? () => setIsHover(true) : undefined;
    const onMouseLeave =
        status & CellStatus.tracking ? () => setIsHover(false) : undefined;

    const backgroundColor = (x + y) % 2 ? '#B58863' : '#F0D9B5';
    const symbolСolor = (x + y) % 2 ? '#F0D9B5' : '#B58863';
    const trackingColor = 'rgba(20,85,30,0.5)';
    const hoverStyle = isHover
        ? `&:hover {
        background-color: rgba(20,85, 0, 0.3)          
    }`
        : '';
    let backlightColor;

    if (status & CellStatus.lastMove) {
        backlightColor = 'rgba(155,199,0,0.41)';
    } else if (status & CellStatus.active) {
        backlightColor = trackingColor;
    } else {
        backlightColor = 'transparent';
    }

    return (
        <div
            onClick={onClick}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            css={css`
                cursor: pointer;
                font-size: 11px;
                position: relative;
                width: 12.5%;
                background-color: ${backgroundColor};
                overflow: hidden;
                &::before {
                    content: '';
                    padding-top: 100%;
                    float: left;
                }
            `}
        >
            <div
                css={css`
                    display: flex;
                    width: 100%;
                    height: 100%;
                    background-color: ${backlightColor};
                    ${hoverStyle};
                `}
            >
                {piece && (
                    <img
                        css={css`
                            max-width: 100%;
                            max-height: 100%;
                        `}
                        src={getPieceImage(piece)}
                        alt=""
                    />
                )}
                {letter && (
                    <span
                        css={css`
                            position: absolute;
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
