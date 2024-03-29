import long from 'long';
import { Piece } from '../types/Piece';
import { Position } from '../types/Position';
import { Players } from '../types/Players';
import { squaresCount, sideSize } from '../constants/constants';
import { PieceType } from '../types/PieceType';
import { Move } from '../types/Move';
import { convertToMove } from '../functions/convertToMove';
import { cloneObject } from '../functions/cloneObject';
import { GameOverReason } from '../types/GameOverReason';
import { WhichRook } from '../types/WhichRook';

interface PruningResult {
    alpha: number;
    move?: Move;
}

interface PawnsMoves {
    attacks: long[];
    moves: long[];
    passes: long[];
}

interface Node {
    position: AllPosition;
    score: number;
    attacksTo: long[];
    isDoubleCheck: boolean;
    checkRay: long;
    checkRayDirection: RayOfAttacks | undefined;
    isCastlingPossible: WhichRook;
    enPassant: number | undefined;
}

interface AllPosition {
    origin: Position;
    rotatedLeft90: long;
    rotatedLeft45: long;
    rotatedRight45: long;
}

interface IChessEngine {
    position: Position;
    getPossibleMoves: (square: number, piece: Piece, node?: Node) => long;
    getComputerMove: (color: 'white' | 'black') => Promise<Move>;
    makeMove: (move: Move, node?: Node) => Position;
    isCheck: (index: number, color: 'white' | 'black') => boolean;
    checkGameOver: (color: 'white' | 'black') => GameOverReason | undefined;
}

enum DirectionOfAttacks {
    horizontal = 1,
    vertical,
    diagonalH1A8,
    diagonalA1H8,
}

enum RayOfAttacks {
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

    private isCastlingPossibleNow: WhichRook;
    private rooksStartPosition: WhichRook;
    private kingsStartPosition: Players;

    private movesWithoutCapturesCount: number;
    private pastPositions: Players;

    constructor() {
        this.movesWithoutCapturesCount = 0;
        this.pastPositions = { white: [], black: [] };

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
            white: { attacks: [], moves: [], passes: [] },
            black: { attacks: [], moves: [], passes: [] },
        };

        for (let i = 0; i < squaresCount; i++) {
            this.setMask.push(long.ONE.shiftLeft(squaresCount - 1 - i));

            this.setMaskRotatedLeft90.push(
                long.ONE.shiftLeft(
                    squaresCount -
                        1 -
                        (sideSize - 1 - Math.floor(i / sideSize)) -
                        sideSize * (i % sideSize)
                )
            );
        }

        let rankIncrement = 0;
        for (let i = 0; i < sideSize; i++) {
            let index = squaresCount * i + rankIncrement;

            for (let j = 0; j < sideSize; j++) {
                let squareIncrement;

                if (i + j < 7) {
                    squareIncrement = i + j + 2;
                } else {
                    squareIncrement = 15 - (i + j);
                }

                this.setMaskRotatedLeft45.push(this.setMask[index]);
                index += squareIncrement;
            }

            rankIncrement -= squaresCount - 1 - i;
        }

