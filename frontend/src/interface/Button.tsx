/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    onClick: () => void;
}

export const Button: FC<Props> = ({ onClick, children }) => {
    return (
        <button
            onClick={onClick}
            css={css`
                position: relative;
                font-family: 'Roboto', sans-serif;
                border: 1px solid black;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
                margin: 20px 0;
                padding: 10px 20px;
                border-radius: 10px;
                background-color: white;
                color: black;
                text-transform: lowercase;
                font-size: 15px;
                &:hover {
                    color: white;
                    background-color: #eaa77f;
                    cursor: pointer;
                }
                &:active {
                    top: 2px;
                    box-shadow: none;
                    background-color: orange;
                }
            `}
        >
            {children}
        </button>
    );
};
