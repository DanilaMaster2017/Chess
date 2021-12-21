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
    onPromote: (p: Piece) => void;
    setOnPromote: (f: SetStateAction<(p: Piece) => void>) => void;
    enemyMove: Move;
    setEnemyMove: (m: Move) => void;
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
    fileWherePromotion: number | undefined;
    setFileWherePromotion: (file: number | undefined) => void;
}

const defaultMove: Move = {
    from: -1,
    to: -1,
    piece: { color: 'white', type: PieceType.bishop },
};

const BoardContextProvider = createContext<IBoardContext>({
    onMove: async (m: Move) => {},
    onPromote: (p: Piece) => {},
    lastMove: long.ZERO,
    enemyMove: defaultMove,
    checkSquare: undefined,
    activeSquare: undefined,
    activePiece: undefined,
    track: long.ZERO,
    fileWherePromotion: undefined,
    setOnMove: (f: SetStateAction<(m: Move) => Promise<void>>) => {},
    setOnPromote: (f: SetStateAction<(p: Piece) => void>) => {},
    setLastMove: () => {},
    setEnemyMove: () => {},
    setCheckSquare: () => {},
    setActiveSquare: () => {},
    setActivePiece: () => {},
    setTrack: () => {},
    setFileWherePromotion: () => {},
});

export function useBoardContext() {
    return useContext(BoardContextProvider);
}

export const BoardContext: FC = ({ children }) => {
    const [onMove, setOnMove] = useState<(m: Move) => Promise<void>>(() => {
        return async (m: Move) => {};
    });
    const [onPromote, setOnPromote] = useState<(p: Piece) => void>(() => {
        return (p: Piece) => {};
    });

    const [track, setTrack] = useState<long>(long.ZERO);
    const [activeSquare, setActiveSquare] = useState<number>();
    const [activePiece, setActivePiece] = useState<Piece>();
    const [enemyMove, setEnemyMove] = useState<Move>(defaultMove);
    const [checkSquare, setCheckSquare] = useState<number>();
    const [lastMove, setLastMoveState] = useState<long>(long.ZERO);
    const [fileWherePromotion, setFileWherePromotion] = useState<number>();

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
                onPromote,
                lastMove,
                enemyMove,
                checkSquare,
                activeSquare,
                activePiece,
                track,
                fileWherePromotion,
                setOnMove,
                setOnPromote,
                setLastMove,
                setEnemyMove,
                setCheckSquare,
                setActiveSquare,
                setActivePiece,
                setTrack,
                setFileWherePromotion,
            }}
        >
            {children}
        </BoardContextProvider.Provider>
    );
};