        rankIncrement = 28;
        for (let i = 0; i < sideSize; i++) {
            let index = sideSize * i + rankIncrement;

            for (let j = 0; j < sideSize; j++) {
                let squareIncrement;

                if (i <= j) {
                    squareIncrement = 7 + i - j;
                } else {
                    squareIncrement = 8 - i + j;
                }

                this.setMaskRotatedRight45.push(this.setMask[index]);
                index -= squareIncrement;
            }

            rankIncrement -= i;
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
            enPassant: undefined,
            isDoubleCheck: false,
            checkRay: long.UZERO,
            checkRayDirection: undefined,
            attacksTo: [],
            isCastlingPossible: {
                near: {
                    white: true,
                    black: true,
                },
                distant: {
                    white: true,
                    black: true,
                },
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

        for (let i = 0; i < squaresCount; i++) {
            const piecePosition = long.ONE.shiftLeft(squaresCount - 1 - i);

            this.knightsAttacks.push(
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
            near: {
                white: this.setMask[2].or(this.setMask[1]),
                black: this.setMask[57].or(this.setMask[58]),
            },
            distant: {
                white: this.setMask[4].or(this.setMask[5]).or(this.setMask[6]),
                black: this.setMask[60]
                    .or(this.setMask[61])
                    .or(this.setMask[62]),
            },
        };

        this.rooksStartPosition = {
            near: {
                white: 0,
                black: 56,
            },
            distant: {
                white: 7,
                black: 63,
            },
        };

        this.kingsStartPosition = {
            white: 3,
            black: 59,
        };

        for (let i = 0; i < squaresCount; i++) {
            const piecePosition = long.UONE.shiftLeft(squaresCount - 1 - i);

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

            this.pawnsMoves.black.passes[i] =
                i < squaresCount - 2 * sideSize
                    ? long.UZERO
                    : piecePosition
                          .shiftLeft(sideSize)
                          .or(piecePosition.shiftLeft(2 * sideSize));

            this.pawnsMoves.white.passes[i] =
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

        for (let i = 0; i < squaresCount; i++) {
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

        for (let i = 0; i < squaresCount; i++) {
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
                                        squaresCount -
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

                let minus1Attacks: long = long.ZERO;
                for (let k = 0; k < j; k++) {
                    minus1Attacks = minus1Attacks.or(
                        this.setMask[piecePosition - k - 1]
                    );
                }
                this.rays.minus1.push(minus1Attacks);

                let minus7Attacks: long = long.ZERO;
                for (let k = 0; k < i && k < sideSize - 1 - j; k++) {
                    minus7Attacks = minus7Attacks.or(
                        this.setMask[piecePosition - (k + 1) * (sideSize - 1)]
                    );
                }
                this.rays.minus7.push(minus7Attacks);

                let minus8Attacks: long = long.ZERO;
                for (let k = 0; k < i; k++) {
                    minus8Attacks = minus8Attacks.or(
                        this.setMask[piecePosition - (k + 1) * sideSize]
                    );
                }
                this.rays.minus8.push(minus8Attacks);

                let minus9Attacks: long = long.ZERO;
                for (let k = 0; k < i && k < j; k++) {
                    minus9Attacks = minus9Attacks.or(
                        this.setMask[piecePosition - (k + 1) * (sideSize + 1)]
                    );
                }
                this.rays.minus9.push(minus9Attacks);

                let plus1Attacks: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - j; k++) {
                    plus1Attacks = plus1Attacks.or(
                        this.setMask[piecePosition + k + 1]
                    );
                }
                this.rays.plus1.push(plus1Attacks);

                let plus7Attacks: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - i && k < j; k++) {
                    plus7Attacks = plus7Attacks.or(
                        this.setMask[piecePosition + (k + 1) * (sideSize - 1)]
                    );
                }
                this.rays.plus7.push(plus7Attacks);

                let plus8Attacks: long = long.ZERO;
                for (let k = 0; k < sideSize - 1 - i; k++) {
                    plus8Attacks = plus8Attacks.or(
                        this.setMask[piecePosition + (k + 1) * sideSize]
                    );
                }
                this.rays.plus8.push(plus8Attacks);

                let plus9Attacks: long = long.ZERO;
                for (
                    let k = 0;
                    k < sideSize - 1 - i && k < sideSize - 1 - j;
                    k++
                ) {
                    plus9Attacks = plus9Attacks.or(
                        this.setMask[piecePosition + (k + 1) * (sideSize + 1)]
                    );
                }
                this.rays.plus9.push(plus9Attacks);
            }
        }

        this.сalculateAttacksTo(this.node);
    }

    private getVerticalAttacks(
        from: number,
        positionRotatedLeft90: long
    ): long {
        const line = maxSixBitValue;
        const file = from % sideSize;

        const verticalLine: number = positionRotatedLeft90
            .shiftRightUnsigned((sideSize - 1 - file) * sideSize + 1)
            .and(line)
            .getLowBitsUnsigned();

        return this.verticalAttacks[from][verticalLine];
    }

    private getHorizontalAttacks(from: number, position: Position): long {
        const line = maxSixBitValue;
        const rank: number = Math.floor(from / sideSize);

        const horizontalLine: number = this.getPositionForAll(position)
            .shiftRightUnsigned((sideSize - 1 - rank) * sideSize + 1)
            .and(line)
            .getLowBitsUnsigned();

        return this.horizontalAttacks[from][horizontalLine];
    }

    private getDiagonalA1H8Attacks(
        from: number,
        positionRotatedLeft45: long
    ): long {
        const line = maxSixBitValue;
        const file = from % sideSize;
        const rank: number = Math.floor(from / sideSize);

        let shift: number = 0;
        if (rank + file > 6) {
            const number = 14 - (rank + file);
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = 7 - (file + rank);
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
        const file = from % sideSize;
        const rank: number = Math.floor(from / sideSize);

        let shift: number = 0;
        if (rank >= file) {
            const number = 7 - rank + file;
            shift = ((2 + number - 1) / 2) * number + 1;
        } else {
            const number = file - rank;
            shift = 29 + ((16 - number + 1) / 2) * number;
        }

        const diagonalH1A8Line: number = positionRotatedRight45
            .shiftRightUnsigned(shift)
            .and(line)
            .getLowBitsUnsigned();

        return this.diagonalH1A8Attacks[from][diagonalH1A8Line];
    }

    public getPossibleMoves(square: number, piece: Piece, node?: Node): long {
        node = node ?? this.node;

        switch (piece.type) {
            case PieceType.bishop:
                return this.getBishopAttacks(square, piece.color, node);
            case PieceType.rook:
                return this.getRookAttacks(square, piece.color, node);
            case PieceType.queen:
                return this.getQueenAttacks(square, piece.color, node);
            case PieceType.king:
                return this.getKingAttacks(square, piece.color, node);
            case PieceType.pawn:
                return this.getPawnAttacks(square, piece.color, node);
            case PieceType.knight:
                return this.getKnightAttacks(square, piece.color, node);
        }
    }

    private getPawnAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        if (node.isDoubleCheck) return long.ZERO;

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

        const pawnPass = (this.pawnsMoves[color] as PawnsMoves).passes[from];
        if (!pawnPass.isZero()) {
            if (pawnPass.and(allPostion).isZero()) {
                pawnMove = pawnMove.or(pawnPass);
            }
        }

        if (node.enPassant) {
            enemyPosition = enemyPosition.or(this.setMask[node.enPassant]);
        }

        const pawnAttacks = (this.pawnsMoves[color] as PawnsMoves).attacks[
            from
        ].and(enemyPosition);

        const directionOfAttacks = this.isLocked(
            from,
            color,
            notSelfPieces,
            node
        );

        let pawnMovesResult: long;
        switch (directionOfAttacks) {
            case DirectionOfAttacks.horizontal:
                return long.ZERO;
            case DirectionOfAttacks.vertical:
                pawnMovesResult = pawnMove;
                break;
            case DirectionOfAttacks.diagonalH1A8:
                pawnMovesResult = pawnAttacks.and(
                    this.setMask[from + sign * (sideSize - 1)].not()
                );
                break;
            case DirectionOfAttacks.diagonalA1H8:
                pawnMovesResult = pawnAttacks.and(
                    this.setMask[from + sign * (sideSize + 1)].not()
                );
                break;
            default:
                pawnMovesResult = pawnMove.or(pawnAttacks);
                break;
        }

        if (!node.checkRay.isZero()) {
            return pawnMovesResult.and(node.checkRay);
        }

        return pawnMovesResult;
    }

    private getKnightAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        if (node.isDoubleCheck) return long.ZERO;

        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        if (this.isLocked(from, color, notSelfPieces, node)) {
            return long.ZERO;
        }

        if (!node.checkRay.isZero()) {
            return this.knightsAttacks[from].and(node.checkRay);
        }

        return this.knightsAttacks[from].and(notSelfPieces);
    }

