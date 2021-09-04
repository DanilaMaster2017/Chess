import long from 'long';
import { Piece } from '../types/Piece';
import { Position } from '../types/Position';
import { Players } from '../types/Players';

interface PawnsMoves {
    attacks: long[];
    moves: long[];
}

interface IChessEngine {
    position: Position;
    getPossibleMoves: (cell: number, p: Piece) => long;
    getComputerMove: (p: Position) => Promise<Position>;
}

const numberOfCells = 64;
const numberOfCellsInRow = 8;

const notA: long = new long(0xfefefefe, 0xfefefefe);
const notAB: long = new long(0xfcfcfcfc, 0xfcfcfcfc);
const notH: long = new long(0x7f7f7f7f, 0x7f7f7f7f);
const notGH: long = new long(0x3f3f3f3f, 0x3f3f3f3f);

interface IChessEngine {
    position: Position;
    getPossibleMoves: (cell: number, p: Piece) => long;
    getComputerMove: (p: Position) => Promise<Position>;
}

class ChessEngine implements IChessEngine {
    public position: Position;

    private minus7: long[];
    private minus8: long[];
    private minus9: long[];
    private minus1: long[];
    private plus7: long[];
    private plus8: long[];
    private plus9: long[];
    private plus1: long[];

    private setMask: long[];
    private setMaskRotatedLeft90: long[];
    private setMaskRotatedLeft45: long[];
    private setMaskRotatedRight45: long[];
    private positionRotatedLeft90: long;
    private positionRotatedLeft45: long;
    private positionRotatedRight45: long;
    private kingAttacks: long[];
    private knightsAttacks: long[];
    private pawnsMoves: Players;
    private horizontalAttacks: long[][];
    private verticalAttacks: long[][];
    private diagonalA1H8Attacks: long[][];
    private diagonalH1A8Attacks: long[][];

    private attacksTo: long[];

