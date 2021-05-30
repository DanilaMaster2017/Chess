/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { useInfoContext } from './InfoContext';
import { UserInfo } from './UserInfo';
import { Timer } from './Timer';
import { TakenPieces } from './TakenPieces';

interface Props {
    person: 'player' | 'enemy';
}

export const GameInfo: FC<Props> = ({ person }) => {
    let personInfo;
    let takenPieces;
    let timeLeft;

    const {
        playerInfo,
        enemyInfo,
        playerTakenPieces,
        enemyTakenPieces,
        playerTimeLeft,
        enemyTimeLeft,
        whoseMove,
    } = useInfoContext();

    if (person === 'player') {
        personInfo = playerInfo;
        takenPieces = playerTakenPieces;
        timeLeft = playerTimeLeft;
    } else {
        personInfo = enemyInfo;
        takenPieces = enemyTakenPieces;
        timeLeft = enemyTimeLeft;
    }

    return (
        <div
            css={css`
                box-shadow: ${whoseMove === person
                    ? ' 0px 0px 30px rgba(98, 153, 36, 1)'
                    : 'none'};
                background-color: white;
                margin: 40px 0;
                border-radius: 5px;
            `}
        >
            <UserInfo {...personInfo}></UserInfo>
            {!!takenPieces.size && (
                <TakenPieces takenPieces={takenPieces}></TakenPieces>
            )}
            {timeLeft && <Timer timeLeft={timeLeft}></Timer>}
        </div>
    );
};
