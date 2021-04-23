/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { useGameSettingsContext } from './GameSettingsContext';

interface Props {
    value: 'white' | 'black' | 'random';
    image: string;
    size: string;
    title: string;
}

export const ColorButton: FC<Props> = ({ value, image, size, title }) => {
    const { color, setColor } = useGameSettingsContext();
    const onClick = () => setColor(value);

    const activeStyle = css`
        background-color: #f6f6f6;
        box-shadow: 0px 0px 20px rgba(98, 153, 36, 1);
    `;
    const defaultStyle = css`
        background-color: #f0f0f0;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
        &:hover {
            background-color: #f6f6f6;
            box-shadow: 0px 0px 20px rgba(234, 167, 127, 1);
        }
    `;

    return (
        <img
            src={image}
            onClick={onClick}
            alt=""
            title={title}
            css={css`
                cursor: pointer;
                margin: 0 7px;
                width: ${size};
                height: ${size};
                border-radius: 5px;
                ${value === color ? activeStyle : defaultStyle}
            `}
        />
    );
};
