/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Th } from './Th';
import { Row } from './Row';
import { useGameRequestContext } from './GameRequestContext';
import { useHistory } from 'react-router-dom';
import {
    cancelingGameRequest,
    joinGameRequest,
} from '../requestsToServer/requests';

export const WaitingRoom: FC = () => {
    const {
        gameRequests,
        setGameRequests,
        setIsLoading,
    } = useGameRequestContext();

    const history = useHistory();

    async function joinToGame(gameId: string): Promise<void> {
        setIsLoading(true);
        const url = await joinGameRequest(gameId);
        history.push(url);
    }

    async function cancelingGame(gameId: string): Promise<void> {
        let gameRequest = gameRequests[0];
        gameRequest.status = 'canceled';
        setGameRequests([gameRequest, ...gameRequests.slice(1)]);
        await cancelingGameRequest(gameId);
        setGameRequests([...gameRequests.slice(1)]);
    }

    return (
        <table
            className="waitingRoom"
            css={css`
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                padding: 0 0 0 20px;
                border-collapse: collapse;
                background-color: transparent;
                color: #4d4d4d;
                font-size: 14px;
            `}
        >
            <thead>
                <tr>
                    <Th>Цвет</Th>
                    <Th>Игрок</Th>
                    <Th>Время</Th>
                </tr>
            </thead>
            <tbody
                className="scrollableComponent"
                css={css`
                    flex: 1 1 auto;
                    height: 250px;
                    overflow-y: auto;
                `}
            >
                {gameRequests.map((gameRequest, i) => {
                    return (
                        <Row
                            key={i}
                            onClick={() => {
                                if (gameRequest.status === 'default') {
                                    joinToGame(gameRequest.gameId);
                                } else if (gameRequest.status === 'active') {
                                    cancelingGame(gameRequest.gameId);
                                }
                            }}
                            gameRequest={gameRequest}
                        ></Row>
                    );
                })}
            </tbody>
        </table>
    );
};
