import long from 'long';
import React, {
    FC,
    useState,
    useContext,
    createContext,
    SetStateAction,
} from 'react';
import { numberOfCells } from '../constants/constants';
import { Move } from '../types/Move';
import { PieceType } from '../types/PieceType';
import { PlayerInfo } from '../types/PlayerInfo';

interface IInfoContext {
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
    onMove: (m: Move) => Promise<void>;
    setOnMove: (f: SetStateAction<(m: Move) => Promise<void>>) => void;
    enemyMove: Move;
    setEnemyMove: (cm: Move) => void;
    lastMove: long;
    setLastMove: (f: number, t: number) => void;
    shahCell: number | undefined;
    setShahCell: (cell: number | undefined) => void;
}

const defaultplayerInfo: PlayerInfo = {
    color: 'white',
    name: 'Аноним',
};
const defaultTakenPieces: Map<string, number> = new Map();
const defaultIsReverse = false;
const defaultWhoseMove = 'player';
const defaultMove: Move = {
    from: -1,
    to: -1,
    piece: { color: 'white', type: PieceType.bishop },
};

const InfoContextProvider = createContext<IInfoContext>({
    playerInfo: defaultplayerInfo,
    enemyInfo: defaultplayerInfo,
    playerTakenPieces: defaultTakenPieces,
    enemyTakenPieces: defaultTakenPieces,
    whoseMove: defaultWhoseMove,
    isReverse: defaultIsReverse,
    onMove: async (m: Move) => {},
    lastMove: long.ZERO,
    enemyMove: defaultMove,
    setPlayerInfo: () => {},
    setEnemyInfo: () => {},
    setPlayerTakenPieces: () => {},
    setEnemyTakenPieces: () => {},
    setPlayerTimeLeft: () => {},
    setEnemyTimeLeft: () => {},
    setIsReverse: () => {},
    setWhoseMove: () => {},
    setOnMove: (f: SetStateAction<(m: Move) => Promise<void>>) => {},
    setLastMove: () => {},
    setEnemyMove: () => {},
    shahCell: undefined,
    setShahCell: () => {},
});

export function useInfoContext() {
    return useContext(InfoContextProvider);
}

export const InfoContext: FC = ({ children }) => {
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
    const [onMove, setOnMove] = useState<(m: Move) => Promise<void>>(() => {
        return async (m: Move) => {};
    });

    const [lastMove, setLastMoveState] = useState<long>(long.ZERO);
    const [shahCell, setShahCell] = useState<number | undefined>();

    const setLastMove = (from: number, to: number) => {
        setLastMoveState(
            long.ONE.shiftLeft(numberOfCells - 1 - to).or(
                long.ONE.shiftLeft(numberOfCells - 1 - from)
            )
        );
    };

    const [enemyMove, setEnemyMove] = useState<Move>(defaultMove);

    return (
        <InfoContextProvider.Provider
            value={{
                playerInfo,
                enemyInfo,
                playerTakenPieces,
                enemyTakenPieces,
                playerTimeLeft,
                enemyTimeLeft,
                isReverse,
                whoseMove,
                onMove,
                lastMove,
                enemyMove,
                shahCell,
                setPlayerInfo,
                setEnemyInfo,
                setPlayerTakenPieces,
                setEnemyTakenPieces,
                setPlayerTimeLeft,
                setEnemyTimeLeft,
                setIsReverse,
                setWhoseMove,
                setOnMove,
                setLastMove,
                setEnemyMove,
                setShahCell,
            }}
        >
            {children}
        </InfoContextProvider.Provider>
    );
};