    constructor() {
        this.position = {
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
        };

        this.minus7 = [];
        this.minus8 = [];
        this.minus9 = [];
        this.minus1 = [];
        this.plus7 = [];
        this.plus8 = [];
        this.plus9 = [];
        this.plus1 = [];

        this.setMask = [];
        this.setMaskRotatedLeft90 = [];
        this.setMaskRotatedLeft45 = [];
        this.setMaskRotatedRight45 = [];
        this.kingAttacks = [];
        this.knightsAttacks = [];
        this.horizontalAttacks = [];
        this.verticalAttacks = [];
        this.diagonalA1H8Attacks = [];
        this.diagonalH1A8Attacks = [];
        this.attacksTo = [];

        this.positionRotatedLeft90 = long.ZERO;
        this.positionRotatedLeft45 = long.ZERO;
        this.positionRotatedRight45 = long.ZERO;

        this.pawnsMoves = {
            white: { attacks: [], moves: [] },
            black: { attacks: [], moves: [] },
        };

        for (let i = 0; i < numberOfCells; i++) {
            this.setMask.push(long.ONE.shiftLeft(numberOfCells - 1 - i));

            this.setMaskRotatedLeft90.push(
                long.ONE.shiftLeft(
                    numberOfCells -
                        1 -
                        (numberOfCellsInRow -
                            1 -
                            Math.floor(i / numberOfCellsInRow)) -
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

                this.setMaskRotatedLeft45.push(this.setMask[index]);
                index += cellIncrement;
            }

            rowIncrement -= numberOfCells - 1 - i;
        }

        rowIncrement = 28;
        for (let i = 0; i < numberOfCellsInRow; i++) {
            let index = numberOfCellsInRow * i + rowIncrement;

            for (let j = 0; j < numberOfCellsInRow; j++) {
                let cellIncrement;

                if (i <= j) {
                    cellIncrement = 7 + i - j;
                } else {
                    cellIncrement = 8 - i + j;
                }

                this.setMaskRotatedRight45.push(this.setMask[index]);
                index -= cellIncrement;
            }

            rowIncrement -= i;
        }

        this.position = {
            pawns: {
                white: this.setMask[8]
                    .or(this.setMask[9])
                    .or(this.setMask[10])
                    .or(this.setMask[11])
                    .or(this.setMask[12])
                    .or(this.setMask[13])
                    .or(this.setMask[14])
                    .or(this.setMask[15]),
                black: this.setMask[48]
                    .or(this.setMask[49])
                    .or(this.setMask[50])
                    .or(this.setMask[51])
                    .or(this.setMask[52])
                    .or(this.setMask[53])
                    .or(this.setMask[54])
                    .or(this.setMask[55]),
            },

            knights: {
                white: this.setMask[6].or(this.setMask[1]),
                black: this.setMask[62].or(this.setMask[57]),
            },

            rooks: {
                white: this.setMask[7].or(this.setMask[0]),
                black: this.setMask[63].or(this.setMask[56]),
            },

            bishops: {
                white: this.setMask[5].or(this.setMask[2]),
                black: this.setMask[61].or(this.setMask[58]),
            },

            queen: {
                white: this.setMask[3],
                black: this.setMask[59],
            },

            king: {
                white: this.setMask[4],
                black: this.setMask[60],
            },
        };

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

        for (let i = 0; i < numberOfCells; i++) {
            const piecePosition = long.ONE.shiftLeft(numberOfCells - 1 - i);

            this.knightsAttacks.push(
                notGH
                    .and(
                        piecePosition
                            .shiftLeft(6)
                            .or(piecePosition.shiftRight(10))
                    )
                    .or(
                        notH.and(
                            piecePosition
                                .shiftLeft(15)
                                .or(piecePosition.shiftRight(17))
                        )
                    )
                    .or(
                        notA.and(
                            piecePosition
                                .shiftLeft(17)
                                .or(piecePosition.shiftRight(15))
                        )
                    )
                    .or(
                        notAB.and(
                            piecePosition
                                .shiftLeft(10)
                                .or(piecePosition.shiftRight(6))
                        )
                        )
                    );
                }
                this.minus9.push(minus7Attack);

            this.kingAttacks.push(
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
                this.minus8.push(minus8Attack);

        for (
            let i = numberOfCellsInRow;
            i < numberOfCells - numberOfCellsInRow;
            i++
        ) {
            const piecePosition = long.ONE.shiftLeft(numberOfCells - 1 - i);

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

                let plus8Attack: long = long.ZERO;
                for (let k = 0; k < numberOfCellsInRow - 1 - i; k++) {
                    plus8Attack.or(
                        piecePosition.shiftRightUnsigned(
                            (k + 1) * numberOfCellsInRow
                        )
                    );
                }
                this.plus8.push(plus8Attack);

                let plus9Attack: long = long.ZERO;
                for (
                    let k = 0;
                    k < numberOfCellsInRow - 1 - i &&
                    k < numberOfCellsInRow - 1 - j;
                    k++
                ) {
                    plus9Attack.or(
                        piecePosition.shiftRightUnsigned(
                            (k + 1) * (numberOfCellsInRow + 1)
                        )
                    );
                }
                this.plus9.push(plus9Attack);
            }
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

                        if (index < Math.floor(i / numberOfCellsInRow)) {
                            pieceAfterPositionVertical = index;
                        } else if (index > Math.floor(i / numberOfCellsInRow)) {
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
                    resetBit[
                        numberOfCellsInRow -
                            1 -
                            Math.floor(i / numberOfCellsInRow)
                    ];
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
                                Math.floor(i / numberOfCellsInRow) *
                                    numberOfCellsInRow +
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

        for (let i = 0; i < numberOfCellsInRow; i++) {
            for (let j = 0; j < numberOfCellsInRow; j++) {
                const piecePosition: number = i * numberOfCellsInRow + j;

                let minus1Attack: long = long.ZERO;
                for (let k = 0; k < j; k++) {
                    minus1Attack = minus1Attack.or(
                        this.setMask[piecePosition - k - 1]
                    );
                }
                this.minus1.push(minus1Attack);

                let minus7Attack: long = long.ZERO;
                for (let k = 0; k < i && k < numberOfCellsInRow - 1 - j; k++) {
                    minus7Attack = minus7Attack.or(
                        this.setMask[
                            piecePosition - (k + 1) * (numberOfCellsInRow - 1)
                        ]
                    );
                }
                this.minus7.push(minus7Attack);

                let minus8Attack: long = long.ZERO;
                for (let k = 0; k < i; k++) {
                    minus8Attack = minus8Attack.or(
                        this.setMask[
                            piecePosition - (k + 1) * numberOfCellsInRow
                        ]
                    );
                }
                this.minus8.push(minus8Attack);

                let minus9Attack: long = long.ZERO;
                for (let k = 0; k < i && k < j; k++) {
                    minus9Attack = minus9Attack.or(
                        this.setMask[
                            piecePosition - (k + 1) * (numberOfCellsInRow + 1)
                        ]
                    );
                }
                this.minus9.push(minus9Attack);

                let plus1Attack: long = long.ZERO;
                for (let k = 0; k < numberOfCellsInRow - 1 - j; k++) {
                    plus1Attack = plus1Attack.or(
                        this.setMask[piecePosition + k + 1]
                    );
    }
                this.plus1.push(plus1Attack);

                let plus7Attack: long = long.ZERO;
                for (let k = 0; k < numberOfCellsInRow - 1 - i && k < j; k++) {
                    plus7Attack = plus7Attack.or(
                        this.setMask[
                            piecePosition + (k + 1) * (numberOfCellsInRow - 1)
                        ]
                    );
    }
                this.plus7.push(plus7Attack);

                let plus8Attack: long = long.ZERO;
                for (let k = 0; k < numberOfCellsInRow - 1 - i; k++) {
                    plus8Attack = plus8Attack.or(
                        this.setMask[
                            piecePosition + (k + 1) * numberOfCellsInRow
                        ]
                    );
    }
                this.plus8.push(plus8Attack);

                let plus9Attack: long = long.ZERO;
                for (
                    let k = 0;
                    k < numberOfCellsInRow - 1 - i &&
                    k < numberOfCellsInRow - 1 - j;
                    k++
                ) {
                    plus9Attack = plus9Attack.or(
                        this.setMask[
                            piecePosition + (k + 1) * (numberOfCellsInRow + 1)
                        ]
                    );
                }
                this.plus9.push(plus9Attack);
            }
        }
    }

    private getVerticalAttack(from: number): long {
        const line = 0x11111111;
        const column = from % numberOfCellsInRow;

        const verticalLine: number = this.positionRotatedLeft90
                .shiftRightUnsigned(
                (numberOfCellsInRow - 1 - column) * numberOfCellsInRow
                )
                .and(line)
                .getLowBitsUnsigned();

        return this.verticalAttacks[from][verticalLine];
    }

    private getHorizontalAttack(from: number): long {
        const line = 0x11111111;
        const row: number = Math.floor(from / numberOfCellsInRow);

        const horizontalLine: number = this.getPositionForAll()
                .shiftRightUnsigned(
                (numberOfCellsInRow - 1 - row) * numberOfCellsInRow
                )
                .and(line)
                .getLowBitsUnsigned();

        return this.horizontalAttacks[from][horizontalLine];
            }

    private getDiagonalH1A8Attack(from: number): long {
        const line = 0x11111111;
        const column = from % numberOfCellsInRow;
        const row: number = Math.floor(from / numberOfCellsInRow);

        let shift: number = 0;
        if (row + column > 5) {
            const number = 14 - row - column;
            shift = ((2 + number - 1) / 2) * number;
        } else {
            const number = 6 - row - column;
            shift = 36 + ((14 - number + 1) / 2) * number;
            }

        const diagonalH1A8Line: number = this.positionRotatedLeft45
            .shiftRightUnsigned(shift)
                .and(line)
                .getLowBitsUnsigned();

        return this.diagonalH1A8Attacks[from][diagonalH1A8Line];
    }

    private getDiagonalA1H8Attack(from: number): long {
        const line = 0x11111111;
        const column = from % numberOfCellsInRow;
        const row: number = Math.floor(from / numberOfCellsInRow);

        let shift: number = 0;
        if (row >= column) {
            const number = 7 - row + column;
            shift = ((2 + number - 1) / 2) * number;
        } else {
            const number = column - row;
            shift = 28 + ((16 - number + 1) / 2) * number;
        }

        for (let j = 0; j < numberOfCellsInRow - 1 - row + column; j++) {
            shift += numberOfCellsInRow - Math.abs(numberOfCellsInRow - 1 - j);
        }

        const diagonalA1H8Line: number = this.positionRotatedRight45
            .shiftRightUnsigned(shift)
                .and(line)
                .getLowBitsUnsigned();

        return this.diagonalA1H8Attacks[from][diagonalA1H8Line];
    }
    async getComputerMove(position: Position): Promise<Position> {
        return position;
    }

    private сalculateAttacksTo(): void {
        for (let i = 0; i < numberOfCells; i++) {
            this.attacksTo[i] = this.kingAttacks[i]
                .and(this.position.king.black.or(this.position.king.white))
                .or(
                    this.knightsAttacks[i].and(
                        this.position.knights.black.or(
                            this.position.knights.white
                        )
                    )
                )
                .or(
                    this.pawnsMoves.black.attacks[i].and(
                        this.position.pawns.black
                    )
                )
                .or(
                    this.pawnsMoves.white.attacks[i].and(
                        this.position.pawns.white
                    )
                )
                .or(
                    this.getHorizontalAttack(i)
                        .or(this.getVerticalAttack(i))
                        .and(
                            this.position.queen.black
                                .or(this.position.queen.white)
                                .or(this.position.rooks.black)
                                .or(this.position.rooks.white)
                        )
                )
                .or(
                    this.getDiagonalH1A8Attack(i)
                        .or(this.getDiagonalA1H8Attack(i))
                        .and(
                            this.position.queen.black
                                .or(this.position.queen.white)
                                .or(this.position.bishops.black)
                                .or(this.position.bishops.white)
                        )
                );
        }
    }

    private getPosition(color: 'white' | 'black'): long {
        return this.position.bishops[color]
            .or(this.position.king[color])
            .or(this.position.knights[color])
            .or(this.position.pawns[color])
            .or(this.position.queen[color])
            .or(this.position.rooks[color]);
    }

    private getPositionForAll(): long {
        return this.getPosition('black').or(this.getPosition('white'));
    }
}

export const chessEngine: ChessEngine = new ChessEngine();
