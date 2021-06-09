/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useRef, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDialogContext } from './DialogContext';
import { CloseButton } from './CloseButton';
import { playComputer, playFriend, playMan } from '../constants/constants';
import { Title } from './Title';
import { TimeSettings } from './TimeSettings';
import { LevelSettings } from './LevelSettings';
import { ColorSettings } from './ColorSettings';
import { OkButton } from './OkButton';
import dialogPolyfill from 'dialog-polyfill';
import ReactLoading from 'react-loading';
import { useGameRequestContext } from './GameRequestContext';
import { useGameSettingsContext } from './GameSettingsContext';
import {
    createGameRequest,
    changeGameRequest,
} from '../requestsToServer/requests';

export const GameSettings: FC = () => {
    const gameSettingsDialog = useRef<HTMLDialogElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { gameRequests, setGameRequests } = useGameRequestContext();
    const { getTimeForGame, getTimeForMove, color } = useGameSettingsContext();
    const { gameMode, onClose } = useDialogContext();
    const history = useHistory();

    const getTitle = (gameMode: 'computer' | 'friend' | 'man' | 'close') => {
        switch (gameMode) {
            case 'man':
                return playMan;
            case 'friend':
                return playFriend;
            case 'computer':
                return playComputer;
        }
    };

    const onClick = async () => {
        if (gameMode === 'man') {
            if (gameRequests.length && gameRequests[0].status === 'canceled')
                return;

            setIsLoading(true);

            if (!gameRequests.length || gameRequests[0].status === 'default') {
                const gameRequest = await createGameRequest({
                    playerName: 'Аноним',
                    color: color,
                    timeForGame: getTimeForGame(),
                    timeForMove: getTimeForMove(),
                });

                setGameRequests([gameRequest, ...gameRequests]);
            } else if (gameRequests[0].status === 'active') {
                const gameRequest = await changeGameRequest({
                    gameId: gameRequests[0].gameId,
                    color: color,
                    timeForGame: getTimeForGame(),
                    timeForMove: getTimeForMove(),
                });

                setGameRequests([gameRequest, ...gameRequests.slice(1)]);
            }

            onClose();
            setIsLoading(false);
        } else {
            history.push('/computer-game');
        }
    };

    function onDialogClick(e: any) {
        if ((e.target as HTMLDialogElement) === gameSettingsDialog.current) {
            e.preventDefault();
            onClose();
        }
    }

    function onDialogKeydown(e: any) {
        if (e.code === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }

    useEffect(() => {
        let dialog: HTMLDialogElement;
        if (gameSettingsDialog.current !== null) {
            dialog = gameSettingsDialog.current;
            dialogPolyfill.registerDialog(dialog);

            dialog.addEventListener('click', onDialogClick);
            dialog.addEventListener('keydown', onDialogKeydown);

            return () => {
                dialog.removeEventListener('click', onDialogClick);
                dialog.removeEventListener('keydown', onDialogKeydown);
            };
        }
    }, []);

    useEffect(() => {
        let dialog: HTMLDialogElement;
        if (gameSettingsDialog.current !== null) {
            dialog = gameSettingsDialog.current;
            dialogPolyfill.registerDialog(dialog);

            if (gameMode !== 'close' && !dialog.open) {
                dialog.showModal();
            }

            if (gameMode === 'close' && dialog.open) {
                dialog.close();
            }
        }
    }, [gameMode]);

    return (
        <dialog
            ref={gameSettingsDialog}
            className="scrollableComponent"
            css={css`
                margin: auto;
                background-color: white;
                &::backdrop {
                    background-color: rgba(0, 0, 0, 0.6);
                }
                & + .backdrop {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                }
            `}
        >
            <CloseButton></CloseButton>
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 25px 0;
                `}
            >
                <Title>{getTitle(gameMode)}</Title>
                <TimeSettings></TimeSettings>
                {gameMode === 'computer' && <LevelSettings></LevelSettings>}
                <ColorSettings></ColorSettings>
                {isLoading ? (
                    <ReactLoading
                        color={'rgba(98, 153, 36, 0.9)'}
                        type={'spinningBubbles'}
                        width={'40px'}
                        height={'40px'}
                    ></ReactLoading>
                ) : (
                    <OkButton
                        disabled={
                            (gameMode === 'man' &&
                                getTimeForGame() === Infinity) ||
                            (!getTimeForMove() && !getTimeForGame())
                        }
                        onClick={onClick}
                    >
                        {gameMode === 'computer'
                            ? 'Начать игру!'
                            : 'Создать игру!'}
                    </OkButton>
                )}
            </div>
        </dialog>
    );
};
