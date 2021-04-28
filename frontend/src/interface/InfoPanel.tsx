/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

export const InfoPanel: FC = () => {
    return (
        <div
            css={css`
                flex: 0 0 auto;
                height: 300px;
                width: 300px;
                background-color: white;
            `}
        ></div>
    );
};
