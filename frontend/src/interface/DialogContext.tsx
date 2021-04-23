import React, { FC, useState, useContext, createContext } from 'react';

interface IDialogContext {
    onPlayMan: () => void;
    onPlayFriend: () => void;
    onPlayComputer: () => void;
    onClose: () => void;
    gameMode: 'computer' | 'friend' | 'man' | 'close';
}

const DialogContextProvider = createContext<IDialogContext>({
    onPlayMan: () => {},
    onPlayFriend: () => {},
    onPlayComputer: () => {},
    onClose: () => {},
    gameMode: 'close',
});

export function useDialogContext() {
    return useContext(DialogContextProvider);
}

export const DialogContext: FC = ({ children }) => {
    const [gameMode, setGameMode] = useState<
        'computer' | 'friend' | 'man' | 'close'
    >('close');

    const onPlayMan = () => setGameMode('man');
    const onPlayFriend = () => setGameMode('friend');
    const onPlayComputer = () => setGameMode('computer');
    const onClose = () => setGameMode('close');

    return (
        <DialogContextProvider.Provider
            value={{
                gameMode,
                onPlayMan,
                onPlayFriend,
                onPlayComputer,
                onClose,
            }}
        >
            {children}
        </DialogContextProvider.Provider>
    );
};
