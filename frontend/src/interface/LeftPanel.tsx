/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Button } from './Button';
import { useDialogContext } from './DialogContext';
import { playComputer, playFriend, playMan } from '../constants/constants';

export const LeftPanel: FC = () => {
    const { onPlayMan, onPlayFriend, onPlayComputer } = useDialogContext();

    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 15px;
                background-color: white;
            `}
        >
            <Button onClick={onPlayMan}>{playMan}</Button>
            <Button onClick={onPlayFriend}>{playFriend}</Button>
            <Button onClick={onPlayComputer}>{playComputer}</Button>
        </div>
    );
};
