import long from 'long';
import { Piece } from '../types/Piece';
import { Position } from '../types/Position';
import { Players } from '../types/Players';

interface PawnsMoves {
    attacks: long[];
    moves: long[];
    aisles: long[];
}

interface IChessEngine {
    position: Position;
    getPossibleMoves: (cell: number, p: Piece) => long;
    getComputerMove: (p: Position) => Promise<Position>;
}

enum DirectionOfAttack {
    horizontal = 1,
    vertical,
    diagonalH1A8,
    diagonalA1H8,
}

const enemy: Players = {
    white: 'black',
    black: 'white',
};

const numberOfCells = 64;
const numberOfCellsInRow = 8;
const maxSixBitValue = 0b111111;

const notA: long = new long(0xfefefefe, 0xfefefefe);
const notAB: long = new long(0xfcfcfcfc, 0xfcfcfcfc);
const notH: long = new long(0x7f7f7f7f, 0x7f7f7f7f);
const notGH: long = new long(0x3f3f3f3f, 0x3f3f3f3f);

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
    private shah: long;
    private takingOnAisle: number | undefined;
    private isCastlingPossible: Players;
    private isCastlingPossibleNow: Players;

    constructor() {
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

        this.shah = long.ZERO;
        this.pawnsMoves = {
            white: { attacks: [], moves: [], aisles: [] },
            black: { attacks: [], moves: [], aisles: [] },
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

        this.isCastlingPossible = {
            white: true,
            black: true,
        };

        this.isCastlingPossibleNow = {
            white: this.setMask[5].or(this.setMask[6]),
            black: this.setMask[61].or(this.setMask[62]),
        };

        for (let i = 0; i < numberOfCellsInRow; i++) {
            this.pawnsMoves.black.moves[i] = long.ZERO;
            this.pawnsMoves.white.moves[i] = long.ZERO;

            this.pawnsMoves.black.attacks[i] = long.ZERO;
            this.pawnsMoves.white.attacks[i] = long.ZERO;

            this.pawnsMoves.black.aisles[i] = long.ZERO;
            this.pawnsMoves.white.aisles[i] = long.ZERO;

            this.pawnsMoves.black.moves[numberOfCells - 1 - i] = long.ZERO;
            this.pawnsMoves.white.moves[numberOfCells - 1 - i] = long.ZERO;

            this.pawnsMoves.black.attacks[numberOfCells - 1 - i] = long.ZERO;
            this.pawnsMoves.white.attacks[numberOfCells - 1 - i] = long.ZERO;

            this.pawnsMoves.black.aisles[numberOfCells - 1 - i] = long.ZERO;
            this.pawnsMoves.white.aisles[numberOfCells - 1 - i] = long.ZERO;
        }

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

            this.pawnsMoves.black.aisles[i] =
                i < numberOfCells - 2 * numberOfCellsInRow
                    ? long.ZERO
                    : piecePosition
                          .shiftLeft(numberOfCellsInRow)
                          .or(piecePosition.shiftLeft(2 * numberOfCellsInRow));

            this.pawnsMoves.white.aisles[i] =
                i > 2 * numberOfCellsInRow - 1
                    ? long.ZERO
                    : piecePosition
                          .shiftRightUnsigned(numberOfCellsInRow)
                          .or(
                              piecePosition.shiftRightUnsigned(
                                  2 * numberOfCellsInRow
                              )
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
            const attacksFromPosition: long[] = [];

            for (let bits = 0; bits < maxSixBitValue + 1; bits++) {
                let lineOfAttaсk: number = 0b11111111;

                let pieceAfterPosition: number = 0;
                let pieceBeforePosition: number = 0;

                let placementInLine = bits;
                let index: number = 1;

                while (placementInLine && !pieceBeforePosition) {
                    if (placementInLine % 2) {
                        if (
                            index <
                            numberOfCellsInRow - 1 - (i % numberOfCellsInRow)
                        ) {
                            pieceAfterPosition = index;
                        } else if (
                            index >
                            numberOfCellsInRow - 1 - (i % numberOfCellsInRow)
                        ) {
                            pieceBeforePosition = index;
                        }
                    }
                    placementInLine >>= 1;
                    index++;
                }

                lineOfAttaсk &= resetBit[i % numberOfCellsInRow];

                if (pieceAfterPosition) {
                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                }
                if (pieceBeforePosition) {
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];
                }

                let attack: long = long.ZERO;

                for (let k = 0; k < numberOfCellsInRow; k++) {
                    if (lineOfAttaсk % 2) {
                        attack = attack.or(
                            this.setMask[
                                Math.floor(i / numberOfCellsInRow) *
                                    numberOfCellsInRow +
                                    numberOfCellsInRow -
                                    1 -
                                    k
                            ]
                        );
                    }

                    lineOfAttaсk >>= 1;
                }

                attacksFromPosition.push(attack);
            }
            this.horizontalAttacks.push(attacksFromPosition);
        }

        for (let i = 0; i < numberOfCells; i++) {
            const attacksFromPosition: long[] = [];

            for (let bits = 0; bits < maxSixBitValue + 1; bits++) {
                let lineOfAttaсk: number = 0b11111111;

                let pieceAfterPosition: number = 0;
                let pieceBeforePosition: number = 0;

                let placementInLine = bits;
                let index: number = 1;

                while (placementInLine && !pieceBeforePosition) {
                    if (placementInLine % 2) {
                        if (index < Math.floor(i / numberOfCellsInRow)) {
                            pieceAfterPosition = index;
                        } else if (index > Math.floor(i / numberOfCellsInRow)) {
                            pieceBeforePosition = index;
                        }
                    }
                    placementInLine >>= 1;
                    index++;
                }

                lineOfAttaсk &=
                    resetBit[
                        numberOfCellsInRow -
                            1 -
                            Math.floor(i / numberOfCellsInRow)
                    ];

                if (pieceAfterPosition) {
                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                }
                if (pieceBeforePosition) {
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];
                }
                let attack: long = long.ZERO;

                for (let k = 0; k < numberOfCellsInRow; k++) {
                    if (lineOfAttaсk % 2) {
                        attack = attack.or(
                            this.setMask[
                                k * numberOfCellsInRow +
                                    (i % numberOfCellsInRow)
                            ]
                        );
                    }

                    lineOfAttaсk >>= 1;
                }

                attacksFromPosition.push(attack);
            }
            this.verticalAttacks.push(attacksFromPosition);
        }

        for (let i = 0; i < numberOfCellsInRow; i++) {
            for (let j = 0; j < numberOfCellsInRow; j++) {
                const attacksFromPosition: long[] = [];
                for (let bits = 0; bits < maxSixBitValue + 1; bits++) {
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

                    if (pieceAfterPosition) {
                        lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                    }
                    if (pieceBeforePosition) {
                        lineOfAttaсk &=
                            resetBitsBefore[pieceBeforePosition - 1];
                    }

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
                this.diagonalH1A8Attacks.push(attacksFromPosition);
            }
        }

        for (let i = 0; i < numberOfCellsInRow; i++) {
            for (let j = 0; j < numberOfCellsInRow; j++) {
                const attacksFromPosition: long[] = [];
                for (let bits = 0; bits < maxSixBitValue + 1; bits++) {
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

                    if (pieceAfterPosition) {
                        lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                    }
                    if (pieceBeforePosition) {
                        lineOfAttaсk &=
                            resetBitsBefore[pieceBeforePosition - 1];
                    }

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
                this.diagonalA1H8Attacks.push(attacksFromPosition);
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

        this.сalculateAttacksTo();
    }

    private getVerticalAttack(from: number): long {
        const line = maxSixBitValue;
        const column = from % numberOfCellsInRow;

        const verticalLine: number = this.positionRotatedLeft90
            .shiftRightUnsigned(
                (numberOfCellsInRow - 1 - column) * numberOfCellsInRow + 1
            )
            .and(line)
            .getLowBitsUnsigned();

        return this.verticalAttacks[from][verticalLine];
    }

    private getHorizontalAttack(from: number): long {
        const line = maxSixBitValue;
        const row: number = Math.floor(from / numberOfCellsInRow);

        const horizontalLine: number = this.getPositionForAll()
            .shiftRightUnsigned(
                (numberOfCellsInRow - 1 - row) * numberOfCellsInRow + 1
            )
            .and(line)
            .getLowBitsUnsigned();

        return this.horizontalAttacks[from][horizontalLine];
    }

    private getDiagonalH1A8Attack(from: number): long {
        const line = maxSixBitValue;
        const column = from % numberOfCellsInRow;
        const row: number = Math.floor(from / numberOfCellsInRow);

        let shift: number = 0;
        if (row - column > -2) {
            const number = 14 - row - (numberOfCellsInRow - 1 - column);
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = 6 - row - (numberOfCellsInRow - 1 - column);
            shift = 37 + ((14 - number + 1) / 2) * number;
        }

        const diagonalH1A8Line: number = this.positionRotatedLeft45
            .shiftRightUnsigned(shift)
            .and(line)
            .getLowBitsUnsigned();

        return this.diagonalH1A8Attacks[from][diagonalH1A8Line];
    }

    private getDiagonalA1H8Attack(from: number): long {
        const line = maxSixBitValue;
        const column = from % numberOfCellsInRow;
        const row: number = Math.floor(from / numberOfCellsInRow);

        let shift: number = 0;
        if (row >= column) {
            const number = 7 - row + column;
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = column - row;
            shift = 29 + ((16 - number + 1) / 2) * number;
        }

        const diagonalA1H8Line: number = this.positionRotatedRight45
            .shiftRightUnsigned(shift)
            .and(line)
            .getLowBitsUnsigned();

        return this.diagonalA1H8Attacks[from][diagonalA1H8Line];
    }

    public getPossibleMoves(cell: number, piece: Piece): long {
        switch (piece.type) {
            case 'bishop':
                return this.getBishopAttacks(cell, piece.color);
            case 'rook':
                return this.getRookAttacks(cell, piece.color);
            case 'queen':
                return this.getQueenAttacks(cell, piece.color);
            case 'king':
                return this.getKingAttacks(cell, piece.color);
            case 'pawn':
                return this.getPawnAttacks(cell, piece.color);
            case 'knight':
                return this.getKnightAttacks(cell, piece.color);
        }
    }

    private getPawnAttacks(from: number, color: 'white' | 'black'): long {
        const myPosition = this.getPosition(color);
        let enemyPosition = this.getPosition(enemy[color]);
        const allPostion = myPosition.or(enemyPosition);

        const notSelfPieces: long = myPosition.not();
        const sign = color === 'white' ? 1 : -1;

        let pawnMove = (this.pawnsMoves[color] as PawnsMoves).moves[from].and(
            allPostion.not()
        );

        const pawnAisle = (this.pawnsMoves[color] as PawnsMoves).aisles[from];
        if (!pawnAisle.isZero()) {
            if (pawnAisle.and(allPostion).isZero()) {
                pawnMove = pawnMove.or(pawnAisle);
            }
        }

        if (this.takingOnAisle) {
            enemyPosition = enemyPosition.or(
                this.setMask[this.takingOnAisle - sign * numberOfCellsInRow]
            );
        }

        const pawnAttack = (this.pawnsMoves[color] as PawnsMoves).attacks[
            from
        ].and(this.getPosition(enemy[color]));

        const directionOfAttack = this.isLocked(from, color, notSelfPieces);

        switch (directionOfAttack) {
            case DirectionOfAttack.horizontal:
                return long.ZERO;
            case DirectionOfAttack.vertical:
                return pawnMove;

            case DirectionOfAttack.diagonalH1A8:
                return pawnAttack.and(
                    this.setMask[from + sign * (numberOfCellsInRow - 1)].not()
                );

            case DirectionOfAttack.diagonalA1H8:
                return pawnAttack.and(
                    this.setMask[from + sign * (numberOfCellsInRow + 1)].not()
                );
        }

        if (!this.shah.isZero()) {
            return pawnMove.or(pawnAttack).and(this.shah);
        }

        return pawnMove.or(pawnAttack);
    }
    private getKnightAttacks(from: number, color: 'white' | 'black'): long {
        const notSelfPieces: long = this.getPosition(color).not();

        if (this.isLocked(from, color, notSelfPieces)) {
            return long.ZERO;
        }

        if (!this.shah.isZero()) {
            return this.knightsAttacks[from].and(this.shah);
        }

        return this.knightsAttacks[from].and(notSelfPieces);
    }
    private getRookAttacks(from: number, color: 'white' | 'black'): long {
        const notSelfPieces: long = this.getPosition(color).not();

        const horizontalAttack = this.getHorizontalAttack(from);
        const verticalAttack = this.getVerticalAttack(from);

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            horizontalAttack,
            verticalAttack
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.horizontal:
                return horizontalAttack.and(notSelfPieces);
            case DirectionOfAttack.vertical:
                return verticalAttack.and(notSelfPieces);
            case DirectionOfAttack.diagonalH1A8:
            case DirectionOfAttack.diagonalA1H8:
                return long.ZERO;
        }

        const rookAttack = horizontalAttack.or(verticalAttack);

        if (!this.shah.isZero()) {
            return rookAttack.and(this.shah);
        }

        return rookAttack.and(notSelfPieces);
    }

    private getBishopAttacks(from: number, color: 'white' | 'black'): long {
        const notSelfPieces: long = this.getPosition(color).not();

        const h1A8Attack = this.getDiagonalH1A8Attack(from);
        const a1h8Attack = this.getDiagonalA1H8Attack(from);

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            undefined,
            undefined,
            h1A8Attack,
            a1h8Attack
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.diagonalH1A8:
                return h1A8Attack.and(notSelfPieces);
            case DirectionOfAttack.diagonalA1H8:
                return a1h8Attack.and(notSelfPieces);
            case DirectionOfAttack.horizontal:
            case DirectionOfAttack.vertical:
                return long.ZERO;
        }

        const bishopAttack = h1A8Attack.or(a1h8Attack);

        if (!this.shah.isZero()) {
            return bishopAttack.and(this.shah);
        }

        return bishopAttack.and(notSelfPieces);
    }

    private getQueenAttacks(from: number, color: 'white' | 'black'): long {
        const notSelfPieces: long = this.getPosition(color).not();

        const horizontalAttack = this.getHorizontalAttack(from);
        const verticalAttack = this.getVerticalAttack(from);
        const h1A8Attack = this.getDiagonalH1A8Attack(from);
        const a1h8Attack = this.getDiagonalA1H8Attack(from);

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            horizontalAttack,
            verticalAttack,
            h1A8Attack,
            a1h8Attack
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.horizontal:
                return horizontalAttack.and(notSelfPieces);
            case DirectionOfAttack.vertical:
                return verticalAttack.and(notSelfPieces);
            case DirectionOfAttack.diagonalH1A8:
                return h1A8Attack.and(notSelfPieces);
            case DirectionOfAttack.diagonalA1H8:
                return a1h8Attack.and(notSelfPieces);
        }

        const queenAttack = horizontalAttack
            .or(verticalAttack)
            .or(h1A8Attack)
            .or(a1h8Attack);

        if (!this.shah.isZero()) {
            return queenAttack.and(this.shah);
        }

        return queenAttack.and(notSelfPieces);
    }
    private getKingAttacks(from: number, color: 'white' | 'black'): long {
        const notSelfPieces: long = this.getPosition(color).not();
        let kingAttacks = this.kingAttacks[from];

        const row = Math.floor(from / numberOfCellsInRow);
        const column = from % numberOfCellsInRow;

        const fromI = row < 1 ? 0 : row - 1;
        const fromJ = column < 1 ? 0 : column - 1;
        const toI = row < numberOfCellsInRow - 1 ? numberOfCellsInRow : row + 2;
        const toJ = row < numberOfCellsInRow - 1 ? numberOfCellsInRow : row + 2;

        for (let i = fromI; i < toI; i++) {
            for (let j = fromJ; j < toJ; j++) {
                if (i === row && j === column) continue;

                const index = i * numberOfCellsInRow + j;
                if (!this.attacksTo[index].isZero()) {
                    kingAttacks = kingAttacks.and(this.setMask[index].not());
                }
            }
        }

        if (this.isCastlingPossible[color]) {
            if (
                this.getPositionForAll()
                    .and(this.isCastlingPossibleNow[color])
                    .isZero()
            ) {
                const from = color === 'white' ? 3 : 59;
                let isNowhereAttacks = true;

                for (let i = from; i > from - 3; i--) {
                    if (!this.attacksTo[i].isZero()) {
                        isNowhereAttacks = false;
                    }
                }

                if (isNowhereAttacks) {
                    kingAttacks = kingAttacks.or(this.setMask[from - 3]);
                }
            }
        }

        return kingAttacks.and(notSelfPieces);
    }

    private isLocked(
        from: number,
        color: 'white' | 'black',
        notSelfPieces: long,
        horizontalAttack?: long,
        verticalAttack?: long,
        h1A8Attack?: long,
        a1h8Attack?: long
    ): DirectionOfAttack | null {
        const enemiesAttacking = this.attacksTo[from].and(notSelfPieces);

        if (!enemiesAttacking.isZero) {
            const bishopsAttackingPiece = enemiesAttacking.and(
                this.position.queen[enemy[color] as 'white' | 'black'].or(
                    this.position.bishops[enemy[color] as 'white' | 'black']
                )
            );

            if (!bishopsAttackingPiece.isZero()) {
                let bishopAttackFromCurrent =
                    h1A8Attack ?? this.getDiagonalH1A8Attack(from);

                if (
                    bishopAttackFromCurrent
                        .and(bishopsAttackingPiece)
                        .getNumBitsAbs() === 1
                ) {
                    if (
                        !bishopAttackFromCurrent
                            .and(this.position.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.diagonalH1A8;
                }

                bishopAttackFromCurrent =
                    a1h8Attack ?? this.getDiagonalA1H8Attack(from);

                if (
                    bishopAttackFromCurrent
                        .and(bishopsAttackingPiece)
                        .getNumBitsAbs() === 1
                ) {
                    if (
                        !bishopAttackFromCurrent
                            .and(this.position.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.diagonalA1H8;
                }
            }

            const rooksAttackingPiece = enemiesAttacking.and(
                this.position.queen[enemy[color] as 'white' | 'black'].or(
                    this.position.rooks[enemy[color] as 'white' | 'black']
                )
            );

            if (!rooksAttackingPiece.isZero()) {
                let rookAttackFromCurrent =
                    horizontalAttack ?? this.getHorizontalAttack(from);

                if (
                    rookAttackFromCurrent
                        .and(rooksAttackingPiece)
                        .getNumBitsAbs() === 1
                ) {
                    if (
                        !rookAttackFromCurrent
                            .and(this.position.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.horizontal;
                }

                rookAttackFromCurrent =
                    verticalAttack ?? this.getVerticalAttack(from);

                if (
                    rookAttackFromCurrent
                        .and(rooksAttackingPiece)
                        .getNumBitsAbs() === 1
                ) {
                    if (
                        !rookAttackFromCurrent
                            .and(this.position.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.vertical;
                }
            }
        }

        return null;
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
