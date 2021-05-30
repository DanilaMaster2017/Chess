/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { ControlButton } from './ControlButton';
import { useInfoContext } from './InfoContext';

export const ControlPanel: FC = () => {
    const { isReverse, setIsReverse } = useInfoContext();
    const toggleReverse = () => {
        setIsReverse(!isReverse);
    };
    return (
        <div>
            <div
                css={css`
                    display: flex;
                    justify-content: space-between;
                    background-color: #f7f6f5;
                    border-radius: 5px 5px 0 0;
                `}
            >
                <ControlButton
                    onClick={toggleReverse}
                    faClass="fa fa-retweet"
                    title="Перевернуть доску"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-fast-backward"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-step-backward"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-step-forward"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-fast-forward"
                ></ControlButton>
            </div>
            <div
                css={css`
                    display: flex;
                    justify-content: center;
                    padding: 7px 0;
                    background-color: white;
                    border-radius: 0 0 5px 5px;
                `}
            >
                <ControlButton
                    disabled={true}
                    faClass="fa fa-reply"
                    title="Попросить соперника вернуть ход"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-star-half-o"
                    title="Предложить ничью"
                ></ControlButton>
                <ControlButton
                    disabled={true}
                    faClass="fa fa-flag"
                    title="Сдаться"
                ></ControlButton>
            </div>
        </div>
    );
};
