/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, Fragment } from 'react';
import { TimeLabel } from './TimeLabel';
import { TimeColon } from './TimeColon';

interface Props {
    timeLeft: Date;
}
export const Timer: FC<Props> = ({ timeLeft }) => {
    return (
        <div
            css={css`
                display: flex;
                justify-content: center;
                align-items: center;
                border-top: 1px solid #d2d2d2;
            `}
        >
            {!!timeLeft.getHours() && (
                <Fragment>
                    <TimeLabel value={timeLeft.getHours()}></TimeLabel>
                    <TimeColon></TimeColon>
                </Fragment>
            )}

            <TimeLabel value={timeLeft.getMinutes()}></TimeLabel>
            <TimeColon></TimeColon>
            <TimeLabel value={timeLeft.getSeconds()}></TimeLabel>
        </div>
    );
};
