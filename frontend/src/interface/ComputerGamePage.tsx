/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, useState } from 'react';
import { ChessBoard } from './ChessBoard';
import { InfoPanel } from './InfoPanel';
import { Page } from './Page';
import { getInitialPosition, Position } from '../сhessEngine/chessEngine';

export const ComputerGamePage: FC = () => {
    const [position, setPosition] = useState<Position>(getInitialPosition());
    return (
        <Page>
            <div
                css={css`
                    display: flex;
                    align-items: center;
                    height: 100%;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        flex: 1 1 auto;
                        height: 100%;
                    `}
                >
                    <ChessBoard
                        position={position}
                        gamerColor="black"
                    ></ChessBoard>
                </div>
                <InfoPanel></InfoPanel>
            </div>
        </Page>
    );
};
