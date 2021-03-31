/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';

interface Props {
    href: string;
}

export const A: FC<Props> = ({ children, href }) => {
    return (
        <a
            href={href}
            css={css`
                text-decoration: none;
                &:visited {
                    text-decoration: none;
                    color: none;
                }
            `}
        >
            {children}
        </a>
    );
};
