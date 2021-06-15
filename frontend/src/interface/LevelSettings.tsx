/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { LevelButton } from './LevelButton';

const generateLevelButtons = () => {
    const numberOfLevels: number = 8;
    const sartLevel: number = 1;
    const buttons = [];

    for (let i: number = sartLevel; i <= numberOfLevels; i++) {
        buttons.push(<LevelButton key={i} value={i}></LevelButton>);
    }

    return buttons;
};

export const LevelSettings: FC = () => {
    return (
        <div
            css={css`
                margin-top: 15px;
            `}
        >
            <div
                css={css`
                    margin-bottom: 7px;
                    text-align: center;
                    font-size: 14px;
                    color: #4d4d4d;
                `}
            >
                Уровень сложности:
            </div>
            <div
                css={css`
                    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
                    border-radius: 5px;
                `}
            >
                {generateLevelButtons()}
            </div>
        </div>
    );
};
