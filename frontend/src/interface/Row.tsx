/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Row: FC = ({ children }) => {
    return (
        <tr
            css={css`
                border-bottom: 1px solid #d2d2d2;
                background-color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                &:hover {
                    background-color: rgba(234, 167, 127, 0.9);
                    color: white;
                }
            `}
        >
            {children}
        </tr>
    );
};
