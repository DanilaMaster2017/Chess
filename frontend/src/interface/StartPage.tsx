/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FC } from 'react';
import { LeftPanel } from './LeftPanel';
import { Page } from './Page';

export const StartPage: FC = () => {
    return (
        <Page>
            <LeftPanel></LeftPanel>
        </Page>
    );
};
