/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { InfoBlock } from './InfoBlock';
import { Page } from './Page';
import { chessEngine } from '../сhessEngine/chessEngine';
import { useInfoContext } from './InfoContext';
import { useGameSettingsContext } from './GameSettingsContext';
import { Position } from '../types/Position';
import { Move } from '../types/Move';
import { convertToMove } from '../functions/convertToMove';

export const ComputerGamePage: FC = () => {
    const [position, setPosition] = useState<Position>(chessEngine.position);

    const { color, level, getTimeForGame } = useGameSettingsContext();
    const {
        setPlayerInfo,
        setEnemyInfo,
        setPlayerTimeLeft,
        setEnemyTimeLeft,
        setWhoseMove,
        whoseMove,
        setOnMove,
    } = useInfoContext();

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

        setOnMove(() => {
            return async (move: Move) => {
                let newPosition: Position;
                newPosition = chessEngine.makeMove(move);
                setPosition(newPosition);

                setWhoseMove('enemy');
            };
        });
    }, []);

    useEffect(() => {
        if (whoseMove === 'enemy') {
            const doGetComputerMove = async () => {
                const codeOfMove = await chessEngine.getComputerMove(position);
                const move: Move = convertToMove(codeOfMove);
                //const newPosition = chessEngine.makeMove(move);

                //setPosition(newPosition);
                setWhoseMove('player');
            };
            doGetComputerMove();
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
