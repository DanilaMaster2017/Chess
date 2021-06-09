/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const WhitePanel: FC = ({ children }) => {
    return (
        <div
            css={css`
                display: flex;
                background-color: white;
                margin: 20px 50px;
                flex: 1 1 auto;
                min-width: 450px;
                border-radius: 5px 0 0 5px;
            `}
        >
            {children}
        </div>
    );
};
