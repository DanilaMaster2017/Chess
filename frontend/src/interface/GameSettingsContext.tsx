import React, { FC, useState, useContext, createContext } from 'react';

interface IGameSettingsContext {
    color: 'white' | 'black' | 'random';
    level: number;
    timeForGame: number;
    timeForMove: number;
    setColor: (v: 'white' | 'black' | 'random') => void;
    setLevel: (v: number) => void;
    setTimeForGame: (v: number) => void;
    setTimeForMove: (v: number) => void;
}

const defaultColor = 'random';
const defaultLevel = 0;
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
            }}
        >
            {children}
        </GameSettingsContextProvider.Provider>
    );
};
