/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    value: number;
}

export const TimeLabel: FC<Props> = ({ value }) => {
    return (
        <span
            css={css`
                color: #4d4d4d;
                font-size: 36px;
            `}
        >
            {value < 10 && '0'}
            {value.toString()}
        </span>
    );
};
