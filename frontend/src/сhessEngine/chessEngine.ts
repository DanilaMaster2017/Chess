import long from 'long'

export interface Position {
    whitePawns : long;
    whiteKnights : long;
    whiteRooks : long;
    whiteBishops : long;
    whiteQueen : long;
    whiteKing : long;
    blackPawns : long;
    blackKnights : long;
    blackRooks : long;
    blackBishops : long;
    blackQueen : long;
    blackKing : long;
}

export const getInitialPosition = () :Position => {
    const initialPosition : Position = {
        whitePawns : long.ZERO,
        whiteKnights : long.ZERO,
        whiteRooks : long.ZERO,
        whiteBishops : long.ZERO,
        whiteQueen : long.ZERO,
        whiteKing : long.ZERO,
        blackPawns : long.ZERO,
        blackKnights : long.ZERO,
        blackRooks : long.ZERO,
        blackBishops : long.ZERO,
        blackQueen : long.ZERO,
        blackKing : long.ZERO,
    };

    initialPosition.blackRooks = long.ONE.shiftLeft(7).or(long.ONE);
    initialPosition.blackKnights = long.ONE.shiftLeft(6).or(long.ONE.shiftLeft(1));
    initialPosition.blackBishops = long.ONE.shiftLeft(5).or(long.ONE.shiftLeft(2));
    initialPosition.blackKing = long.ONE.shiftLeft(4);
    initialPosition.blackQueen = long.ONE.shiftLeft(3);  
    initialPosition.blackPawns = long.ONE.shiftLeft(8)
        .or(long.ONE.shiftLeft(9))
        .or(long.ONE.shiftLeft(10))
        .or(long.ONE.shiftLeft(11))
        .or(long.ONE.shiftLeft(12))
        .or(long.ONE.shiftLeft(13))
        .or(long.ONE.shiftLeft(14))
        .or(long.ONE.shiftLeft(15));

    initialPosition.whiteRooks = long.ONE.shiftLeft(63).or(long.ONE.shiftLeft(56));
    initialPosition.whiteKnights = long.ONE.shiftLeft(62).or(long.ONE.shiftLeft(57));
    initialPosition.whiteBishops = long.ONE.shiftLeft(61).or(long.ONE.shiftLeft(58));
    initialPosition.whiteKing = long.ONE.shiftLeft(60);
    initialPosition.whiteQueen = long.ONE.shiftLeft(59);
    initialPosition.whitePawns = long.ONE.shiftLeft(48)
        .or(long.ONE.shiftLeft(49))
        .or(long.ONE.shiftLeft(50))
        .or(long.ONE.shiftLeft(51))
        .or(long.ONE.shiftLeft(52))
        .or(long.ONE.shiftLeft(53))
        .or(long.ONE.shiftLeft(54))
        .or(long.ONE.shiftLeft(55));

    return initialPosition;
};
