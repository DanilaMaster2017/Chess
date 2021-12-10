/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { ControlPanel } from './ControlPanel';
import { useGameInfoContext } from './GameInfoContext';
import { GameInfo } from './GameInfo';

export const InfoBlock: FC = () => {
    const { isReverse } = useGameInfoContext();

    const flexDirection = isReverse ? 'column-reverse' : 'column';

    return (
        <div
            css={css`
                margin-right: 30px;
                flex: 0 0 auto;
                display: flex;
                flex-direction: ${flexDirection};
            `}
        >
            <GameInfo person="enemy"></GameInfo>
            <ControlPanel></ControlPanel>
            <GameInfo person="player"></GameInfo>
        </div>
    );
};
