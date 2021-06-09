/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    disabled?: boolean;
    onClick: () => void;
}

export const OkButton: FC<Props> = ({ children, onClick, disabled }) => {
    const disabledStyle = css`
        cursor: not-allowed;
        opacity: 0.5;
    `;
    const defaultStyle = css`
        cursor: pointer;
        &:hover {
            background-color: rgba(98, 153, 36, 0.9);
        }
    `;
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            css={css`
                ${disabled ? disabledStyle : defaultStyle}
                position: relative;
                border: 1px solid black;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
                padding: 10px 20px;
                border-radius: 10px;
                background-color: rgba(98, 153, 36, 1);
                color: white;
                font-size: 15px;

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
