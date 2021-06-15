/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { useGameSettingsContext } from './GameSettingsContext';

interface Props {
    value: number;
}

export const LevelButton: FC<Props> = ({ value }) => {
    const { level, setLevel } = useGameSettingsContext();
    const onClick = () => setLevel(value);

    const activeStyle = css`
        background-color: #629924;
        color: white;
    `;
    const defaultStyle = css`
        background: #f1f1f1;
        color: #4d4d4d;
        &:hover {
            background-color: #f6f6f6;
        }
    `;
    const borderRadius = '5px';

    return (
        <button
            onClick={onClick}
            css={css`
                cursor: pointer;
                padding: 10px 12px;
                border-right: 1px solid #d9d9d9;
                ${level === value ? activeStyle : defaultStyle}

                &:first-of-type {
                    border-radius: ${borderRadius} 0 0 ${borderRadius};
                }
                &:last-of-type {
                    border-right: none;
                    border-radius: 0 ${borderRadius} ${borderRadius} 0;
                }
            `}
        >
            {value}
        </button>
    );
};
