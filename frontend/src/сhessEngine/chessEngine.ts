import long from 'long';
import { Piece } from '../types/Piece';
import { Position } from '../types/Position';

interface PawnsMoves {
    attacks: long[];
    moves: long[];
}

interface Pawns {
    white: PawnsMoves;
    black: PawnsMoves;
}

const numberOfCells = 64;
const numberOfCellsInRow = 8;

const notA: long = new long(0xfefefefe, 0xfefefefe);
const notAB: long = new long(0xfcfcfcfc, 0xfcfcfcfc);
const notH: long = new long(0x7f7f7f7f, 0x7f7f7f7f);
const notGH: long = new long(0x3f3f3f3f, 0x3f3f3f3f);

interface ChessEngine {
    setMask: long[];
    setMaskRotatedLeft90: long[];
    setMaskRotatedLeft45: long[];
    setMaskRotatedRight45: long[];
    position: Position;
    positionRotatedLeft90: long;
    positionRotatedLeft45: long;
    positionRotatedRight45: long;
    knightsAttaks: long[];
    kingAttaks: long[];
    pawnsMoves: Pawns;
    horizontalAttacks: long[][];
    verticalAttacks: long[][];
    diagonalA1H8Attacks: long[][];
    diagonalH1A8Attacks: long[][];
    initializeBitboards: () => void;
    getPossibleMoves: (cell: number, p: Piece) => long;
    getComputerMove: (p: Position) => Promise<Position>;
}

