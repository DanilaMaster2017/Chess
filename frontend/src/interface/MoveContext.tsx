import React, {
    FC,
    useState,
    useContext,
    createContext,
    SetStateAction,
} from 'react';
import { Players } from '../types/Players';

interface IMoveContext {
    onPieceMove: (top: string, left: string) => void;
    setOnPieceMove: (f: (top: string, left: string) => void) => void;
    castlingRooks: Players;
    setCastlingRooks: (castlingRook: SetStateAction<Players>) => void;
    hoverSquare: number;
    setHoverSquare: (h: number) => void;
}

const defaultCastlingRooks = {
    white: undefined,
    black: undefined,
};

const MoveContextProvider = createContext<IMoveContext>({
    onPieceMove: (top: string, left: string) => {},
    setOnPieceMove: (f: (top: string, left: string) => void) => {},
    castlingRooks: defaultCastlingRooks,
    setCastlingRooks: () => {
        return defaultCastlingRooks;
    },
    hoverSquare: -1,
    setHoverSquare: (n: number) => {},
});

export function useMoveContext() {
    return useContext(MoveContextProvider);
}

export const MoveContext: FC = ({ children }) => {
    const [onPieceMove, setOnPieceMove] = useState<
        (top: string, left: string) => void
    >(() => {
        return (top: string, left: string) => {};
    });

    const [castlingRooks, setCastlingRooks] = useState<Players>(
        defaultCastlingRooks
    );

    const [hoverSquare, setHoverSquare] = useState<number>(-1);

    return (
        <MoveContextProvider.Provider
            value={{
                onPieceMove,
                setOnPieceMove,
                castlingRooks,
                setCastlingRooks,
                hoverSquare,
                setHoverSquare,
            }}
        >
            {children}
        </MoveContextProvider.Provider>
    );
};
