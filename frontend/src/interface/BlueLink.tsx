/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { A } from './A';

interface Props {
    href: string;
}

export const BlueLink: FC<Props> = ({ children, href }) => {
    return (
        <A href={href}>
            <span
                css={css`
                    color: #1a7ad0;
                    &:hover {
                        color: #004f98;
                    }
                `}
            >
                {children}
            </span>
        </A>
    );
};