export const chessEngine: ChessEngine = {
    position: {
        whitePawns: long.ONE.shiftLeft(48)
            .or(long.ONE.shiftLeft(49))
            .or(long.ONE.shiftLeft(50))
            .or(long.ONE.shiftLeft(51))
            .or(long.ONE.shiftLeft(52))
            .or(long.ONE.shiftLeft(53))
            .or(long.ONE.shiftLeft(54))
            .or(long.ONE.shiftLeft(55)),
        whiteKnights: long.ONE.shiftLeft(62).or(long.ONE.shiftLeft(57)),
        whiteRooks: long.ONE.shiftLeft(63).or(long.ONE.shiftLeft(56)),
        whiteBishops: long.ONE.shiftLeft(61).or(long.ONE.shiftLeft(58)),
        whiteQueen: long.ONE.shiftLeft(59),
        whiteKing: long.ONE.shiftLeft(60),
        blackPawns: long.ONE.shiftLeft(8)
            .or(long.ONE.shiftLeft(9))
            .or(long.ONE.shiftLeft(10))
            .or(long.ONE.shiftLeft(11))
            .or(long.ONE.shiftLeft(12))
            .or(long.ONE.shiftLeft(13))
            .or(long.ONE.shiftLeft(14))
            .or(long.ONE.shiftLeft(15)),
        blackKnights: long.ONE.shiftLeft(6).or(long.ONE.shiftLeft(1)),
        blackRooks: long.ONE.shiftLeft(7).or(long.ONE),
        blackBishops: long.ONE.shiftLeft(5).or(long.ONE.shiftLeft(2)),
        blackQueen: long.ONE.shiftLeft(3),
        blackKing: long.ONE.shiftLeft(4),
    },
    setMask: [],
    setMaskRotatedLeft90: [],
    setMaskRotatedLeft45: [],
    setMaskRotatedRight45: [],
    positionRotatedLeft90: long.ZERO,
    positionRotatedLeft45: long.ZERO,
    positionRotatedRight45: long.ZERO,
    kingAttaks: [],
    knightsAttaks: [],
    pawnsMoves: {
        white: { attacks: [], moves: [] },
        black: { attacks: [], moves: [] },
    },
    horizontalAttacks: [],
    verticalAttacks: [],
    diagonalA1H8Attacks: [],
    diagonalH1A8Attacks: [],

    initializeBitboards() {
        for (let i = 0; i < numberOfCells; i++) {
            const piecePosition: long = long.ONE.shiftLeft(
                numberOfCells - 1 - i
            );

            this.knightsAttaks.push(
                notGH
                    .and(
                        piecePosition
                            .shiftLeft(6)
                            .or(piecePosition.shiftRightUnsigned(10))
                    )
                    .or(
                        notH.and(
                            piecePosition
                                .shiftLeft(15)
                                .or(piecePosition.shiftRightUnsigned(17))
                        )
                    )
                    .or(
                        notA.and(
                            piecePosition
                                .shiftLeft(17)
                                .or(piecePosition.shiftRightUnsigned(15))
                        )
                    )
                    .or(
                        notAB.and(
                            piecePosition
                                .shiftLeft(10)
                                .or(piecePosition.shiftRightUnsigned(6))
                        )
                    )
            );

            this.kingAttaks.push(
                piecePosition
                    .shiftLeft(8)
                    .or(piecePosition.shiftRightUnsigned(8))
                    .or(
                        notH.and(
                            piecePosition
                                .shiftLeft(9)
                                .or(piecePosition.shiftLeft(1))
                                .or(piecePosition.shiftRightUnsigned(7))
                        )
                    )
                    .or(
                        notA.and(
                            piecePosition
                                .shiftRightUnsigned(9)
                                .or(piecePosition.shiftRightUnsigned(1))
                                .or(piecePosition.shiftLeft(7))
                        )
                    )
            );
        }

        for (
            let i = numberOfCellsInRow;
            i < numberOfCells - numberOfCellsInRow;
            i++
        ) {
            const piecePosition: long = long.ONE.shiftLeft(
                numberOfCells - 1 - i
            );

            this.pawnsMoves.black.moves[i] = piecePosition.shiftLeft(
                numberOfCellsInRow
            );
            this.pawnsMoves.white.moves[i] = piecePosition.shiftRightUnsigned(
                numberOfCellsInRow
            );

            this.pawnsMoves.black.attacks[i] = piecePosition
                .shiftLeft(numberOfCellsInRow - 1)
                .and(notH)
                .or(piecePosition.shiftLeft(numberOfCellsInRow + 1).and(notA));

            this.pawnsMoves.white.attacks[i] = piecePosition
                .shiftRightUnsigned(numberOfCellsInRow - 1)
                .and(notA)
                .or(
                    piecePosition
                        .shiftRightUnsigned(numberOfCellsInRow + 1)
                        .and(notH)
                );
        }

        for (let i = 0; i < numberOfCells; i++) {
            const piecePosition: long = long.ONE.shiftLeft(
                numberOfCells - 1 - i
            );

            this.setMask.push(piecePosition);

            this.setMaskRotatedLeft90.push(
                long.ONE.shiftLeft(
                    numberOfCells -
                        1 -
                        (numberOfCellsInRow - 1 - i / numberOfCellsInRow) -
                        numberOfCellsInRow * (i % numberOfCellsInRow)
                )
            );
        }

        let rowIncrement = 0;
        for (let i = 0; i < numberOfCellsInRow; i++) {
            let index = numberOfCells * i + rowIncrement;

            for (let j = 0; j < numberOfCellsInRow; j++) {
                let cellIncrement;

                if (i + j < 7) {
                    cellIncrement = i + j + 2;
                } else {
                    cellIncrement = 15 - (i + j);
                }

                this.setMaskRotatedLeft45.push(
                    long.ONE.shiftLeft(numberOfCells - 1 - index)
                );
                index += cellIncrement;
            }

            rowIncrement -= numberOfCells - 1 - i;
        }

        rowIncrement = 28;
        for (let i = 0; i < numberOfCellsInRow; i++) {
            let index = numberOfCells * i + rowIncrement;

            for (let j = 0; j < numberOfCellsInRow; j++) {
                let cellIncrement;

                if (i <= j) {
                    cellIncrement = 7 - (i + j);
                } else {
                    cellIncrement = 8 - i + j;
                }

                this.setMaskRotatedRight45.push(
                    long.ONE.shiftLeft(numberOfCells - 1 - index)
                );
                index -= cellIncrement;
            }

            rowIncrement -= i;
        }

        for (let i = 0; i < numberOfCellsInRow * 2; i++) {
            this.positionRotatedLeft90 = this.positionRotatedLeft90
                .or(this.setMaskRotatedLeft90[i])
                .or(
                    this.setMaskRotatedLeft90[
                        this.setMaskRotatedLeft90.length - 1 - i
                    ]
                );

            this.positionRotatedLeft45 = this.positionRotatedLeft45
                .or(this.setMaskRotatedLeft45[i])
                .or(
                    this.setMaskRotatedLeft45[
                        this.setMaskRotatedLeft45.length - 1 - i
                    ]
                );

            this.positionRotatedRight45 = this.positionRotatedRight45
                .or(this.setMaskRotatedRight45[i])
                .or(
                    this.setMaskRotatedRight45[
                        this.setMaskRotatedRight45.length - 1 - i
                    ]
                );
        }

        const resetBit: number[] = [];
        resetBit.push(0b1111111);
        resetBit.push(0b10111111);
        resetBit.push(0b11011111);
        resetBit.push(0b11101111);
        resetBit.push(0b11110111);
        resetBit.push(0b11111011);
        resetBit.push(0b11111101);
        resetBit.push(0b11111110);

        const resetBitsAfter: number[] = [];
        resetBitsAfter.push(0b11111110);
        resetBitsAfter.push(0b11111100);
        resetBitsAfter.push(0b11111000);
        resetBitsAfter.push(0b11110000);
        resetBitsAfter.push(0b11100000);
        resetBitsAfter.push(0b11000000);

        const resetBitsBefore: number[] = [];
        resetBitsBefore.push(0b11);
        resetBitsBefore.push(0b111);
        resetBitsBefore.push(0b1111);
        resetBitsBefore.push(0b11111);
        resetBitsBefore.push(0b111111);
        resetBitsBefore.push(0b1111111);

        for (let i = 0; i < numberOfCells; i++) {
            const horizontalAttacksFromPosition: long[] = [];
            const verticalAttacksFromPosition: long[] = [];

            for (let bits = 0; bits < 64; bits++) {
                let lineOfAttaсkHorizontal: number = 0b11111111;
                let lineOfAttaсkVertical: number = 0b11111111;

                let pieceAfterPositionHorizontal: number = 0;
                let pieceBeforePositionHorizontal: number = 0;
                let pieceAfterPositionVertical: number = 0;
                let pieceBeforePositionVertical: number = 0;

                let placementInLine = bits;
                let index: number = 1;

                while (
                    placementInLine &&
                    (!pieceBeforePositionHorizontal ||
                        !pieceBeforePositionVertical)
                ) {
                    if (placementInLine % 2) {
                        if (
                            index <
                            numberOfCellsInRow - 1 - (i % numberOfCellsInRow)
                        ) {
                            pieceAfterPositionHorizontal = index;
                        } else if (
                            index >
                            numberOfCellsInRow - 1 - (i % numberOfCellsInRow)
                        ) {
                            pieceBeforePositionHorizontal = index;
                        }

                        if (index < i / numberOfCellsInRow) {
                            pieceAfterPositionVertical = index;
                        } else if (index > i / numberOfCellsInRow) {
                            pieceBeforePositionVertical = index;
                        }
                    }
                    placementInLine >>= 1;
                    index++;
                }

                lineOfAttaсkHorizontal &= resetBit[i % numberOfCellsInRow];
                lineOfAttaсkHorizontal &=
                    resetBitsAfter[pieceAfterPositionHorizontal - 1];
                lineOfAttaсkHorizontal &=
                    resetBitsBefore[pieceBeforePositionHorizontal - 1];

                lineOfAttaсkVertical &=
                    resetBit[numberOfCellsInRow - 1 - i / numberOfCellsInRow];
                lineOfAttaсkVertical &=
                    resetBitsAfter[pieceAfterPositionVertical - 1];
                lineOfAttaсkVertical &=
                    resetBitsBefore[pieceBeforePositionVertical - 1];

                let horizontalAttack: long = long.ZERO;
                let verticalAttack: long = long.ZERO;

                for (let k = 0; k < numberOfCellsInRow; k++) {
                    if (lineOfAttaсkHorizontal % 2) {
                        horizontalAttack = horizontalAttack.or(
                            this.setMask[
                                (i / numberOfCellsInRow) * numberOfCellsInRow +
                                    numberOfCellsInRow -
                                    1 -
                                    k
                            ]
                        );
                    }

                    if (lineOfAttaсkVertical % 2) {
                        verticalAttack = verticalAttack.or(
                            this.setMask[
                                k * numberOfCellsInRow +
                                    (i % numberOfCellsInRow)
                            ]
                        );
                    }

                    lineOfAttaсkHorizontal >>= 1;
                    lineOfAttaсkVertical >>= 1;
                }

                horizontalAttacksFromPosition.push(horizontalAttack);
                verticalAttacksFromPosition.push(verticalAttack);
            }
            this.horizontalAttacks.push(horizontalAttacksFromPosition);
            this.verticalAttacks.push(verticalAttacksFromPosition);
        }

        for (let i = 0; i < numberOfCellsInRow; i++) {
            for (let j = 0; j < numberOfCellsInRow; j++) {
                const attacksFromPosition: long[] = [];
                for (let bits = 0; bits < 64; bits++) {
                    let lineOfAttaсk: number = 0b11111111;

                    let pieceAfterPosition: number = 0;
                    let pieceBeforePosition: number = 0;

                    let placementInLine = bits;
                    let index: number = 1;

                    while (placementInLine && !pieceBeforePosition) {
                        if (placementInLine % 2) {
                            if (i + j < numberOfCellsInRow) {
                                if (index < i) {
                                    pieceAfterPosition = index;
                                } else if (index > i) {
                                    pieceBeforePosition = index;
                                }
                            } else {
                                if (index < numberOfCellsInRow - 1 - j) {
                                    pieceAfterPosition = index;
                                } else if (index > numberOfCellsInRow - 1 - j) {
                                    pieceBeforePosition = index;
                                }
                            }
                        }
                        placementInLine >>= 1;
                        index++;
                    }

                    if (i + j < numberOfCellsInRow) {
                        lineOfAttaсk &= resetBit[numberOfCellsInRow - 1 - i];
                    } else {
                        lineOfAttaсk &= resetBit[j];
                    }

                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];

                    let attack = long.ZERO;

                    for (
                        let k = 0;
                        k <
                        numberOfCellsInRow -
                            Math.abs(numberOfCellsInRow - 1 - i - j);
                        k++
                    ) {
                        if (lineOfAttaсk % 2) {
                            if (i + j < numberOfCellsInRow) {
                                attack = attack.or(
                                    this.setMask[
                                        i + j + k * (numberOfCellsInRow - 1)
                                    ]
                                );
                            } else {
                                attack = attack.or(
                                    this.setMask[
                                        (i + j - 6) * numberOfCellsInRow -
                                            1 +
                                            k * (numberOfCellsInRow - 1)
                                    ]
                                );
                            }
                        }
                        lineOfAttaсk >>= 1;
                    }
                    attacksFromPosition.push(attack);
                }
                this.diagonalA1H8Attacks.push(attacksFromPosition);
            }
        }

        for (let i = 0; i < numberOfCellsInRow; i++) {
            for (let j = 0; j < numberOfCellsInRow; j++) {
                const attacksFromPosition: long[] = [];
                for (let bits = 0; bits < 64; bits++) {
                    let lineOfAttaсk: number = 0b11111111;

                    let pieceAfterPosition: number = 0;
                    let pieceBeforePosition: number = 0;

                    let placementInLine = bits;
                    let index: number = 1;

                    while (placementInLine && !pieceBeforePosition) {
                        if (placementInLine % 2) {
                            if (j > i) {
                                if (index < numberOfCellsInRow - 1 - j) {
                                    pieceAfterPosition = index;
                                } else if (index > numberOfCellsInRow - 1 - j) {
                                    pieceBeforePosition = index;
                                }
                            } else {
                                if (index < numberOfCellsInRow - 1 - i) {
                                    pieceAfterPosition = index;
                                } else if (index > numberOfCellsInRow - 1 - i) {
                                    pieceBeforePosition = index;
                                }
                            }
                        }
                        placementInLine >>= 1;
                        index++;
                    }

                    if (j > i) {
                        lineOfAttaсk &= resetBit[j];
                    } else {
                        lineOfAttaсk &= resetBit[i];
                    }

                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];

                    let attack = long.ZERO;

                    for (
                        let k = 0;
                        k < numberOfCellsInRow - Math.abs(i - j);
                        k++
                    ) {
                        if (lineOfAttaсk % 2) {
                            if (j > i) {
                                attack = attack.or(
                                    this.setMask[
                                        (numberOfCellsInRow - 1 - (j - i)) *
                                            numberOfCellsInRow +
                                            numberOfCellsInRow -
                                            1 -
                                            k * (numberOfCellsInRow + 1)
                                    ]
                                );
                            } else {
                                attack = attack.or(
                                    this.setMask[
                                        numberOfCells -
                                            1 -
                                            (i - j) -
                                            k * (numberOfCellsInRow + 1)
                                    ]
                                );
                            }
                        }
                        lineOfAttaсk >>= 1;
                    }
                    attacksFromPosition.push(attack);
                }
                this.diagonalH1A8Attacks.push(attacksFromPosition);
            }
        }
    },

    getPossibleMoves(cell: number, piece: Piece) {
        return long.ZERO;
    },

    async getComputerMove(position: Position): Promise<Position> {
        return position;
    },
};
