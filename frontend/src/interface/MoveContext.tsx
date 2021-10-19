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

    return (
        <MoveContextProvider.Provider
            value={{
                onPieceMove,
                setOnPieceMove,
                castlingRooks,
                setCastlingRooks,
            }}
        >
            {children}
        </MoveContextProvider.Provider>
    );
};
