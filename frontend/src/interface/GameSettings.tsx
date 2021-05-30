/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useRef, useEffect } from 'react';
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

export const GameSettings: FC = () => {
    const gameSettingsDialog = useRef<HTMLDialogElement>(null);
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

    const onClick = () => {
        history.push('/computer-game');
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
                <OkButton onClick={onClick}>
                    {gameMode === 'computer' ? 'Начать игру!' : 'Создать игру!'}
                </OkButton>
            </div>
        </dialog>
    );
};
