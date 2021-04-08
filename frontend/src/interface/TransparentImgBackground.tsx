/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import whiteKing from '../images/chessPieces/wk.svg';

export const TransparentImgBackground: FC = ({ children }) => {
    return (
        <div
            css={css`
                margin: 20px 50px;
                flex: 1 1 auto;
                min-width: 450px;
                background-color: white;
                background-image: url(${whiteKing});
                background-repeat: no-repeat;
                background-size: contain;
                background-position: center;
            `}
        >
            <div
                css={css`
                    background-color: rgba(255, 255, 255, 0.5);
                    width: 100%;
                    height: 100%;
                `}
            >
                {children}
            </div>
        </div>
    );
};
