import React, { FC, useState, useContext, createContext } from 'react';
import { PlayerInfo } from '../types/PlayerInfo';

interface IGameInfoContext {
    playerInfo: PlayerInfo;
    enemyInfo: PlayerInfo;
    playerCapturedPieces: Map<string, number>;
    enemyCapturedPieces: Map<string, number>;
    playerTimeLeft?: Date;
    enemyTimeLeft?: Date;
    isReverse: boolean;
    whoseMove: 'player' | 'enemy' | 'gameOver';
    setPlayerInfo: (v: PlayerInfo) => void;
    setEnemyInfo: (v: PlayerInfo) => void;
    setPlayerCapturedPieces: (v: Map<string, number>) => void;
    setEnemyCapturedPieces: (v: Map<string, number>) => void;
    setPlayerTimeLeft: (v: Date) => void;
    setEnemyTimeLeft: (v: Date) => void;
    setIsReverse: (v: boolean) => void;
    setWhoseMove: (v: 'player' | 'enemy' | 'gameOver') => void;
}

const defaultplayerInfo: PlayerInfo = {
    color: 'white',
    name: 'Аноним',
};
const defaultCapturedPieces: Map<string, number> = new Map();
const defaultIsReverse = false;
const defaultWhoseMove = 'player';

const GameInfoContextProvider = createContext<IGameInfoContext>({
    playerInfo: defaultplayerInfo,
    enemyInfo: defaultplayerInfo,
    playerCapturedPieces: defaultCapturedPieces,
    enemyCapturedPieces: defaultCapturedPieces,
    whoseMove: defaultWhoseMove,
    isReverse: defaultIsReverse,
    setPlayerInfo: () => {},
    setEnemyInfo: () => {},
    setPlayerCapturedPieces: () => {},
    setEnemyCapturedPieces: () => {},
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
    const [playerCapturedPieces, setPlayerCapturedPieces] = useState<
        Map<string, number>
    >(defaultCapturedPieces);
    const [enemyCapturedPieces, setEnemyCapturedPieces] = useState<
        Map<string, number>
    >(defaultCapturedPieces);
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
                playerCapturedPieces,
                enemyCapturedPieces,
                playerTimeLeft,
                enemyTimeLeft,
                isReverse,
                whoseMove,
                setPlayerInfo,
                setEnemyInfo,
                setPlayerCapturedPieces,
                setEnemyCapturedPieces,
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
