/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Th: FC = ({ children }) => {
    return (
        <th
            css={css`
                display: inline-block;
                width: 33.333%;
                padding: 15px 10px;
                text-align: left;
                font-weight: 300;
            `}
        >
            {children}
        </th>
    );
};
