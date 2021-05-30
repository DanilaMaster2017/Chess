/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    faClass: string;
    title?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export const ControlButton: FC<Props> = ({
    children,
    faClass,
    title,
    disabled,
    onClick,
}) => {
    const defaultStyle = css`
        color: #5f5f5f;
        &:hover {
            color: #f3f7ee;
            background-color: #89b25b;
        }
    `;

    const disabledStyle = css`
        color: #abaaaa;
    `;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={faClass}
            css={css`
                padding: 6px 20px;
                background-color: transparent;
                ${disabled ? disabledStyle : defaultStyle}
            `}
        >
            {children}
        </button>
    );
};
