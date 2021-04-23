/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const OkButton: FC = ({ children }) => {
    return (
        <button
            css={css`
                position: relative;
                font-family: 'Roboto', sans-serif;
                cursor: pointer;
                border: 1px solid black;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
                padding: 10px 20px;
                border-radius: 10px;
                background-color: rgba(98, 153, 36, 1);
                color: white;
                font-size: 15px;
                &:hover {
                    background-color: rgba(98, 153, 36, 0.9);
                }
                &:active {
                    top: 2px;
                    box-shadow: none;
                }
            `}
        >
            {children}
        </button>
    );
};
