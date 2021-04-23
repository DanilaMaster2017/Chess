/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState, useEffect } from 'react';
import { Range } from './Range';
import { timesForGame, timesForMove } from '../constants/constants';
import { useGameSettingsContext } from './GameSettingsContext';

export const TimeSettings: FC = () => {
    const [disabled, setDisabled] = useState<boolean | undefined>(true);

    const {
        timeForGame,
        setTimeForGame,
        timeForMove,
        setTimeForMove,
    } = useGameSettingsContext();

    useEffect(() => {
        setDisabled(timeForGame === 0);
    }, [timeForGame]);

    return (
        <div
            css={css`
                padding: 15px 20px;
                background-color: #f7f6f5;
                border-top: 1px solid #d9d9d9;
                border-bottom: 1px solid #d9d9d9;
                & div:last-child {
                    margin: 0;
                }
            `}
        >
            <Range
                label="Минут на партию"
                time={timeForGame}
                onTimeChanged={setTimeForGame}
                possibleValues={timesForGame}
            ></Range>
            <Range
                label="Добавление секунд на ход"
                time={timeForMove}
                onTimeChanged={setTimeForMove}
                possibleValues={timesForMove}
                disabled={disabled}
            ></Range>
        </div>
    );
};
