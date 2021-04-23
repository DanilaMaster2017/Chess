/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC } from 'react';
import { useDialogContext } from './DialogContext';

export const CloseButton: FC = () => {
    const { onClose } = useDialogContext();
    return (
        <button
            onClick={onClose}
            css={css`
                position: absolute;
                top: 0;
                right: 0;
                padding: 0 6px;
                cursor: pointer;
                background-color: white;
                font-size: 28px;
                font-weight: 700;
                color: #5f5f5f;
                border-bottom-left-radius: 5px;
                &:hover {
                    background-color: #cc3333;
                    color: #faeaea;
                }
            `}
        >
            &times;
        </button>
    );
};
