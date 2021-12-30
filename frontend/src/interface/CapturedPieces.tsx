/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, ReactElement } from 'react';
import { CountLabel } from './CountLabel';

interface Props {
    capturedPieces: Map<string, number>;
}

export const CapturedPieces: FC<Props> = ({ capturedPieces }) => {
    const imgSize = 26 + 'px';

    const generateCapturedPieces = () => {
        const pieceImages: ReactElement[] = [];

        capturedPieces.forEach((count, piece) => {
            if (count) {
                pieceImages.push(
                    <span
                        css={css`
                            position: relative;
                            margin-right: 8px;
                        `}
                        key={piece}
                    >
                        <img
                            css={css`
                                width: ${imgSize};
                                height: ${imgSize};
                            `}
                            src={piece}
                            alt=""
                        ></img>
                        {count > 1 && <CountLabel count={count}></CountLabel>}
                    </span>
                );
            }
        });

        return pieceImages;
    };

    return (
        <div
            css={css`
                padding: 3px 15px 31px;
                height: 32px;
                background-color: #f7f6f5;
                border-top: 1px solid #d2d2d2;
            `}
        >
            {generateCapturedPieces()}
        </div>
    );
};
