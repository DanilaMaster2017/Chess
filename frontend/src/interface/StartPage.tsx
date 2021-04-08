/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { FC } from 'react';
import { LeftPanel } from './LeftPanel';
import { Page } from './Page';
import { TransparentImgBackground } from './TransparentImgBackground';
import { WaitingRoom } from './WaitingRoom';

export const StartPage: FC = () => {
    return (
        <Page>
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
        </Page>
    );
};
