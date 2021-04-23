/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import whiteKing from '../images/chessPieces/wk.svg';

export const TransparentImgBackground: FC = ({ children }) => {
    const borderRadius = '5px';
    return (
        <div
            css={css`
                margin: 20px 50px;
                flex: 1 1 auto;
                min-width: 450px;
                border-radius: ${borderRadius} 0 0 ${borderRadius};
                background-color: white;
                background-image: url(${whiteKing});
                background-repeat: no-repeat;
                background-size: contain;
                background-position: center;
            `}
        >
            <div
                css={css`
                    border-radius: ${borderRadius} 0 0 ${borderRadius};
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
