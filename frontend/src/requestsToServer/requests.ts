import { wait } from '../functions/wait';
import {
    GameRequest,
    PostGameRequest,
    PutGameRequest,
} from '../types/GameRequest';

export const getGameRequest = async (): Promise<GameRequest[]> => {
    await wait(1000);

    return [
        {
            gameId: '1d2a9d9d-2509-4fce-8fe5-8544ec29c4ae',
            status: 'default',
            color: 'white',
            playerName: 'Danila',
            timeForGame: 180,
            timeForMove: 15,
        },
        {
            gameId: 'b7a1763b-89d4-4896-9f5b-255b809d9cba',
            status: 'default',
            color: 'black',
            playerName: 'Andrew',
            timeForGame: 120,
            timeForMove: 30,
        },
        {
            gameId: '58717945-23ef-4210-a248-7b076d26f1e6',
            status: 'default',
            color: 'random',
            playerName: 'Tom',
            timeForGame: 60,
            timeForMove: 60,
        },
        {
            gameId: '1d2a9d9d-2509-4fce-8fe5-8544ec29c4ae',
            status: 'default',
            color: 'white',
            playerName: 'Danila',
            timeForGame: 180,
            timeForMove: 15,
        },
        {
            gameId: 'b7a1763b-89d4-4896-9f5b-255b809d9cba',
            status: 'default',
            color: 'black',
            playerName: 'Andrew',
            timeForGame: 120,
            timeForMove: 30,
        },
        {
            gameId: '58717945-23ef-4210-a248-7b076d26f1e6',
            status: 'default',
            color: 'random',
            playerName: 'Tom',
            timeForGame: 60,
            timeForMove: 60,
        },
        {
            gameId: '1d2a9d9d-2509-4fce-8fe5-8544ec29c4ae',
            status: 'default',
            color: 'white',
            playerName: 'Danila',
            timeForGame: 180,
            timeForMove: 15,
        },
        {
            gameId: 'b7a1763b-89d4-4896-9f5b-255b809d9cba',
            status: 'default',
            color: 'black',
            playerName: 'Andrew',
            timeForGame: 120,
            timeForMove: 30,
        },
        {
            gameId: '58717945-23ef-4210-a248-7b076d26f1e6',
            status: 'default',
            color: 'random',
            playerName: 'Tom',
            timeForGame: 60,
            timeForMove: 60,
        },
    ];
};

export const createGameRequest = async (
    gameRequest: PostGameRequest
): Promise<GameRequest> => {
    await wait(1000);
    return {
        ...gameRequest,
        gameId: '7d8e6c24-4d28-47b9-baa2-33427c3c86e1',
        status: 'active',
    };
};

export const changeGameRequest = async (
    gameRequest: PutGameRequest
): Promise<GameRequest> => {
    await wait(1000);
    return {
        ...gameRequest,
        status: 'active',
        playerName: 'Аноним',
    };
};

export const cancelingGameRequest = async (gameId: string): Promise<void> => {
    await wait(1000);
};

export const joinGameRequest = async (gameId: string): Promise<string> => {
    await wait(1000);
    return '/computer-game';
};
