import long from 'long';
import { Piece } from '../types/Piece';
import { Position } from '../types/Position';
import { Players } from '../types/Players';
import { numberOfCells, sideSize } from '../constants/constants';
import { PieceType } from '../types/PieceType';
import { Move } from '../types/Move';
import { convertToMove } from '../functions/convertToMove';
import { cloneObject } from '../functions/cloneObject';

interface PruningResult {
    alpha: number;
    move?: Move;
}

interface PawnsMoves {
    attacks: long[];
    moves: long[];
    aisles: long[];
}

interface Node {
    position: AllPosition;
    score: number;
    attacksTo: long[];
    shah: long;
    isCastlingPossible: Players;
    takingOnAisle: number | undefined;
}

interface AllPosition {
    origin: Position;
    rotatedLeft90: long;
    rotatedLeft45: long;
    rotatedRight45: long;
}

interface IChessEngine {
    position: Position;
    getPossibleMoves: (cell: number, p: Piece, node?: Node) => long;
    getComputerMove: (color: 'white' | 'black') => Promise<Move>;
    makeMove: (move: Move, node?: Node) => Position;
    isShah: (index: number, color: 'white' | 'black') => boolean;
}

enum DirectionOfAttack {
    horizontal = 1,
    vertical,
    diagonalH1A8,
    diagonalA1H8,
}

enum RayOfAttack {
    plus7 = 7,
    plus1 = 1,
    plus9 = 9,
    plus8 = 8,
    minus8 = -8,
    minus9 = -9,
    minus1 = -1,
    minus7 = -7,
}

interface Rays {
    minus7: long[];
    minus8: long[];
    minus9: long[];
    minus1: long[];
    plus7: long[];
    plus8: long[];
    plus9: long[];
    plus1: long[];
}

enum PieceValue {
    pawn = 100,
    queen = 1050,
    rook = 550,
    bishop = 325,
    knight = 325,
    checkmate = 30000,
}

const enemy: Players = {
    white: 'black',
    black: 'white',
};

const maxSixBitValue = 0b111111;

const notA: long = new long(0xfefefefe, 0xfefefefe);
const notAB: long = new long(0xfcfcfcfc, 0xfcfcfcfc);
const notH: long = new long(0x7f7f7f7f, 0x7f7f7f7f);
const notGH: long = new long(0x3f3f3f3f, 0x3f3f3f3f);

class ChessEngine implements IChessEngine {
    public position: Position;

    private node: Node;
    private rays: Rays;

    private setMask: long[];
    private setMaskRotatedLeft90: long[];
    private setMaskRotatedLeft45: long[];
    private setMaskRotatedRight45: long[];

    private kingAttacks: long[];
    private knightsAttacks: long[];
    private pawnsMoves: Players;
    private horizontalAttacks: long[][];
    private verticalAttacks: long[][];
    private diagonalH1A8Attacks: long[][];
    private diagonalA1H8Attacks: long[][];

    private isCastlingPossibleNow: Players;
    private castlingRooksPosition: Players;

