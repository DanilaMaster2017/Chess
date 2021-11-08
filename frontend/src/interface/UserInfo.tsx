/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import black from '../images/bK.svg';
import white from '../images/wK.svg';

interface Props {
    color: 'white' | 'black';
    name: string;
    eloLevel?: number;
    computerLevel?: number;
}

export const UserInfo: FC<Props> = ({
    color,
    name,
    eloLevel,
    computerLevel,
}) => {
    const imgSize = 22 + 'px';

    return (
        <div
            css={css`
                display: flex;
                align-items: center;
                padding: 9px 15px;
            `}
        >
            <img
                onDragStart={(e) => {
                    e.preventDefault();
                }}
                css={css`
                    width: ${imgSize};
                    height: ${imgSize};
                    margin: -6px 6px 0 0;
                `}
                src={color === 'white' ? white : black}
                alt=""
            />
            <span
                css={css`
                    font-size: 15px;
                    color: #4d4d4d;
                `}
            >
                {name + ' '}
                {computerLevel && 'уровня ' + computerLevel}
                {eloLevel && '(' + eloLevel + ')'}
            </span>
        </div>
    );
};
