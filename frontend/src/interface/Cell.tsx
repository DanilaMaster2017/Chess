/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    piece?: string;
    letter?: string;
    digit?: string;
    x: number;
    y: number;
}

export const Cell: FC<Props> = ({ piece, x, y, letter, digit }) => {
    const backgroundColor = (x + y) % 2 ? '#B58863' : '#F0D9B5';
    const colorSymbol = (x + y) % 2 ? '#F0D9B5' : '#B58863';

    return (
        <div
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
            {piece && (
                <img
                    css={css`
                        max-width: 100%;
                        max-height: 100%;
                    `}
                    src={piece}
                    alt=""
                />
            )}
            {letter && (
                <span
                    css={css`
                        position: absolute;
                        left: 2px;
                        bottom: 2px;
                        color: ${colorSymbol};
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
                        color: ${colorSymbol};
                    `}
                >
                    {digit}
                </span>
            )}
        </div>
    );
};
