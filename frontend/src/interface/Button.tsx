/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Button: FC = ({ children }) => {
    return (
        <button
            css={css`
                font-family: 'Roboto', sans-serif;
                border: 1px solid black;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
                margin: 20px 0;
                padding: 10px 20px;
                border-radius: 10px;
                background-color: white;
                color: black;
                font-size: 15px;
                &:hover {
                    box-shadow: none;
                    color: white;
                    background-color: #eaa77f;
                    cursor: pointer;
                }
                &:active {
                    background-color: orange;
                }
            `}
        >
            {children}
        </button>
    );
};
