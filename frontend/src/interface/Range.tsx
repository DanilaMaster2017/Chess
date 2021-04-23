/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FC, ChangeEvent } from 'react';

interface Props {
    label: string;
    time: number;
    onTimeChanged: (v: number) => void;
    possibleValues: number[];
    disabled?: boolean | undefined;
}

export const Range: FC<Props> = ({
    label,
    time,
    onTimeChanged,
    possibleValues,
    disabled,
}) => {
    const rangeWidth = '380px';
    const opacity = disabled ? 0.5 : 1;
    const mozilaBorderRadius = '7px';
    const trackColor = '#f8b951';

    const thumbHover = disabled
        ? ''
        : css`
              &:hover {
                  background-color: #faf49c;
              }
          `;

    const thumbStyle = css`
        width: 30px;
        border: 1px solid #b3b3b3;
        background: #ffffff;
        cursor: pointer;
        ${thumbHover}
    `;
    const trackStyle = css`
        height: 15px;
        cursor: pointer;
    `;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        onTimeChanged(+e.target.value);
    };

    return (
        <div
            css={css`
                opacity: ${opacity};
                margin-bottom: 20px;
            `}
        >
            <div
                css={css`
                    margin-bottom: 7px;
                    text-align: center;
                    font-size: 14px;
                    color: #4d4d4d;
                `}
            >
                {label + ': '}

                {possibleValues[time] === Infinity ? (
                    <span
                        css={css`
                            font-size: 18px;
                            font-family: 'Times New Roman', Times, serif;
                        `}
                    >
                        ∞
                    </span>
                ) : (
                    <span
                        css={css`
                            font-size: 13px;
                            font-weight: 700;
                        `}
                    >
                        {possibleValues[time]}
                    </span>
                )}
            </div>
            <input
                type="range"
                disabled={disabled}
                min="0"
                max={possibleValues.length - 1}
                step="1"
                onChange={onChange}
                value={time}
                css={css`
                    -webkit-appearance: none;
                    overflow: hidden;
                    width: ${rangeWidth};
                    background-color: #dbdbdb;
                    @-moz-document url-prefix() {
                        & {
                            border-radius: ${mozilaBorderRadius};
                        }
                        &::-moz-range-thumb {
                            height: 15px;
                            ${thumbStyle}
                        }
                        &::-moz-range-track {
                            ${trackStyle}
                        }
                        &::-moz-range-progress {
                            border-radius: ${mozilaBorderRadius};
                            height: 100%;
                            background-color: ${trackColor};
                        }
                    }
                    &::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 15px;
                        box-shadow: -${rangeWidth} 0 0 ${rangeWidth} ${trackColor};
                        ${thumbStyle}
                    }

                    &::-webkit-slider-runnable-track {
                        -webkit-appearance: none;
                        ${trackStyle}
                    }
                `}
            />
        </div>
    );
};
