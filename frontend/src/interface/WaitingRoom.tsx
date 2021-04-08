/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Td } from './Td';
import { Th } from './Th';
import { Row } from './Row';
import { getGameRequest, GameRequest } from '../requestsToServer/requests';
import white from '../images/wK.svg';
import black from '../images/bK.svg';
import random from '../images/bw.svg';

let imageSize = 24 + 'px';

export const WaitingRoom: FC = () => {
    let data: GameRequest[] = getGameRequest();

    function getImage(name: string): string {
        switch (name) {
            case 'white':
                return white;
            case 'black':
                return black;
            case 'random':
                return random;
            default:
                return '';
        }
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
                font-family: 'Roboto', sans-serif;
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
                css={css`
                    flex: 1 1 auto;
                    height: 250px;
                    overflow-y: auto;
                    &::-webkit-scrollbar {
                        width: 8px;
                    }
                    &::-webkit-scrollbar-button {
                        display: none;
                    }
                    &::-webkit-scrollbar-thumb {
                        background-color: #d2d2d2;
                        &:hover {
                            background-color: #b3b3b3;
                        }
                    }
                `}
            >
                {data.map((gameRequest, i) => {
                    return (
                        <Row key={i}>
                            <Td>
                                <img
                                    css={css`
                                        width: ${imageSize};
                                        height: ${imageSize};
                                    `}
                                    src={getImage(gameRequest.color)}
                                    alt=""
                                />
                            </Td>
                            <Td>{gameRequest.playerName}</Td>
                            <Td>
                                {gameRequest.timeForGame +
                                    "'+" +
                                    gameRequest.timeForMove +
                                    "''"}
                            </Td>
                        </Row>
                    );
                })}
            </tbody>
        </table>
    );
};
