/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Button } from './Button';

export const LeftPanel: FC = () => {
    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 15px;
                height: 100%;
                background-color: white;
            `}
        >
            <Button>создать игру</Button>
            <Button>сыграть с другом</Button>
            <Button>сыграть с компьютером</Button>
        </div>
    );
};