    private getRookAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        if (node.isDoubleCheck) return long.ZERO;

        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const horizontalAttacks = this.getHorizontalAttacks(
            from,
            node.position.origin
        );
        const verticalAttacks = this.getVerticalAttacks(
            from,
            node.position.rotatedLeft90
        );

        const directionOfAttacks = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
            horizontalAttacks,
            verticalAttacks
        );

        let rookAttacks: long;
        switch (directionOfAttacks) {
            case DirectionOfAttacks.horizontal:
                rookAttacks = horizontalAttacks;
                break;
            case DirectionOfAttacks.vertical:
                rookAttacks = verticalAttacks;
                break;
            case DirectionOfAttacks.diagonalH1A8:
            case DirectionOfAttacks.diagonalA1H8:
                return long.ZERO;
            default:
                rookAttacks = horizontalAttacks.or(verticalAttacks);
                break;
        }

        if (!node.checkRay.isZero()) {
            return rookAttacks.and(node.checkRay);
        }

        return rookAttacks.and(notSelfPieces);
    }

    private getBishopAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        if (node.isDoubleCheck) return long.ZERO;

        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const a1H8Attacks = this.getDiagonalA1H8Attacks(
            from,
            node.position.rotatedLeft45
        );
        const h1A8Attacks = this.getDiagonalH1A8Attacks(
            from,
            node.position.rotatedRight45
        );

        const directionOfAttacks = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
            undefined,
            undefined,
            a1H8Attacks,
            h1A8Attacks
        );

        let bishopAttacks: long;
        switch (directionOfAttacks) {
            case DirectionOfAttacks.diagonalA1H8:
                bishopAttacks = a1H8Attacks;
                break;
            case DirectionOfAttacks.diagonalH1A8:
                bishopAttacks = h1A8Attacks;
                break;
            case DirectionOfAttacks.horizontal:
            case DirectionOfAttacks.vertical:
                return long.ZERO;
            default:
                bishopAttacks = a1H8Attacks.or(h1A8Attacks);
                break;
        }

        if (!node.checkRay.isZero()) {
            return bishopAttacks.and(node.checkRay);
        }

        return bishopAttacks.and(notSelfPieces);
    }

    private getQueenAttacks(
        from: number,
        color: 'white' | 'black',
        node: Node
    ): long {
        if (node.isDoubleCheck) return long.ZERO;

        const notSelfPieces: long = this.getPosition(
            node.position.origin,
            color
        ).not();

        const horizontalAttacks = this.getHorizontalAttacks(
            from,
            node.position.origin
        );
        const verticalAttacks = this.getVerticalAttacks(
            from,
            node.position.rotatedLeft90
        );
        const a1H8Attacks = this.getDiagonalA1H8Attacks(
            from,
            node.position.rotatedLeft45
        );
        const h1A8Attacks = this.getDiagonalH1A8Attacks(
            from,
            node.position.rotatedRight45
        );

        const directionOfAttacks = this.isLocked(
            from,
            color,
            notSelfPieces,
            node,
            horizontalAttacks,
            verticalAttacks,
            a1H8Attacks,
            h1A8Attacks
        );

        let queenAttacks: long;
        switch (directionOfAttacks) {
            case DirectionOfAttacks.horizontal:
                queenAttacks = horizontalAttacks;
                break;
            case DirectionOfAttacks.vertical:
                queenAttacks = verticalAttacks;
                break;
            case DirectionOfAttacks.diagonalA1H8:
                queenAttacks = a1H8Attacks;
                break;
            case DirectionOfAttacks.diagonalH1A8:
                queenAttacks = h1A8Attacks;
                break;
            default:
                queenAttacks = horizontalAttacks
                    .or(verticalAttacks)
                    .or(a1H8Attacks)
                    .or(h1A8Attacks);
                break;
        }

        if (!node.checkRay.isZero()) {
            return queenAttacks.and(node.checkRay);
        }

        return queenAttacks.and(notSelfPieces);
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

        const rank = Math.floor(from / sideSize);
        const file = from % sideSize;

        const fromI = rank < 1 ? 0 : rank - 1;
        const fromJ = file < 1 ? 0 : file - 1;
        const toI = rank > sideSize - 2 ? sideSize : rank + 2;
        const toJ = file > sideSize - 2 ? sideSize : file + 2;

        for (let i = fromI; i < toI; i++) {
            for (let j = fromJ; j < toJ; j++) {
                if (i === rank && j === file) continue;

                const index = i * sideSize + j;
                const attackingEnemies = node.attacksTo[index].and(
                    notSelfPieces
                );

                if (!attackingEnemies.isZero()) {
                    kingAttacks = kingAttacks.and(this.setMask[index].not());
                }
            }
        }

        if (node.checkRayDirection) {
            const behindKing = from - node.checkRayDirection;

            if (behindKing < 64 && behindKing > -1) {
                kingAttacks = kingAttacks.and(this.setMask[behindKing].not());
            }
        }

        const positionForAll: long = this.getPositionForAll(
            node.position.origin
        );

        if (
            node.isCastlingPossible.near[color] &&
            positionForAll.and(this.isCastlingPossibleNow.near[color]).isZero()
        ) {
            const from = this.kingsStartPosition[color];
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

        if (
            node.isCastlingPossible.distant[color] &&
            positionForAll
                .and(this.isCastlingPossibleNow.distant[color])
                .isZero()
        ) {
            const from = this.kingsStartPosition[color];
            let isNowhereAttacks = true;

            for (let i = from; i < from + 3; i++) {
                if (!node.attacksTo[i].and(notSelfPieces).isZero()) {
                    isNowhereAttacks = false;
                    break;
                }
            }

            if (isNowhereAttacks) {
                kingAttacks = kingAttacks.or(this.setMask[from + 2]);
            }
        }

        return kingAttacks.and(notSelfPieces);
    }

    private isLocked(
        from: number,
        color: 'white' | 'black',
        notSelfPieces: long,
        node: Node,
        horizontalAttacks?: long,
        verticalAttacks?: long,
        a1H8Attacks?: long,
        h1A8Attacks?: long
    ): DirectionOfAttacks | null {
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
                let bishopAttacksFromCurrent =
                    a1H8Attacks ??
                    this.getDiagonalA1H8Attacks(
                        from,
                        node.position.rotatedLeft45
                    );

                if (
                    !bishopAttacksFromCurrent
                        .and(bishopsAttackingPiece)
                        .isZero() &&
                    !bishopAttacksFromCurrent
                        .and(node.position.origin.king[color])
                        .isZero()
                ) {
                    return DirectionOfAttacks.diagonalA1H8;
                }

                bishopAttacksFromCurrent =
                    h1A8Attacks ??
                    this.getDiagonalH1A8Attacks(
                        from,
                        node.position.rotatedRight45
                    );

                if (
                    !bishopAttacksFromCurrent
                        .and(bishopsAttackingPiece)
                        .isZero() &&
                    !bishopAttacksFromCurrent
                        .and(node.position.origin.king[color])
                        .isZero()
                ) {
                    return DirectionOfAttacks.diagonalH1A8;
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
                let rookAttacksFromCurrent =
                    horizontalAttacks ??
                    this.getHorizontalAttacks(from, node.position.origin);

                if (
                    !rookAttacksFromCurrent.and(rooksAttackingPiece).isZero() &&
                    !rookAttacksFromCurrent
                        .and(node.position.origin.king[color])
                        .isZero()
                ) {
                    return DirectionOfAttacks.horizontal;
                }

                rookAttacksFromCurrent =
                    verticalAttacks ??
                    this.getVerticalAttacks(from, node.position.rotatedLeft90);

                if (
                    !rookAttacksFromCurrent.and(rooksAttackingPiece).isZero() &&
                    !rookAttacksFromCurrent
                        .and(node.position.origin.king[color])
                        .isZero()
                ) {
                    return DirectionOfAttacks.vertical;
                }
            }
        }

        return null;
    }

    public makeMove(move: Move, node?: Node): Position {
        const isGlobalNode = node ? false : true;
        node = node ?? this.node;

        const color = move.piece.color;
        const enemyColor: 'white' | 'black' = enemy[move.piece.color];
        const sign = move.piece.color === 'white' ? 1 : -1;

        node.score *= -1;

        if (move.capturedPiece) {
            node.score +=
                PieceValue[
                    PieceType[
                        move.capturedPiece.type
                    ] as keyof typeof PieceValue
                ];
        }

        if (move.promotedPiece) {
            node.score -=
                PieceValue[
                    PieceType[move.piece.type] as keyof typeof PieceValue
                ];

            node.score +=
                PieceValue[
                    PieceType[
                        move.promotedPiece.type
                    ] as keyof typeof PieceValue
                ];
        }

        //taking on aisle move
        if (move.to === node.enPassant && move.piece.type === PieceType.pawn) {
            this.unsetPiece(move.piece, move.from, node.position);
            this.setPiece(move.piece, move.to, node.position);

            this.unsetPiece(
                { type: PieceType.pawn, color: enemyColor },
                move.to - sign * sideSize,
                node.position
            );
        } else {
            //taking move
            if (move.capturedPiece) {
                this.unsetPiece(move.capturedPiece, move.to, node.position);
            }

            this.unsetPiece(move.piece, move.from, node.position);

            if (move.promotedPiece) {
                //replace of a pawn, for a queen, rook, bishop or knight
                this.setPiece(move.promotedPiece, move.to, node.position);
            } else {
                //normal move;
                this.setPiece(move.piece, move.to, node.position);
            }
        }

        if (move.piece.type === PieceType.king) {
            node.isCastlingPossible.near[color] = false;
            node.isCastlingPossible.distant[color] = false;
        }

        if (move.from === this.rooksStartPosition.near[color]) {
            node.isCastlingPossible.near[color] = false;
        }

        if (move.from === this.rooksStartPosition.distant[color]) {
            node.isCastlingPossible.distant[color] = false;
        }

        if (move.to === this.rooksStartPosition.near[enemyColor]) {
            node.isCastlingPossible.near[enemyColor] = false;
        }

        if (move.to === this.rooksStartPosition.distant[enemyColor]) {
            node.isCastlingPossible.distant[enemyColor] = false;
        }

        //castling move for rook
        if (move.piece.type === PieceType.king) {
            if (move.from - move.to === 2) {
                const rook = {
                    type: PieceType.rook,
                    color,
                };

                this.unsetPiece(
                    rook,
                    this.rooksStartPosition.near[rook.color],
                    node.position
                );
                this.setPiece(
                    rook,
                    this.rooksStartPosition.near[rook.color] + 2,
                    node.position
                );
            } else if (move.to - move.from === 2) {
                const rook = {
                    type: PieceType.rook,
                    color,
                };

                this.unsetPiece(
                    rook,
                    this.rooksStartPosition.distant[rook.color],
                    node.position
                );
                this.setPiece(
                    rook,
                    this.rooksStartPosition.distant[rook.color] - 3,
                    node.position
                );
            }
        }

        node.enPassant = undefined;

        if (
            move.piece.type === PieceType.pawn &&
            Math.abs(move.from - move.to) === 2 * sideSize
        ) {
            node.enPassant = move.to - sign * sideSize;
        }

        if (isGlobalNode) {
            if (move.capturedPiece || move.piece.type === PieceType.pawn) {
                this.movesWithoutCapturesCount = 0;
            } else {
                this.movesWithoutCapturesCount++;
            }

            //for threefold repetition rule
            if (
                move.capturedPiece ||
                move.piece.type === PieceType.pawn ||
                (move.piece.type === PieceType.king &&
                    Math.abs(move.from - move.to) === 2)
            ) {
                this.pastPositions = { white: [], black: [] };
            }

            this.pastPositions[enemyColor].push(
                cloneObject(node.position.origin) as Position
            );

            if (node.enPassant !== undefined) {
                const possibleEnPassant = (this.pawnsMoves[
                    color
                ] as PawnsMoves).attacks[node.enPassant].and(
                    node.position.origin.pawn[enemyColor]
                );

                if (!possibleEnPassant.isZero()) {
                    this.pastPositions = { white: [], black: [] };
                }
            }
        }

        this.сalculateAttacksTo(node);

        node.isDoubleCheck = false;
        node.checkRay = long.UZERO;
        node.checkRayDirection = undefined;

        const kingPosition: long = node.position.origin.king[enemyColor];
        const kingIndex = squaresCount - kingPosition.getNumBitsAbs();

        const enemyPosition: long = this.getPosition(
            node.position.origin,
            color
        );
        const enemyAttacksToKing = node.attacksTo[kingIndex].and(enemyPosition);

        if (!enemyAttacksToKing.isZero()) {
            const enemyIndex =
                squaresCount - enemyAttacksToKing.getNumBitsAbs();

            node.isDoubleCheck = !enemyAttacksToKing
                .and(this.setMask[enemyIndex].not())
                .isZero();

            if (!node.isDoubleCheck) {
                this.сalculateCheckRay(
                    enemyAttacksToKing,
                    node,
                    color,
                    kingIndex
                );
            }
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

    private сalculateCheckRay(
        attacksToKing: long,
        node: Node,
        color: 'white' | 'black',
        kingIndex: number
    ): void {
        if (
            !node.position.origin.pawn[color]
                .or(node.position.origin.knight[color])
                .and(attacksToKing)
                .isZero()
        ) {
            node.checkRay = attacksToKing;
            return;
        }

        for (let key in this.rays) {
            const kingRay: long = this.rays[key as keyof Rays][kingIndex];

            if (!kingRay.and(attacksToKing).isZero()) {
                const attacksToKingIndex =
                    squaresCount - attacksToKing.getNumBitsAbs();

                const counterRay: RayOfAttacks = -RayOfAttacks[
                    key as keyof typeof RayOfAttacks
                ];

                node.checkRayDirection =
                    RayOfAttacks[key as keyof typeof RayOfAttacks];

                node.checkRay = kingRay
                    .and(
                        this.rays[RayOfAttacks[counterRay] as keyof Rays][
                            attacksToKingIndex
                        ]
                    )
                    .or(this.setMask[attacksToKingIndex]);

                return;
            }
        }
    }

    public async getComputerMove(color: 'white' | 'black'): Promise<Move> {
        return this.makeAlphaBetaPruning(this.node, color, 1, 2).move!;
    }

    private makeAlphaBetaPruning(
        node: Node,
        color: 'white' | 'black',
        depth: number,
        captureDepth: number,
        beta?: number
    ): PruningResult {
        if (depth < -captureDepth) {
            return { alpha: Number.POSITIVE_INFINITY };
        }

        let result: PruningResult | undefined;
        const moves = this.getAllMoves(node, color, depth < 0);

        if (moves.length === 0) {
            if (depth < 0) {
                return {
                    alpha: Number.POSITIVE_INFINITY,
                };
            } else {
                //if pat or mat
                return {
                    alpha: node.checkRay.isZero() ? 0 : PieceValue.checkmate,
                };
            }
        }

        for (let i = 0; i < moves.length; i++) {
            const move = convertToMove(moves[i], color);
            let currentResult: PruningResult = {
                alpha: 0,
            };

            const nextNode = cloneObject(node) as Node;
            this.makeMove(move, nextNode);

            currentResult = this.makeAlphaBetaPruning(
                nextNode,
                enemy[color],
                depth - 1,
                captureDepth,
                result !== undefined ? -result.alpha : undefined
            );

            if (depth < 1) {
                let alpha: number;

                const movesCount: number = this.getMovesCount(
                    nextNode,
                    enemy[color]
                );

                if (movesCount) {
                    alpha =
                        nextNode.score -
                        movesCount +
                        this.getMovesCount(nextNode, color);
                } else {
                    //if pat or mat
                    alpha = nextNode.checkRay.isZero()
                        ? 0
                        : PieceValue.checkmate;
                }

                if (alpha < currentResult.alpha) {
                    currentResult.alpha = alpha;
                }
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

        result!.alpha = -result!.alpha;
        return result!;
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
                const from = squaresCount - picesOfSomeType.getNumBitsAbs();

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
            const bit: number = squaresCount - bitboard.getNumBitsAbs();
            bitboard = bitboard.and(this.setMask[bit].not());

            count++;
        }

        return count;
    }

    private getAllMoves(
        node: Node,
        color: 'white' | 'black',
        isOnlyCapture: boolean
    ): number[] {
        let allMoves: number[] = [];

        for (let key in node.position.origin) {
            const piece: PieceType = PieceType[key as keyof typeof PieceType];

            let picesOfSomeType: long = node.position.origin[
                key as keyof Position
            ][color] as long;

            while (!picesOfSomeType.isZero()) {
                const from = squaresCount - picesOfSomeType.getNumBitsAbs();

                let moves: long = this.getPossibleMoves(
                    from,
                    {
                        type: piece,
                        color: color,
                    },
                    node
                );

                for (let key in node.position.origin) {
                    let capturedPicesOfSomeType = moves.and(
                        node.position.origin[key as keyof Position][
                            enemy[color] as 'white' | 'black'
                        ] as long
                    );

                    moves = moves.and(capturedPicesOfSomeType.not());

                    allMoves = allMoves.concat(
                        this.getMovesFromBitboard(
                            capturedPicesOfSomeType,
                            from,
                            color,
                            piece,
                            PieceType[key as keyof typeof PieceType]
                        )
                    );
                }

                if (!isOnlyCapture) {
                    allMoves = allMoves.concat(
                        this.getMovesFromBitboard(moves, from, color, piece)
                    );
                }

                picesOfSomeType = picesOfSomeType.and(this.setMask[from].not());
            }
        }

        return allMoves;
    }

    private getMovesFromBitboard(
        bitboard: long,
        from: number,
        color: 'white' | 'black',
        piece: PieceType,
        capturedPiece?: PieceType
    ): number[] {
        const moves: number[] = [];

        while (!bitboard.isZero()) {
            const to = squaresCount - bitboard.getNumBitsAbs();
            let move = from + (to << 6) + (piece << 12);

            if (capturedPiece) {
                move += capturedPiece << 15;
            }

            if (
                piece === PieceType.pawn &&
                ((color === 'white' && to > 55) ||
                    (color === 'black' && to < 8))
            ) {
                moves.push(move + (PieceType.bishop << 18));
                moves.push(move + (PieceType.queen << 18));
                moves.push(move + (PieceType.knight << 18));
                moves.push(move + (PieceType.rook << 18));
            } else {
                moves.push(move);
            }

            bitboard = bitboard.and(this.setMask[to].not());
        }

        return moves;
    }

    private сalculateAttacksTo(node: Node): void {
        for (let i = 0; i < squaresCount; i++) {
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
                    this.getHorizontalAttacks(i, node.position.origin)
                        .or(
                            this.getVerticalAttacks(
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
                    this.getDiagonalA1H8Attacks(i, node.position.rotatedLeft45)
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

    public isCheck(index: number, color: 'white' | 'black'): boolean {
        const attacksToKing = this.node.attacksTo[index];
        const notSelfPieces = this.getPosition(
            this.node.position.origin,
            color
        ).not();

        return !attacksToKing.and(notSelfPieces).isZero();
    }

    public checkGameOver(color: 'white' | 'black'): GameOverReason | undefined {
        const movesCount: number = this.getAllMoves(this.node, color, false)
            .length;

        if (!this.node.checkRay.isZero() && movesCount === 0) {
            return GameOverReason.checkmate;
        }

        if (movesCount === 0) {
            return GameOverReason.stalemate;
        }

        if (this.movesWithoutCapturesCount === 100) {
            return GameOverReason.fiftyMoveRule;
        }

        const position: Position = this.node.position.origin;

        if (
            position.queen.white.isZero() &&
            position.queen.black.isZero() &&
            position.pawn.white.isZero() &&
            position.pawn.black.isZero() &&
            position.rook.white.isZero() &&
            position.rook.black.isZero() &&
            this.getOneCount(position.knight.white) < 2 &&
            this.getOneCount(position.knight.black) < 2
        ) {
            if (
                position.bishop.black.isZero() &&
                position.bishop.white.isZero()
            ) {
                return GameOverReason.deadPosition;
            } else if (
                position.knight.black.isZero() &&
                position.knight.white.isZero() &&
                this.isBishopsOfSameColor(position.bishop.white) &&
                this.isBishopsOfSameColor(position.bishop.black)
            ) {
                return GameOverReason.deadPosition;
            }
        }

        const pastPositions: Position[] = this.pastPositions[color].slice(0);

        while (pastPositions.length > 2) {
            let isReapeat: boolean = false;
            const position: Position = pastPositions.shift()!;

            for (let i = 0; i < pastPositions.length; i++) {
                if (this.isPositionsEquals(position, pastPositions[i])) {
                    if (isReapeat) {
                        return GameOverReason.threeFoldRepetitionRule;
                    } else {
                        isReapeat = true;
                        pastPositions.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        return;
    }

    //Bishops Of Same Color - однопольные
    private isBishopsOfSameColor(bitboard: long): boolean {
        let bishopSquare: number = squaresCount - bitboard.getNumBitsAbs();
        bitboard = bitboard.and(this.setMask[bishopSquare].not());

        let bishopX: number = bishopSquare % sideSize;
        let bishopY: number = Math.floor(bishopSquare / sideSize);

        const bishopColor: number = (bishopX + bishopY) % 2;

        while (!bitboard.isZero()) {
            bishopSquare = squaresCount - bitboard.getNumBitsAbs();
            bitboard = bitboard.and(this.setMask[bishopSquare].not());

            bishopX = bishopSquare % sideSize;
            bishopY = Math.floor(bishopSquare / sideSize);

            if ((bishopX + bishopY) % 2 !== bishopColor) {
                return false;
            }
        }

        return true;
    }

    private isPositionsEquals(
        position1: Position,
        position2: Position
    ): boolean {
        for (let key in position1) {
            if (
                (position1[key as keyof Position]['white'] as long).notEquals(
                    position2[key as keyof Position]['white']
                )
            )
                return false;

            if (
                (position1[key as keyof Position]['black'] as long).notEquals(
                    position2[key as keyof Position]['black']
                )
            )
                return false;
        }
        return true;
    }
}

export const chessEngine: ChessEngine = new ChessEngine();
