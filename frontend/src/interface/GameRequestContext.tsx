/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, createContext, useState, useContext } from 'react';
import { GameRequest } from '../types/GameRequest';

interface IGameRequestContext {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    gameRequests: GameRequest[];
    setGameRequests: (request: GameRequest[]) => void;
}

const GameRequestProvider = createContext<IGameRequestContext>({
    isLoading: true,
    setIsLoading: () => {},
    gameRequests: [],
    setGameRequests: () => {},
});

export const useGameRequestContext = () => {
    return useContext(GameRequestProvider);
};

export const GameRequestContext: FC = ({ children }) => {
    const [gameRequests, setGameRequests] = useState<GameRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    return (
        <GameRequestProvider.Provider
            value={{ gameRequests, setGameRequests, isLoading, setIsLoading }}
        >
            {children}
        </GameRequestProvider.Provider>
    );
};
