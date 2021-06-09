import React, { FC, useState, useContext, createContext } from 'react';
import { timesForGame, timesForMove } from '../constants/constants';

interface IGameSettingsContext {
    color: 'white' | 'black' | 'random';
    level: number;
    timeForGame: number;
    timeForMove: number;
    setColor: (v: 'white' | 'black' | 'random') => void;
    setLevel: (v: number) => void;
    setTimeForGame: (v: number) => void;
    setTimeForMove: (v: number) => void;
    getTimeForGame: () => number;
    getTimeForMove: () => number;
}

const defaultColor = 'random';
const defaultLevel = 1;
const defaultTimeForGame = 0;
const defaultTimeForMove = 0;

const GameSettingsContextProvider = createContext<IGameSettingsContext>({
    color: defaultColor,
    level: defaultLevel,
    timeForGame: defaultTimeForGame,
    timeForMove: defaultTimeForMove,
    setColor: () => {},
    setLevel: () => {},
    setTimeForGame: () => {},
    setTimeForMove: () => {},
    getTimeForGame: () => {
        return 0;
    },
    getTimeForMove: () => {
        return 0;
    },
});

export function useGameSettingsContext() {
    return useContext(GameSettingsContextProvider);
}

export const GameSettingsContext: FC = ({ children }) => {
    const [color, setColor] = useState<'white' | 'black' | 'random'>(
        defaultColor
    );
    const [level, setLevel] = useState<number>(defaultLevel);
    const [timeForGame, setTimeForGame] = useState<number>(defaultTimeForGame);
    const [timeForMove, setTimeForMove] = useState<number>(defaultTimeForMove);

    const getTimeForGame = () => {
        return timesForGame[timeForGame];
    };

    const getTimeForMove = () => {
        return timesForMove[timeForMove];
    };

    return (
        <GameSettingsContextProvider.Provider
            value={{
                color,
                level,
                timeForGame,
                timeForMove,
                setColor,
                setLevel,
                setTimeForGame,
                setTimeForMove,
                getTimeForGame,
                getTimeForMove,
            }}
        >
            {children}
        </GameSettingsContextProvider.Provider>
    );
};
