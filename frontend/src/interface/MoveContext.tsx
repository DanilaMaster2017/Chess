import React, {
    FC,
    useState,
    useContext,
    createContext,
    SetStateAction,
} from 'react';
import { WhichRook } from '../types/WhichRook';

interface IMoveContext {
    onPieceMove: (x: number, y: number) => void;
    setOnPieceMove: (f: (x: number, y: number) => void) => void;
    rooks: WhichRook;
    setRooks: (rook: SetStateAction<WhichRook>) => void;
    hoverSquare: number;
    setHoverSquare: (h: number) => void;
}

const defaultRooks = {
    near: {
        white: undefined,
        black: undefined,
    },
    distant: {
        white: undefined,
        black: undefined,
    },
};

const MoveContextProvider = createContext<IMoveContext>({
    onPieceMove: (from: number, to: number) => {},
    setOnPieceMove: (f: (from: number, to: number) => void) => {},
    rooks: defaultRooks,
    setRooks: () => {
        return defaultRooks;
    },
    hoverSquare: -1,
    setHoverSquare: (n: number) => {},
});

export function useMoveContext() {
    return useContext(MoveContextProvider);
}

export const MoveContext: FC = ({ children }) => {
    const [onPieceMove, setOnPieceMove] = useState<
        (from: number, to: number) => void
    >(() => {
        return (from: number, to: number) => {};
    });

    const [rooks, setRooks] = useState<WhichRook>(defaultRooks);

    const [hoverSquare, setHoverSquare] = useState<number>(-1);

    return (
        <MoveContextProvider.Provider
            value={{
                onPieceMove,
                setOnPieceMove,
                rooks,
                setRooks,
                hoverSquare,
                setHoverSquare,
            }}
        >
            {children}
        </MoveContextProvider.Provider>
    );
};
