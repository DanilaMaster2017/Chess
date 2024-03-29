/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { InfoBlock } from './InfoBlock';
import { Page } from './Page';
import { chessEngine } from '../сhessEngine/chessEngine';
import { useGameInfoContext } from './GameInfoContext';
import { useGameSettingsContext } from './GameSettingsContext';
import { Position } from '../types/Position';
import { Move } from '../types/Move';
import { afterAnimationTime, animationTime } from '../constants/constants';
import { getPieceImage } from '../functions/getPieceImage';
import { useBoardContext } from './BoardContext';
import { GameOverReason } from '../types/GameOverReason';
import { PieceType } from '../types/PieceType';

export const ComputerGamePage: FC = () => {
    const [position, setPosition] = useState<Position>(chessEngine.position);

    const { color, level, getTimeForGame } = useGameSettingsContext();
    const { setOnMove, setEnemyMove } = useBoardContext();

    const {
        playerCapturedPieces,
        enemyCapturedPieces,
        setEnemyCapturedPieces,
        setPlayerCapturedPieces,
        setPlayerInfo,
        setEnemyInfo,
        setPlayerTimeLeft,
        setEnemyTimeLeft,
        setWhoseMove,
        whoseMove,
        playerInfo,
        enemyInfo,
    } = useGameInfoContext();

    const setCapturedPices = (
        setState: (v: Map<string, number>) => void,
        color: 'white' | 'black'
    ): void => {
        setState(
            new Map([
                [
                    getPieceImage({
                        color: color,
                        type: PieceType.queen,
                    }),
                    0,
                ],
                [
                    getPieceImage({
                        color: color,
                        type: PieceType.rook,
                    }),
                    0,
                ],
                [
                    getPieceImage({
                        color: color,
                        type: PieceType.bishop,
                    }),
                    0,
                ],
                [
                    getPieceImage({
                        color: color,
                        type: PieceType.knight,
                    }),
                    0,
                ],
                [
                    getPieceImage({
                        color: color,
                        type: PieceType.pawn,
                    }),
                    0,
                ],
            ])
        );
    };

    useEffect(() => {
        let playerColor: 'white' | 'black';

        if (color === 'random') {
            playerColor = Math.random() < 0.5 ? 'white' : 'black';
        } else {
            playerColor = color;
        }

        const enemyColor: 'white' | 'black' =
            playerColor === 'white' ? 'black' : 'white';

        playerColor === 'white'
            ? setWhoseMove('player')
            : setWhoseMove('enemy');

        setPlayerInfo({
            color: playerColor,
            name: 'Аноним',
        });
        setEnemyInfo({
            color: enemyColor,
            name: 'Компьютер',
            computerLevel: level,
        });

        setCapturedPices(setPlayerCapturedPieces, enemyColor);
        setCapturedPices(setEnemyCapturedPieces, playerColor);

        if (getTimeForGame() !== Infinity) {
            const timeLeft = new Date(0, 0);

            timeLeft.setSeconds(60 * getTimeForGame());

            setPlayerTimeLeft(timeLeft);
            setEnemyTimeLeft(timeLeft);
        }
    }, []);

    useEffect(() => {
        setOnMove(() => {
            return async (move: Move) => {
                let newPosition: Position;
                newPosition = chessEngine.makeMove(move);

                setPosition(newPosition);
                if (move.capturedPiece) {
                    const map = new Map(playerCapturedPieces);
                    const pieceImageSrc = getPieceImage(move.capturedPiece);

                    map.set(pieceImageSrc, map.get(pieceImageSrc)! + 1);

                    setPlayerCapturedPieces(map);
                }

                const gameOverReason = chessEngine.checkGameOver(
                    enemyInfo.color
                );

                if (gameOverReason !== undefined) {
                    console.log(GameOverReason[gameOverReason]);
                    setWhoseMove('nobodys');
                } else {
                    setWhoseMove('enemy');
                }
            };
        });
    }, [playerCapturedPieces]);

    useEffect(() => {
        if (whoseMove === 'enemy') {
            const doGetComputerMove = async () => {
                const move: Move = await chessEngine.getComputerMove(
                    enemyInfo.color
                );
                setEnemyMove(move);

                setTimeout(() => {
                    const newPosition = chessEngine.makeMove(move);

                    setPosition(newPosition);
                    if (move.capturedPiece) {
                        const map = new Map(enemyCapturedPieces);
                        const pieceImageSrc = getPieceImage(move.capturedPiece);

                        map.set(pieceImageSrc, map.get(pieceImageSrc)! + 1);

                        setEnemyCapturedPieces(map);
                    }

                    const gameOverReason = chessEngine.checkGameOver(
                        playerInfo.color
                    );

                    if (gameOverReason !== undefined) {
                        console.log(GameOverReason[gameOverReason]);
                        setWhoseMove('nobodys');
                    } else {
                        setWhoseMove('player');
                    }
                }, animationTime + afterAnimationTime);
            };

            //it is necessary for the animation of the transfer of the move to be displayed before doGetComputerMove is executed
            setTimeout(doGetComputerMove, 1);
        }
    }, [whoseMove]);

    return (
        <Page>
            <div
                css={css`
                    display: flex;
                    align-items: center;
                    height: 100%;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        flex: 1 1 auto;
                        height: 100%;
                    `}
                >
                    <ChessBoard position={position}></ChessBoard>
                </div>
                <InfoBlock></InfoBlock>
            </div>
        </Page>
    );
};
