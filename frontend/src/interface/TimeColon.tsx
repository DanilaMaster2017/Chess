/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const TimeColon: FC = () => {
    return (
        <span
            css={css`
                margin: 0 3px;
                color: #a6a6a6;
                font-size: 30px;
            `}
        >
            :
        </span>
    );
};
