/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Title: FC = ({ children }) => {
    return (
        <div
            css={css`
                text-align: center;
                margin-bottom: 10px;
                font-size: 28px;
                color: #5e5e5e;
                font-weight: 300;
            `}
        >
            {children}
        </div>
    );
};
