import long from 'long';
import React, {
    FC,
    useState,
    useContext,
    createContext,
    SetStateAction,
} from 'react';
import { squaresCount } from '../constants/constants';
import { Move } from '../types/Move';
import { Piece } from '../types/Piece';
import { PieceType } from '../types/PieceType';

interface IBoardContext {
    onMove: (m: Move) => Promise<void>;
    setOnMove: (f: SetStateAction<(m: Move) => Promise<void>>) => void;
    enemyMove: Move;
    setEnemyMove: (cm: Move) => void;
    lastMove: long;
    setLastMove: (f: number, t: number) => void;
    checkSquare: number | undefined;
    setCheckSquare: (cell: number | undefined) => void;
    activeSquare: number | undefined;
    setActiveSquare: (cell: number | undefined) => void;
    activePiece: Piece | undefined;
    setActivePiece: (piece: Piece | undefined) => void;
    track: long;
    setTrack: (track: long) => void;
}

const defaultMove: Move = {
    from: -1,
    to: -1,
    piece: { color: 'white', type: PieceType.bishop },
};

const BoardContextProvider = createContext<IBoardContext>({
    onMove: async (m: Move) => {},
    lastMove: long.ZERO,
    enemyMove: defaultMove,
    checkSquare: undefined,
    activeSquare: undefined,
    activePiece: undefined,
    track: long.ZERO,
    setOnMove: (f: SetStateAction<(m: Move) => Promise<void>>) => {},
    setLastMove: () => {},
    setEnemyMove: () => {},
    setCheckSquare: () => {},
    setActiveSquare: () => {},
    setActivePiece: () => {},
    setTrack: () => {},
});

export function useBoardContext() {
    return useContext(BoardContextProvider);
}

export const BoardContext: FC = ({ children }) => {
    const [onMove, setOnMove] = useState<(m: Move) => Promise<void>>(() => {
        return async (m: Move) => {};
    });

    const [track, setTrack] = useState<long>(long.ZERO);
    const [activeSquare, setActiveSquare] = useState<number | undefined>();
    const [activePiece, setActivePiece] = useState<Piece>();
    const [enemyMove, setEnemyMove] = useState<Move>(defaultMove);
    const [checkSquare, setCheckSquare] = useState<number | undefined>();
    const [lastMove, setLastMoveState] = useState<long>(long.ZERO);

    const setLastMove = (from: number, to: number) => {
        setLastMoveState(
            long.ONE.shiftLeft(squaresCount - 1 - to).or(
                long.ONE.shiftLeft(squaresCount - 1 - from)
            )
        );
    };

    return (
        <BoardContextProvider.Provider
            value={{
                onMove,
                lastMove,
                enemyMove,
                checkSquare,
                activeSquare,
                activePiece,
                track,
                setOnMove,
                setLastMove,
                setEnemyMove,
                setCheckSquare,
                setActiveSquare,
                setActivePiece,
                setTrack,
            }}
        >
            {children}
        </BoardContextProvider.Provider>
    );
};
