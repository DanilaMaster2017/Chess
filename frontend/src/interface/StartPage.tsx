/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { FC, useEffect } from 'react';
import { LeftPanel } from './LeftPanel';
import { Page } from './Page';
import { TransparentWhiteKing } from './TransparentWhiteKing';
import { WaitingRoom } from './WaitingRoom';
import { GameSettings } from './GameSettings';
import { DialogContext } from './DialogContext';
import { useGameRequestContext } from './GameRequestContext';
import { WhitePanel } from './WhitePanel';
import { getGameRequest as getGameRequests } from '../requestsToServer/requests';
import ReactLoading from 'react-loading';

export const StartPage: FC = () => {
    const {
        setGameRequests,
        isLoading,
        setIsLoading,
    } = useGameRequestContext();

    useEffect(() => {
        const doGetGameRequests = async () => {
            setGameRequests(await getGameRequests());
            setIsLoading(false);
        };

        doGetGameRequests();
    }, []);

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
                    <WhitePanel>
                        {isLoading ? (
                            <ReactLoading
                                css={css`
                                    margin: auto;
                                `}
                                type={'spokes'}
                                height={'15%'}
                                width={'15%'}
                                color={'#777777'}
                            ></ReactLoading>
                        ) : (
                            <TransparentWhiteKing>
                                <WaitingRoom></WaitingRoom>
                            </TransparentWhiteKing>
                        )}
                    </WhitePanel>
                </div>
            </DialogContext>
        </Page>
    );
};
