/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Page: FC = ({ children }) => {
    return (
        <div
            css={css`
                flex: 1 1 auto;
                width: 100%;
            `}
        >
            {children}
        </div>
    );
};
