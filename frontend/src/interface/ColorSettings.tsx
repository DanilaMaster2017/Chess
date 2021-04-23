/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import random from '../images/bw.svg';
import white from '../images/wK.svg';
import black from '../images/bK.svg';
import { ColorButton } from './ColorButton';

export const ColorSettings: FC = () => {
    return (
        <div
            css={css`
                margin: 30px 0;
            `}
        >
            <ColorButton
                value={'white'}
                image={white}
                size={'64px'}
                title="Белые"
            ></ColorButton>
            <ColorButton
                value={'random'}
                image={random}
                size={'85px'}
                title="Случайный цвет"
            ></ColorButton>
            <ColorButton
                value={'black'}
                image={black}
                size={'64px'}
                title="Черные"
            ></ColorButton>
        </div>
    );
};
