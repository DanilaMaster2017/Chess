/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { FC } from 'react';
import { LeftPanel } from './LeftPanel';
import { Page } from './Page';
import { TransparentImgBackground } from './TransparentImgBackground';
import { WaitingRoom } from './WaitingRoom';
import { GameSettings } from './GameSettings';
import { DialogContext } from './DialogContext';

export const StartPage: FC = () => {
    return (
        <Page>
            <DialogContext>
                <GameSettings></GameSettings>
                <div
                    css={css`
                        display: flex;
                        height: 100%;
                    `}
                >
                    <LeftPanel></LeftPanel>
                    <TransparentImgBackground>
                        <WaitingRoom></WaitingRoom>
                    </TransparentImgBackground>
                </div>
            </DialogContext>
        </Page>
    );
};
