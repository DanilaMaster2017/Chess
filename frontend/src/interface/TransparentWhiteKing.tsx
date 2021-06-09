/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import whiteKing from '../images/chessPieces/wk.svg';

export const TransparentWhiteKing: FC = ({ children }) => {
    const borderRadius = '5px';
    return (
        <div
            css={css`
                border-radius: ${borderRadius} 0 0 ${borderRadius};
                width: 100%;
                height: 100%;
                background: url(${whiteKing}) center/contain no-repeat;
            `}
        >
            <div
                css={css`
                    border-radius: ${borderRadius} 0 0 ${borderRadius};
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.5);
                `}
            >
                {children}
            </div>
        </div>
    );
};
