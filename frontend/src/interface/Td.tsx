/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const Td: FC = ({ children }) => {
    return (
        <td
            css={css`
                display: inline-block;
                width: 33.333%;
                padding: 3px 10px;
            `}
        >
            {children}
        </td>
    );
};
