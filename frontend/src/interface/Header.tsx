/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { A } from './A';
import chessImage from '../images/icon.jpg';
const imgSize = '42px';

export const Header: FC = () => {
    return (
        <div
            css={css`
                position: sticky;
                z-index: 9999;
                top: 0;
                padding: 7px 50px;
                width: 100%;
                background-color: #222222;
            `}
        >
            <A href="/">
                <div
                    css={css`
                        display: inline-flex;
                        justify-content: flex-start;
                        align-items: center;
                    `}
                >
                    <img
                        css={css`
                            border-radius: 5px;
                            width: ${imgSize};
                            height: ${imgSize};
                            margin: 0 10px 0 0;
                        `}
                        src={chessImage}
                        alt="chess"
                    />
                    <span
                        css={css`
                            color: white;
                            font-size: 30px;
                            &::first-letter {
                                color: #f37021;
                                font-size: 44px;
                            }
                            &:hover {
                                color: #adadad;
                                &::first-letter {
                                    color: #cc7000;
                                }
                            }
                        `}
                    >
                        Chess
                    </span>
                </div>
            </A>
        </div>
    );
};
