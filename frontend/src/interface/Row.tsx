/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/react';
import { FC } from 'react';
import { Td } from './Td';
import white from '../images/wK.svg';
import black from '../images/bK.svg';
import random from '../images/bw.svg';
import { GameRequest } from '../types/GameRequest';

interface Props {
    onClick: () => void;
    gameRequest: GameRequest;
}

export const Row: FC<Props> = ({ gameRequest, onClick }) => {
    const imageSize = 24 + 'px';

    const defaultStyle = css`
        background-color: rgba(255, 255, 255, 0.6);
        &:hover {
            background-color: rgba(234, 167, 127, 0.9);
            color: white;
        }
    `;
    const activeStyle = css`
        background-color: rgba(162, 184, 137, 0.9);
    `;
    const canceledStyle = css`
        background-color: rgba(162, 184, 137, 0.6);
    `;

    function getStyle(
        status: 'default' | 'active' | 'canceled'
    ): SerializedStyles {
        switch (gameRequest.status) {
            case 'active':
                return activeStyle;
            case 'canceled':
                return canceledStyle;
            default:
                return defaultStyle;
        }
    }

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
        <tr
            onClick={onClick}
            css={css`
                ${getStyle(gameRequest.status)}
                border-bottom: 1px solid #d2d2d2;
                cursor: pointer;
            `}
        >
            <Td>
                <img
                    onDragStart={(e) => {
                        e.preventDefault();
                    }}
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
        </tr>
    );
};
