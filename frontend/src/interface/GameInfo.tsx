/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { useGameInfoContext } from './GameInfoContext';
import { UserInfo } from './UserInfo';
import { Timer } from './Timer';
import { CapturedPieces } from './CapturedPieces';

interface Props {
    person: 'player' | 'enemy';
}

export const GameInfo: FC<Props> = ({ person }) => {
    let personInfo;
    let capturedPieces;
    let timeLeft;

    const {
        playerInfo,
        enemyInfo,
        playerCapturedPieces,
        enemyCapturedPieces,
        playerTimeLeft,
        enemyTimeLeft,
        whoseMove,
    } = useGameInfoContext();

    if (person === 'player') {
        personInfo = playerInfo;
        capturedPieces = playerCapturedPieces;
        timeLeft = playerTimeLeft;
    } else {
        personInfo = enemyInfo;
        capturedPieces = enemyCapturedPieces;
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
            {!!capturedPieces.size && (
                <CapturedPieces
                    capturedPieces={capturedPieces}
                ></CapturedPieces>
            )}
            {timeLeft && <Timer timeLeft={timeLeft}></Timer>}
        </div>
    );
};