    constructor() {
        this.rays = {
            minus7: [],
            minus8: [],
            minus9: [],
            minus1: [],
            plus7: [],
            plus8: [],
            plus9: [],
            plus1: [],
        };

        this.setMask = [];
        this.setMaskRotatedLeft90 = [];
        this.setMaskRotatedLeft45 = [];
        this.setMaskRotatedRight45 = [];
        this.kingAttacks = [];
        this.knightsAttacks = [];
        this.horizontalAttacks = [];
        this.verticalAttacks = [];
        this.diagonalH1A8Attacks = [];
        this.diagonalA1H8Attacks = [];

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
                        (sideSize - 1 - Math.floor(i / sideSize)) -
                        sideSize * (i % sideSize)
                )
            );
        }

        let rowIncrement = 0;
        for (let i = 0; i < sideSize; i++) {
            let index = numberOfCells * i + rowIncrement;

            for (let j = 0; j < sideSize; j++) {
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
        for (let i = 0; i < sideSize; i++) {
            let index = sideSize * i + rowIncrement;

            for (let j = 0; j < sideSize; j++) {
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
            pawn: {
                white: this.setMask[8]
                    .or(this.setMask[9])
                    .or(this.setMask[10])
                    .or(this.setMask[11])
                    .or(this.setMask[12])
                    .or(this.setMask[13])
                    .or(this.setMask[14])
                    .or(this.setMask[15])
                    .toUnsigned(),
                black: this.setMask[48]
                    .or(this.setMask[49])
                    .or(this.setMask[50])
                    .or(this.setMask[51])
                    .or(this.setMask[52])
                    .or(this.setMask[53])
                    .or(this.setMask[54])
                    .or(this.setMask[55])
                    .toUnsigned(),
            },

            knight: {
                white: this.setMask[6].or(this.setMask[1]).toUnsigned(),
                black: this.setMask[62].or(this.setMask[57]).toUnsigned(),
            },

            rook: {
                white: this.setMask[7].or(this.setMask[0]).toUnsigned(),
                black: this.setMask[63].or(this.setMask[56]).toUnsigned(),
            },

            bishop: {
                white: this.setMask[5].or(this.setMask[2]).toUnsigned(),
                black: this.setMask[61].or(this.setMask[58]).toUnsigned(),
            },

            queen: {
                white: this.setMask[4].toUnsigned(),
                black: this.setMask[60].toUnsigned(),
            },

            king: {
                white: this.setMask[3].toUnsigned(),
                black: this.setMask[59].toUnsigned(),
            },
        };

        this.node = {
            position: {
                origin: this.position,
                rotatedLeft45: long.UZERO,
                rotatedRight45: long.UZERO,
                rotatedLeft90: long.UZERO,
            },
            score: 0,
            takingOnAisle: undefined,
            shah: long.UZERO,
            attacksTo: [],
            isCastlingPossible: {
                white: true,
                black: true,
            },
        };

        for (let i = 0; i < sideSize * 2; i++) {
            this.node.position.rotatedLeft90 = this.node.position.rotatedLeft90
                .or(this.setMaskRotatedLeft90[i])
                .or(
                    this.setMaskRotatedLeft90[
                        this.setMaskRotatedLeft90.length - 1 - i
                    ]
                );

            this.node.position.rotatedLeft45 = this.node.position.rotatedLeft45
                .or(this.setMaskRotatedLeft45[i])
                .or(
                    this.setMaskRotatedLeft45[
                        this.setMaskRotatedLeft45.length - 1 - i
                    ]
                );

            this.node.position.rotatedRight45 = this.node.position.rotatedRight45
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
                    .toUnsigned()
            );

            this.kingAttacks.push(
                piecePosition
                    .shiftLeft(8)
                    .or(piecePosition.shiftRightUnsigned(8))
                    .or(
                        notH.and(
                            piecePosition
                                .shiftRightUnsigned(9)
                                .or(piecePosition.shiftRightUnsigned(1))
                                .or(piecePosition.shiftLeft(7))
                        )
                    )
                    .or(
                        notA.and(
                            piecePosition
                                .shiftLeft(9)
                                .or(piecePosition.shiftLeft(1))
                                .or(piecePosition.shiftRightUnsigned(7))
                        )
                    )
                    .toUnsigned()
            );
        }

        this.isCastlingPossibleNow = {
            white: this.setMask[2].or(this.setMask[1]),
            black: this.setMask[57].or(this.setMask[58]),
        };

        this.castlingRooksPosition = {
            white: 0,
            black: 56,
        };

        for (let i = 0; i < sideSize; i++) {
            this.pawnsMoves.black.moves[i] = long.UZERO;
            this.pawnsMoves.white.moves[i] = long.UZERO;

            this.pawnsMoves.black.attacks[i] = long.UZERO;
            this.pawnsMoves.white.attacks[i] = long.UZERO;

            this.pawnsMoves.black.aisles[i] = long.UZERO;
            this.pawnsMoves.white.aisles[i] = long.UZERO;

            this.pawnsMoves.black.moves[numberOfCells - 1 - i] = long.UZERO;
            this.pawnsMoves.white.moves[numberOfCells - 1 - i] = long.UZERO;

            this.pawnsMoves.black.attacks[numberOfCells - 1 - i] = long.UZERO;
            this.pawnsMoves.white.attacks[numberOfCells - 1 - i] = long.UZERO;

            this.pawnsMoves.black.aisles[numberOfCells - 1 - i] = long.UZERO;
            this.pawnsMoves.white.aisles[numberOfCells - 1 - i] = long.UZERO;
        }

        for (let i = sideSize; i < numberOfCells - sideSize; i++) {
            const piecePosition = long.UONE.shiftLeft(numberOfCells - 1 - i);

            this.pawnsMoves.black.moves[i] = piecePosition.shiftLeft(sideSize);
            this.pawnsMoves.white.moves[i] = piecePosition.shiftRightUnsigned(
                sideSize
            );

            this.pawnsMoves.black.attacks[i] = piecePosition
                .shiftLeft(sideSize - 1)
                .and(notH)
                .or(piecePosition.shiftLeft(sideSize + 1).and(notA));

            this.pawnsMoves.white.attacks[i] = piecePosition
                .shiftRightUnsigned(sideSize - 1)
                .and(notA)
                .or(piecePosition.shiftRightUnsigned(sideSize + 1).and(notH));

            this.pawnsMoves.black.aisles[i] =
                i < numberOfCells - 2 * sideSize
                    ? long.UZERO
                    : piecePosition
                          .shiftLeft(sideSize)
                          .or(piecePosition.shiftLeft(2 * sideSize));

            this.pawnsMoves.white.aisles[i] =
                i > 2 * sideSize - 1
                    ? long.UZERO
                    : piecePosition
                          .shiftRightUnsigned(sideSize)
                          .or(piecePosition.shiftRightUnsigned(2 * sideSize));
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
                        if (index < sideSize - 1 - (i % sideSize)) {
                            pieceAfterPosition = index;
                        } else if (index > sideSize - 1 - (i % sideSize)) {
                            pieceBeforePosition = index;
                        }
                    }
                    placementInLine >>= 1;
                    index++;
                }

                lineOfAttaсk &= resetBit[i % sideSize];

                if (pieceAfterPosition) {
                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                }
                if (pieceBeforePosition) {
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];
                }

                let attack: long = long.UZERO;

                for (let k = 0; k < sideSize; k++) {
                    if (lineOfAttaсk % 2) {
                        attack = attack.or(
                            this.setMask[
                                Math.floor(i / sideSize) * sideSize +
                                    sideSize -
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
                        if (index < Math.floor(i / sideSize)) {
                            pieceAfterPosition = index;
                        } else if (index > Math.floor(i / sideSize)) {
                            pieceBeforePosition = index;
                        }
                    }
                    placementInLine >>= 1;
                    index++;
                }

                lineOfAttaсk &=
                    resetBit[sideSize - 1 - Math.floor(i / sideSize)];

                if (pieceAfterPosition) {
                    lineOfAttaсk &= resetBitsAfter[pieceAfterPosition - 1];
                }
                if (pieceBeforePosition) {
                    lineOfAttaсk &= resetBitsBefore[pieceBeforePosition - 1];
                }
                let attack: long = long.UZERO;

                for (let k = 0; k < sideSize; k++) {
                    if (lineOfAttaсk % 2) {
                        attack = attack.or(
                            this.setMask[k * sideSize + (i % sideSize)]
                        );
                    }

                    lineOfAttaсk >>= 1;
                }

                attacksFromPosition.push(attack);
            }
            this.verticalAttacks.push(attacksFromPosition);
        }

        for (let i = 0; i < sideSize; i++) {
            for (let j = 0; j < sideSize; j++) {
                const attacksFromPosition: long[] = [];
                for (let bits = 0; bits < maxSixBitValue + 1; bits++) {
                    let lineOfAttaсk: number = 0b11111111;

                    let pieceAfterPosition: number = 0;
                    let pieceBeforePosition: number = 0;

                    let placementInLine = bits;
                    let index: number = 1;

                    while (placementInLine && !pieceBeforePosition) {
                        if (placementInLine % 2) {
                            if (i + j < sideSize) {
                                if (index < i) {
                                    pieceAfterPosition = index;
                                } else if (index > i) {
                                    pieceBeforePosition = index;
                                }
                            } else {
                                if (index < sideSize - 1 - j) {
                                    pieceAfterPosition = index;
                                } else if (index > sideSize - 1 - j) {
                                    pieceBeforePosition = index;
                                }
                            }
                        }
                        placementInLine >>= 1;
                        index++;
                    }

                    if (i + j < sideSize) {
                        lineOfAttaсk &= resetBit[sideSize - 1 - i];
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

                    let attack = long.UZERO;

                    for (
                        let k = 0;
                        k < sideSize - Math.abs(sideSize - 1 - i - j);
                        k++
                    ) {
                        if (lineOfAttaсk % 2) {
                            if (i + j < sideSize) {
                                attack = attack.or(
                                    this.setMask[i + j + k * (sideSize - 1)]
                                );
                            } else {
                                attack = attack.or(
                                    this.setMask[
                                        (i + j - 6) * sideSize -
                                            1 +
                                            k * (sideSize - 1)
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

        for (let i = 0; i < sideSize; i++) {
            for (let j = 0; j < sideSize; j++) {
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
                                if (index < sideSize - 1 - j) {
                                    pieceAfterPosition = index;
                                } else if (index > sideSize - 1 - j) {
                                    pieceBeforePosition = index;
                                }
                            } else {
                                if (index < sideSize - 1 - i) {
                                    pieceAfterPosition = index;
                                } else if (index > sideSize - 1 - i) {
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

                    let attack = long.UZERO;

                    for (let k = 0; k < sideSize - Math.abs(i - j); k++) {
                        if (lineOfAttaсk % 2) {
                            if (j > i) {
                                attack = attack.or(
                                    this.setMask[
                                        (sideSize - 1 - (j - i)) * sideSize +
                                            sideSize -
                                            1 -
                                            k * (sideSize + 1)
                                    ]
                                );
                            } else {
                                attack = attack.or(
                                    this.setMask[
                                        numberOfCells -
                                            1 -
                                            (i - j) -
                                            k * (sideSize + 1)
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

        for (let i = 0; i < sideSize; i++) {
            for (let j = 0; j < sideSize; j++) {
                const piecePosition: number = i * sideSize + j;

                let minus1Attack: long = long.ZERO;
                for (let k = 0; k < j; k++) {
                    minus1Attack = minus1Attack.or(
                        this.setMask[piecePosition - k - 1]
                    );
                }
                this.rays.minus1.push(minus1Attack);

                let minus7Attack: long = long.ZERO;
                for (let k = 0; k < i && k < sideSize - 1 - j; k++) {
                    minus7Attack = minus7Attack.or(
                        this.setMask[piecePosition - (k + 1) * (sideSize - 1)]
                    );
                }
                this.rays.minus7.push(minus7Attack);

                let minus8Attack: long = long.ZERO;
                for (let k = 0; k < i; k++) {
                    minus8Attack = minus8Attack.or(
                        this.setMask[piecePosition - (k + 1) * sideSize]
                    );
                }
                this.rays.minus8.push(minus8Attack);

                let minus9Attack: long = long.ZERO;
                for (let k = 0; k < i && k < j; k++) {
                    minus9Attack = minus9Attack.or(
                        this.setMask[piecePosition - (k + 1) * (sideSize + 1)]
                    );
                }
                this.rays.minus9.push(minus9Attack);

                let plus1Attack: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - j; k++) {
                    plus1Attack = plus1Attack.or(
                        this.setMask[piecePosition + k + 1]
                    );
                }
                this.rays.plus1.push(plus1Attack);

                let plus7Attack: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - i && k < j; k++) {
                    plus7Attack = plus7Attack.or(
                        this.setMask[piecePosition + (k + 1) * (sideSize - 1)]
                    );
                }
                this.rays.plus7.push(plus7Attack);

                let plus8Attack: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - i; k++) {
                    plus8Attack = plus8Attack.or(
                        this.setMask[piecePosition + (k + 1) * sideSize]
                    );
                }
                this.rays.plus8.push(plus8Attack);

                let plus9Attack: long = long.ZERO;
                for (
                    let k = 0;
                    k < sideSize - 1 - i && k < sideSize - 1 - j;
                    k++
                ) {
                    plus9Attack = plus9Attack.or(
                        this.setMask[piecePosition + (k + 1) * (sideSize + 1)]
                    );
                }
                this.rays.plus9.push(plus9Attack);
            }
        }

        this.сalculateAttacksTo(this.node);
    }

    private getVerticalAttack(from: number, positionRotatedLeft90: long): long {
        const line = maxSixBitValue;
        const column = from % sideSize;

        const verticalLine: number = positionRotatedLeft90
            .shiftRightUnsigned((sideSize - 1 - column) * sideSize + 1)
            .and(line)
            .getLowBitsUnsigned();

        return this.verticalAttacks[from][verticalLine];
    }

    private getHorizontalAttack(from: number, position: Position): long {
        const line = maxSixBitValue;
        const row: number = Math.floor(from / sideSize);

        const horizontalLine: number = this.getPositionForAll(position)
            .shiftRightUnsigned((sideSize - 1 - row) * sideSize + 1)
            .and(line)
            .getLowBitsUnsigned();

        return this.horizontalAttacks[from][horizontalLine];
    }

    private getDiagonalA1H8Attack(
        from: number,
        positionRotatedLeft45: long
    ): long {
        const line = maxSixBitValue;
        const column = from % sideSize;
        const row: number = Math.floor(from / sideSize);

        let shift: number = 0;
        if (row + column > 6) {
            const number = 14 - (row + column);
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = 7 - (column + row);
            shift = 29 + ((16 - number + 1) / 2) * number;
        }

        const diagonalA1H8Line: number = positionRotatedLeft45
            .shiftRightUnsigned(shift)
            .and(line)
            .getLowBitsUnsigned();

        return this.diagonalA1H8Attacks[from][diagonalA1H8Line];
    }

    private getDiagonalH1A8Attacks(
        from: number,
        positionRotatedRight45: long
    ): long {
        const line = maxSixBitValue;
        const column = from % sideSize;
        const row: number = Math.floor(from / sideSize);

        let shift: number = 0;
        if (row >= column) {
            const number = 7 - row + column;
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = column - row;
            shift = 29 + ((16 - number + 1) / 2) * number;
        }

        const diagonalH1A8Line: number = positionRotatedRight45
            .shiftRightUnsigned(shift)
            .and(line)
            .getLowBitsUnsigned();

        return this.diagonalH1A8Attacks[from][diagonalH1A8Line];
    }

    public getPossibleMoves(cell: number, piece: Piece, node?: Node): long {
        node = node ?? this.node;

        switch (piece.type) {
            case PieceType.bishop:
                return this.getBishopAttacks(cell, piece.color, node);
            case PieceType.rook:
                return this.getRookAttacks(cell, piece.color, node);
            case PieceType.queen:
                return this.getQueenAttacks(cell, piece.color, node);
            case PieceType.king:
                return this.getKingAttacks(cell, piece.color, node);
            case PieceType.pawn:
                return this.getPawnAttacks(cell, piece.color, node);
            case PieceType.knight:
                return this.getKnightAttacks(cell, piece.color, node);
        }
    }

    private getPawnAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const myPosition = this.getPosition(node.position.origin, color);
        let enemyPosition = this.getPosition(
            node.position.origin,
            enemy[color]
        );
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

        if (node.takingOnAisle) {
            enemyPosition = enemyPosition.or(this.setMask[node.takingOnAisle]);
        }

        const pawnAttack = (this.pawnsMoves[color] as PawnsMoves).attacks[
            from
        ].and(enemyPosition);

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            node
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.horizontal:
                return long.ZERO;
            case DirectionOfAttack.vertical:
                return pawnMove;

            case DirectionOfAttack.diagonalH1A8:
                return pawnAttack.and(
                    this.setMask[from + sign * (sideSize - 1)].not()
                );

            case DirectionOfAttack.diagonalA1H8:
                return pawnAttack.and(
                    this.setMask[from + sign * (sideSize + 1)].not()
                );
        }

        if (!node.shah.isZero()) {
            return pawnMove.or(pawnAttack).and(node.shah);
        }

        return pawnMove.or(pawnAttack);
    }

    private getKnightAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        if (this.isLocked(from, color, notSelfPieces, node)) {
            return long.ZERO;
        }

        if (!node.shah.isZero()) {
            return this.knightsAttacks[from].and(node.shah);
        }

        return this.knightsAttacks[from].and(notSelfPieces);
    }

    private getRookAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const horizontalAttack = this.getHorizontalAttack(
            from,
            node.position.origin
        );
        const verticalAttack = this.getVerticalAttack(
            from,
            node.position.rotatedLeft90
        );

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
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

        if (!node.shah.isZero()) {
            return rookAttack.and(node.shah);
        }

        return rookAttack.and(notSelfPieces);
    }

    private getBishopAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const a1H8Attacks = this.getDiagonalA1H8Attack(
            from,
            node.position.rotatedLeft45
        );
        const h1A8Attack = this.getDiagonalH1A8Attacks(
            from,
            node.position.rotatedRight45
        );

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
            undefined,
            undefined,
            a1H8Attacks,
            h1A8Attack
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.diagonalA1H8:
                return a1H8Attacks.and(notSelfPieces);
            case DirectionOfAttack.diagonalH1A8:
                return h1A8Attack.and(notSelfPieces);
            case DirectionOfAttack.horizontal:
            case DirectionOfAttack.vertical:
                return long.ZERO;
        }

        const bishopAttack = a1H8Attacks.or(h1A8Attack);

        if (!node.shah.isZero()) {
            return bishopAttack.and(node.shah);
        }

        return bishopAttack.and(notSelfPieces);
    }

    private getQueenAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const horizontalAttack = this.getHorizontalAttack(
            from,
            node.position.origin
        );
        const verticalAttack = this.getVerticalAttack(
            from,
            node.position.rotatedLeft90
        );
        const a1H8Attack = this.getDiagonalA1H8Attack(
            from,
            node.position.rotatedLeft45
        );
        const h1A8Attack = this.getDiagonalH1A8Attacks(
            from,
            node.position.rotatedRight45
        );

        const directionOfAttack = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
            horizontalAttack,
            verticalAttack,
            a1H8Attack,
            h1A8Attack
        );

        switch (directionOfAttack) {
            case DirectionOfAttack.horizontal:
                return horizontalAttack.and(notSelfPieces);
            case DirectionOfAttack.vertical:
                return verticalAttack.and(notSelfPieces);
            case DirectionOfAttack.diagonalA1H8:
                return a1H8Attack.and(notSelfPieces);
            case DirectionOfAttack.diagonalH1A8:
                return h1A8Attack.and(notSelfPieces);
        }

        const queenAttack = horizontalAttack
            .or(verticalAttack)
            .or(a1H8Attack)
            .or(h1A8Attack);

        if (!node.shah.isZero()) {
            return queenAttack.and(node.shah);
        }

        return queenAttack.and(notSelfPieces);
    }

    private getKingAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        let kingAttacks = this.kingAttacks[from];

        const row = Math.floor(from / sideSize);
        const column = from % sideSize;

        const fromI = row < 1 ? 0 : row - 1;
        const fromJ = column < 1 ? 0 : column - 1;
        const toI = row > sideSize - 2 ? sideSize : row + 2;
        const toJ = column > sideSize - 2 ? sideSize : column + 2;

        for (let i = fromI; i < toI; i++) {
            for (let j = fromJ; j < toJ; j++) {
                if (i === row && j === column) continue;

                const index = i * sideSize + j;
                const attackingEnemies = node.attacksTo[index].and(
                    notSelfPieces
                );

                if (!attackingEnemies.isZero()) {
                    kingAttacks = kingAttacks.and(this.setMask[index].not());
                }
            }
        }

        if (node.isCastlingPossible[color]) {
            if (
                this.getPositionForAll(node.position.origin)
                    .and(this.isCastlingPossibleNow[color])
                    .isZero()
            ) {
                const from = color === 'white' ? 3 : 59;
                let isNowhereAttacks = true;

                for (let i = from; i > from - 3; i--) {
                    if (!node.attacksTo[i].and(notSelfPieces).isZero()) {
                        isNowhereAttacks = false;
                        break;
                    }
                }

                if (isNowhereAttacks) {
                    kingAttacks = kingAttacks.or(this.setMask[from - 2]);
                }
            }
        }

        return kingAttacks.and(notSelfPieces);
    }

    private isLocked(
        from: number,
        color: 'white' | 'black',
        notSelfPieces: long,
        node: Node,
        horizontalAttack?: long,
        verticalAttack?: long,
        a1H8Attacks?: long,
        h1A8Attack?: long
    ): DirectionOfAttack | null {
        const enemiesAttacking = node.attacksTo[from].and(notSelfPieces);

        if (!enemiesAttacking.isZero()) {
            const bishopsAttackingPiece = enemiesAttacking.and(
                node.position.origin.queen[
                    enemy[color] as 'white' | 'black'
                ].or(
                    node.position.origin.bishop[
                        enemy[color] as 'white' | 'black'
                    ]
                )
            );

            if (!bishopsAttackingPiece.isZero()) {
                let bishopAttackFromCurrent =
                    a1H8Attacks ??
                    this.getDiagonalA1H8Attack(
                        from,
                        node.position.rotatedLeft45
                    );

                if (
                    this.getOneCount(
                        bishopAttackFromCurrent.and(bishopsAttackingPiece)
                    ) === 1
                ) {
                    if (
                        !bishopAttackFromCurrent
                            .and(node.position.origin.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.diagonalA1H8;
                }

                bishopAttackFromCurrent =
                    h1A8Attack ??
                    this.getDiagonalH1A8Attacks(
                        from,
                        node.position.rotatedRight45
                    );

                if (
                    this.getOneCount(
                        bishopAttackFromCurrent.and(bishopsAttackingPiece)
                    ) === 1
                ) {
                    if (
                        !bishopAttackFromCurrent
                            .and(node.position.origin.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.diagonalH1A8;
                }
            }

            const rooksAttackingPiece = enemiesAttacking.and(
                node.position.origin.queen[
                    enemy[color] as 'white' | 'black'
                ].or(
                    node.position.origin.rook[enemy[color] as 'white' | 'black']
                )
            );

            if (!rooksAttackingPiece.isZero()) {
                let rookAttackFromCurrent =
                    horizontalAttack ??
                    this.getHorizontalAttack(from, node.position.origin);

                if (
                    this.getOneCount(
                        rookAttackFromCurrent.and(rooksAttackingPiece)
                    ) === 1
                ) {
                    if (
                        !rookAttackFromCurrent
                            .and(node.position.origin.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.horizontal;
                }

                rookAttackFromCurrent =
                    verticalAttack ??
                    this.getVerticalAttack(from, node.position.rotatedLeft90);

                if (
                    this.getOneCount(
                        rookAttackFromCurrent.and(rooksAttackingPiece)
                    ) === 1
                ) {
                    if (
                        !rookAttackFromCurrent
                            .and(node.position.origin.king[color])
                            .isZero()
                    )
                        return DirectionOfAttack.vertical;
                }
            }
        }

        return null;
    }

    public makeMove(move: Move, node?: Node): Position {
        node = node ?? this.node;
        const sign = move.piece.color === 'white' ? 1 : -1;

        node.score *= -1;

        if (move.takenPiece) {
            node.score +=
                PieceValue[
                    PieceType[move.takenPiece.type] as keyof typeof PieceValue
                ];
        }

        if (move.replacePiece) {
            node.score -=
                PieceValue[
                    PieceType[move.piece.type] as keyof typeof PieceValue
                ];

            node.score +=
                PieceValue[
                    PieceType[move.replacePiece.type] as keyof typeof PieceValue
                ];
        }

        //taking on aisle move
        if (
            move.to === node.takingOnAisle &&
            move.piece.type === PieceType.pawn
        ) {
            this.unsetPiece(move.piece, move.from, node.position);
            this.setPiece(move.piece, move.to, node.position);

            this.unsetPiece(
                { type: PieceType.pawn, color: enemy[move.piece.color] },
                move.to + sign * sideSize,
                node.position
            );
        } else {
            //taking move
            if (move.takenPiece) {
                this.unsetPiece(move.takenPiece, move.to, node.position);
            }

            this.unsetPiece(move.piece, move.from, node.position);

            if (move.replacePiece) {
                //replace of a pawn, for a queen, rook, bishop or knight
                this.setPiece(move.replacePiece, move.to, node.position);
            } else {
                //normal move;
                this.setPiece(move.piece, move.to, node.position);
            }
        }

        if (
            move.piece.type === PieceType.king ||
            move.from === this.castlingRooksPosition[move.piece.color]
        ) {
            node.isCastlingPossible[move.piece.color] = false;
        }

        //castling move for rook
        if (move.piece.type === PieceType.king && move.from - move.to === 2) {
            const castlingRook = {
                type: PieceType.rook,
                color: move.piece.color,
            };

            this.unsetPiece(
                castlingRook,
                this.castlingRooksPosition[castlingRook.color],
                node.position
            );
            this.setPiece(
                castlingRook,
                this.castlingRooksPosition[castlingRook.color] + 2,
                node.position
            );
        }

        node.takingOnAisle = undefined;

        if (
            move.piece.type === PieceType.pawn &&
            Math.abs(move.from - move.to) === 2 * sideSize
        ) {
            node.takingOnAisle = move.to - sign * sideSize;
        }

        this.сalculateAttacksTo(node);

        node.shah = long.UZERO;

        const color = move.piece.color;
        const kingPosition: long =
            node.position.origin.king[enemy[color] as 'white' | 'black'];
        const index = numberOfCells - kingPosition.getNumBitsAbs();

        const enemyPosition: long = this.getPosition(
            node.position.origin,
            color
        );
        const enemyAttacksToKing = node.attacksTo[index].and(enemyPosition);

        if (!enemyAttacksToKing.isZero()) {
            node.shah = this.сalculateShah(
                enemyAttacksToKing,
                node.position.origin,
                color,
                index
            );
        }

        return node.position.origin;
    }

    private setPiece(piece: Piece, pieceIndex: number, position: AllPosition) {
        position.origin[PieceType[piece.type] as keyof Position][
            piece.color
        ] = position.origin[PieceType[piece.type] as keyof Position][
            piece.color
        ].or(this.setMask[pieceIndex]);

        position.rotatedLeft45 = position.rotatedLeft45.or(
            this.setMaskRotatedLeft45[pieceIndex]
        );
        position.rotatedLeft90 = position.rotatedLeft90.or(
            this.setMaskRotatedLeft90[pieceIndex]
        );
        position.rotatedRight45 = position.rotatedRight45.or(
            this.setMaskRotatedRight45[pieceIndex]
        );
    }

    private unsetPiece(
        piece: Piece,
        pieceIndex: number,
        position: AllPosition
    ) {
        position.origin[PieceType[piece.type] as keyof Position][
            piece.color
        ] = position.origin[PieceType[piece.type] as keyof Position][
            piece.color
        ].and(this.setMask[pieceIndex].not());

        position.rotatedLeft45 = position.rotatedLeft45.and(
            this.setMaskRotatedLeft45[pieceIndex].not()
        );
        position.rotatedLeft90 = position.rotatedLeft90.and(
            this.setMaskRotatedLeft90[pieceIndex].not()
        );
        position.rotatedRight45 = position.rotatedRight45.and(
            this.setMaskRotatedRight45[pieceIndex].not()
        );
    }

    private сalculateShah(
        attacksToKing: long,
        position: Position,
        color: 'white' | 'black',
        kingIndex: number
    ): long {
        if (
            !position.pawn[color]
                .or(position.knight[color])
                .and(attacksToKing)
                .isZero()
        ) {
            return attacksToKing;
        }

        for (let key in this.rays) {
            const kingRay: long = this.rays[key as keyof Rays][kingIndex];

            if (!kingRay.and(attacksToKing).isZero()) {
                const attacksToKingIndex =
                    numberOfCells - attacksToKing.getNumBitsAbs();

                const counterRay: RayOfAttack = -RayOfAttack[
                    key as keyof typeof RayOfAttack
                ];

                return kingRay
                    .and(
                        this.rays[RayOfAttack[counterRay] as keyof Rays][
                            attacksToKingIndex
                        ]
                    )
                    .or(this.setMask[attacksToKingIndex]);
            }
        }

        return long.UZERO;
    }

    public async getComputerMove(color: 'white' | 'black'): Promise<Move> {
        const move: Move = this.makeAlphaBetaPruning(this.node, color, 1).move!;

        return move;
    }

    private makeAlphaBetaPruning(
        node: Node,
        color: 'white' | 'black',
        depth: number,
        beta?: number
    ): PruningResult {
        let result: PruningResult | undefined;
        const moves = this.getAllMoves(node, color);

        for (let i = 0; i < moves.length; i++) {
            const move = convertToMove(moves[i], color);
            let currentResult: PruningResult = {
                move: move,
                alpha: 0,
            };

            const nextNode = cloneObject(node) as Node;
            this.makeMove(move, nextNode);

            if (depth) {
                currentResult = this.makeAlphaBetaPruning(
                    nextNode,
                    enemy[color],
                    depth - 1,
                    result !== undefined ? -result.alpha : undefined
                );
            } else {
                currentResult.alpha =
                    nextNode.score +
                    this.getMovesCount(nextNode, color) -
                    this.getMovesCount(nextNode, enemy[color]);
            }

            //the move of this level, not the next level(after calling this.makeAlphaBetaPruning)
            currentResult.move = move;

            if (beta && currentResult.alpha > beta) {
                currentResult.alpha = -currentResult.alpha;
                return currentResult;
            }

            if (result === undefined || currentResult.alpha > result.alpha) {
                result = currentResult;
            }
        }

        if (result) {
            result.alpha = -result.alpha;
            return result;
        } else {
            //if move undefined pat or mat
            return { alpha: node.shah.isZero() ? 0 : PieceValue.checkmate };
        }
    }

    private getMovesCount(node: Node, color: 'white' | 'black'): number {
        let movesCount = 0;

        for (let key in PieceType) {
            const pieceType: PieceType = Number(key);
            if (isNaN(pieceType)) continue;

            let picesOfSomeType: long = node.position.origin[
                PieceType[pieceType] as keyof Position
            ][color] as long;

            while (!picesOfSomeType.isZero()) {
                const from = numberOfCells - picesOfSomeType.getNumBitsAbs();

                let moves: long = this.getPossibleMoves(
                    from,
                    {
                        type: pieceType,
                        color: color,
                    },
                    node
                );

                movesCount += this.getOneCount(moves);

                picesOfSomeType = picesOfSomeType.and(this.setMask[from].not());
            }
        }

        return movesCount;
    }

    private getOneCount(bitboard: long) {
        let count: number = 0;

        while (!bitboard.isZero()) {
            const bit: number = numberOfCells - bitboard.getNumBitsAbs();
            bitboard = bitboard.and(this.setMask[bit].not());

            count++;
        }

        return count;
    }

    private getAllMoves(node: Node, color: 'white' | 'black'): number[] {
        const allMoves: number[] = [];

        for (let key in PieceType) {
            const pieceType: PieceType = Number(key);
            if (isNaN(pieceType)) continue;

            let picesOfSomeType: long = node.position.origin[
                PieceType[pieceType] as keyof Position
            ][color] as long;

            while (!picesOfSomeType.isZero()) {
                const from = numberOfCells - picesOfSomeType.getNumBitsAbs();

                let moves: long = this.getPossibleMoves(
                    from,
                    {
                        type: pieceType,
                        color: color,
                    },
                    node
                );

                while (!moves.isZero()) {
                    const to = numberOfCells - moves.getNumBitsAbs();
                    let move = from + (to << 6) + (pieceType << 12);

                    for (let key in PieceType) {
                        const pieceType: PieceType = Number(key);
                        if (isNaN(pieceType)) continue;

                        let enemyPicesOfSomeType: long = node.position.origin[
                            PieceType[pieceType] as keyof Position
                        ][enemy[color] as 'white' | 'black'] as long;

                        if (
                            !enemyPicesOfSomeType.and(this.setMask[to]).isZero()
                        ) {
                            move += pieceType << 15;
                        }
                    }

                    if (
                        pieceType === PieceType.pawn &&
                        ((color === 'white' && to > 55) ||
                            (color === 'black' && to < 8))
                    ) {
                        allMoves.push(move + (PieceType.bishop << 18));
                        allMoves.push(move + (PieceType.queen << 18));
                        allMoves.push(move + (PieceType.knight << 18));
                        allMoves.push(move + (PieceType.rook << 18));
                    } else {
                        allMoves.push(move);
                    }

                    moves = moves.and(this.setMask[to].not());
                }

                picesOfSomeType = picesOfSomeType.and(this.setMask[from].not());
            }
        }

        return allMoves;
    }

    private сalculateAttacksTo(node: Node): void {
        for (let i = 0; i < numberOfCells; i++) {
            node.attacksTo[i] = this.kingAttacks[i]
                .and(
                    node.position.origin.king.black.or(
                        node.position.origin.king.white
                    )
                )
                .or(
                    this.knightsAttacks[i].and(
                        node.position.origin.knight.black.or(
                            node.position.origin.knight.white
                        )
                    )
                )
                .or(
                    this.pawnsMoves.white.attacks[i].and(
                        node.position.origin.pawn.black
                    )
                )
                .or(
                    this.pawnsMoves.black.attacks[i].and(
                        node.position.origin.pawn.white
                    )
                )
                .or(
                    this.getHorizontalAttack(i, node.position.origin)
                        .or(
                            this.getVerticalAttack(
                                i,
                                node.position.rotatedLeft90
                            )
                        )
                        .and(
                            node.position.origin.queen.black
                                .or(node.position.origin.queen.white)
                                .or(node.position.origin.rook.black)
                                .or(node.position.origin.rook.white)
                        )
                )
                .or(
                    this.getDiagonalA1H8Attack(i, node.position.rotatedLeft45)
                        .or(
                            this.getDiagonalH1A8Attacks(
                                i,
                                node.position.rotatedRight45
                            )
                        )
                        .and(
                            node.position.origin.queen.black
                                .or(node.position.origin.queen.white)
                                .or(node.position.origin.bishop.black)
                                .or(node.position.origin.bishop.white)
                        )
                );
        }
    }

    private getPosition(position: Position, color: 'white' | 'black'): long {
        return position.bishop[color]
            .or(position.king[color])
            .or(position.knight[color])
            .or(position.pawn[color])
            .or(position.queen[color])
            .or(position.rook[color]);
    }

    private getPositionForAll(position: Position): long {
        return this.getPosition(position, 'black').or(
            this.getPosition(position, 'white')
        );
    }

    public isShah(index: number, color: 'white' | 'black'): boolean {
        const attacksToKing = this.node.attacksTo[index];
        const notSelfPieces = this.getPosition(
            this.node.position.origin,
            color
        ).not();

        return !attacksToKing.and(notSelfPieces).isZero();
    }
}

export const chessEngine: ChessEngine = new ChessEngine();
