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

export const ComputerGamePage: FC = () => {
    const [position, setPosition] = useState<Position>(chessEngine.position);

    const { color, level, getTimeForGame } = useGameSettingsContext();
    const { setOnMove, setEnemyMove } = useBoardContext();

    const {
        playerTakenPieces,
        enemyTakenPieces,
        setEnemyTakenPieces,
        setPlayerTakenPieces,
        setPlayerInfo,
        setEnemyInfo,
        setPlayerTimeLeft,
        setEnemyTimeLeft,
        setWhoseMove,
        whoseMove,
        playerInfo,
        enemyInfo,
    } = useGameInfoContext();

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
                if (move.takenPiece) {
                    const map = new Map(playerTakenPieces);
                    const pieceImageSrc = getPieceImage(move.takenPiece);

                    if (map.has(pieceImageSrc)) {
                        map.set(pieceImageSrc, map.get(pieceImageSrc)! + 1);
                    } else {
                        map.set(pieceImageSrc, 1);
                    }

                    setPlayerTakenPieces(map);
                }

                const gameOverReason = chessEngine.checkGameOver(
                    enemyInfo.color
                );

                if (gameOverReason) {
                    console.log(gameOverReason);
                    setWhoseMove('gameOver');
                } else {
                    setWhoseMove('enemy');
                }
            };
        });
    }, [playerTakenPieces]);

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
                    if (move.takenPiece) {
                        const map = new Map(enemyTakenPieces);
                        const pieceImageSrc = getPieceImage(move.takenPiece);

                        if (map.has(pieceImageSrc)) {
                            map.set(pieceImageSrc, map.get(pieceImageSrc)! + 1);
                        } else {
                            map.set(pieceImageSrc, 1);
                        }

                        setEnemyTakenPieces(map);
                    }

                    const gameOverReason = chessEngine.checkGameOver(
                        playerInfo.color
                    );

                    if (gameOverReason) {
                        console.log(gameOverReason);
                        setWhoseMove('gameOver');
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
