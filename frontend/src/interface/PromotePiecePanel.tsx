/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { sideSize } from '../constants/constants';
import { PieceType } from '../types/PieceType';
import { useGameInfoContext } from './GameInfoContext';
import { PromotePieceSquare } from './PromotePieceSquare';

interface Props {
    file: number;
}

export const PromotePiecePanel: FC<Props> = ({ file }) => {
    const { playerInfo, isReverse } = useGameInfoContext();

    let left: number;
    if (
        (playerInfo.color === 'black' && !isReverse) ||
        (playerInfo.color === 'white' && isReverse)
    ) {
        left = file * 12.5;
    } else {
        left = (sideSize - 1 - file) * 12.5;
    }

    return (
        <div
            css={css`
                position: absolute;
                top: ${isReverse ? '50' : '0'}%;
                left: ${left}%;
                width: 12.5%;
                height: 50%;
                z-index: 3;
                display: flex;
                flex-direction: ${isReverse ? 'column-reverse' : 'column'};
            `}
        >
            <PromotePieceSquare
                piece={{ type: PieceType.queen, color: playerInfo.color }}
            ></PromotePieceSquare>
            <PromotePieceSquare
                piece={{ type: PieceType.knight, color: playerInfo.color }}
            ></PromotePieceSquare>
            <PromotePieceSquare
                piece={{ type: PieceType.rook, color: playerInfo.color }}
            ></PromotePieceSquare>
            <PromotePieceSquare
                piece={{ type: PieceType.bishop, color: playerInfo.color }}
            ></PromotePieceSquare>
        </div>
    );
};
