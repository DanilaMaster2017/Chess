/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    count: number;
}

export const CountLabel: FC<Props> = ({ count }) => {
    return (
        <div
            css={css`
                display: inline-block;
                position: absolute;
                right: -5px;
                bottom: 0;
                padding: 0 5px;
                border-radius: 50%;
                color: white;
                font-size: 13px;
                font-weight: bold;
                background-color: #f37021;
            `}
        >
            {count}
        </div>
    );
};
