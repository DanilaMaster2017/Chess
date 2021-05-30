/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { Page } from './Page';
import { BlueLink } from './BlueLink';

export const NotFoundPage: FC = () => {
    return (
        <Page>
            <div
                css={css`
                    display: flex;
                    justify-content: center;
                    margin: 15% auto;
                    padding: 20px 0;
                    width: 60%;
                    background-color: white;
                    border-radius: 5px;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        color: #b3b3b3;
                        font-size: 100px;
                    `}
                >
                    <div
                        css={css`
                            font-weight: 300;
                        `}
                    >
                        404
                    </div>
                    <div
                        css={css`
                            margin-left: 20px;
                        `}
                    >
                        <div
                            css={css`
                                margin: 20px 0;
                                font-size: 30px;
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                            `}
                        >
                            страница не найдена!
                        </div>
                        <div
                            css={css`
                                color: #4d4d4d;
                                font-size: 16px;
                            `}
                        >
                            Вернуться на{' '}
                            <BlueLink href={'/'}>домашнюю страницу</BlueLink>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};
