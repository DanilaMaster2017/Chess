import React, { FC, useState, useContext, createContext } from 'react';
import { PlayerInfo } from '../types/PlayerInfo';

interface IGameInfoContext {
    playerInfo: PlayerInfo;
    enemyInfo: PlayerInfo;
    playerTakenPieces: Map<string, number>;
    enemyTakenPieces: Map<string, number>;
    playerTimeLeft?: Date;
    enemyTimeLeft?: Date;
    isReverse: boolean;
    whoseMove: 'player' | 'enemy' | 'gameOver';
    setPlayerInfo: (v: PlayerInfo) => void;
    setEnemyInfo: (v: PlayerInfo) => void;
    setPlayerTakenPieces: (v: Map<string, number>) => void;
    setEnemyTakenPieces: (v: Map<string, number>) => void;
    setPlayerTimeLeft: (v: Date) => void;
    setEnemyTimeLeft: (v: Date) => void;
    setIsReverse: (v: boolean) => void;
    setWhoseMove: (v: 'player' | 'enemy' | 'gameOver') => void;
}

const defaultplayerInfo: PlayerInfo = {
    color: 'white',
    name: 'Аноним',
};
const defaultTakenPieces: Map<string, number> = new Map();
const defaultIsReverse = false;
const defaultWhoseMove = 'player';

const GameInfoContextProvider = createContext<IGameInfoContext>({
    playerInfo: defaultplayerInfo,
    enemyInfo: defaultplayerInfo,
    playerTakenPieces: defaultTakenPieces,
    enemyTakenPieces: defaultTakenPieces,
    whoseMove: defaultWhoseMove,
    isReverse: defaultIsReverse,
    setPlayerInfo: () => {},
    setEnemyInfo: () => {},
    setPlayerTakenPieces: () => {},
    setEnemyTakenPieces: () => {},
    setPlayerTimeLeft: () => {},
    setEnemyTimeLeft: () => {},
    setIsReverse: () => {},
    setWhoseMove: () => {},
});

export function useGameInfoContext() {
    return useContext(GameInfoContextProvider);
}

export const GameInfoContext: FC = ({ children }) => {
    const [playerInfo, setPlayerInfo] = useState<PlayerInfo>(defaultplayerInfo);
    const [enemyInfo, setEnemyInfo] = useState<PlayerInfo>(defaultplayerInfo);
    const [playerTakenPieces, setPlayerTakenPieces] = useState<
        Map<string, number>
    >(defaultTakenPieces);
    const [enemyTakenPieces, setEnemyTakenPieces] = useState<
        Map<string, number>
    >(defaultTakenPieces);
    const [playerTimeLeft, setPlayerTimeLeft] = useState<Date | undefined>();
    const [enemyTimeLeft, setEnemyTimeLeft] = useState<Date | undefined>();
    const [isReverse, setIsReverse] = useState<boolean>(defaultIsReverse);
    const [whoseMove, setWhoseMove] = useState<'player' | 'enemy' | 'gameOver'>(
        defaultWhoseMove
    );

    return (
        <GameInfoContextProvider.Provider
            value={{
                playerInfo,
                enemyInfo,
                playerTakenPieces,
                enemyTakenPieces,
                playerTimeLeft,
                enemyTimeLeft,
                isReverse,
                whoseMove,
                setPlayerInfo,
                setEnemyInfo,
                setPlayerTakenPieces,
                setEnemyTakenPieces,
                setPlayerTimeLeft,
                setEnemyTimeLeft,
                setIsReverse,
                setWhoseMove,
            }}
        >
            {children}
        </GameInfoContextProvider.Provider>
    );
};
