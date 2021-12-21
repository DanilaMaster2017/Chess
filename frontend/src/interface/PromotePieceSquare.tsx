/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { getPieceImage } from '../functions/getPieceImage';
import { Piece } from '../types/Piece';
import { useBoardContext } from './BoardContext';

interface Props {
    piece: Piece;
}

export const PromotePieceSquare: FC<Props> = ({ piece }) => {
    const { onPromote, setFileWherePromotion } = useBoardContext();

    return (
        <div
            onClick={() => {
                onPromote(piece);
                setFileWherePromotion(undefined);
            }}
            css={css`
                height: 25%;
                background-color: #9e9e9e;
                border-radius: 50%;
                &:hover {
                    border-radius: 0;
                    background-color: #cd6426;
                }
            `}
        >
            <img
                src={getPieceImage(piece)}
                alt=""
                onDragStart={(e) => {
                    e.preventDefault();
                }}
                css={css`
                    width: 100%;
                    transition: transform 0.1s linear;
                    transform: scale(0.8, 0.8);
                    &:hover {
                        transform: scale(1, 1);
                    }
                `}
            ></img>
        </div>
    );
};
