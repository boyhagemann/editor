import React, { FC, memo, } from 'react'
import { Position } from '../types'
import Key from './Key'


export interface Props {
    width: number;
    keyHeight: number;
    keys?: number;
    active?: number[]
    offset: Position;
    onDown?: (value: number) => void;
    onUp?: (value: number) => void;
    onOver?: (value: number) => void;
    onOut?: (value: number) => void;
}


const Keyboard: FC<Props> = ({ width, keyHeight, keys = 256, offset, onDown, onUp, onOver, onOut, active = [] }) => {

    const range = Array.from(Array(keys).keys())

    return (
        <g transform={`translate(0, ${-offset.y})`}>
            {range.map(value => {

                const remainder = (value + 12) % 12;
                const off = [1, 3, 6, 8, 10].includes(remainder);

                const max = range.length * keyHeight;
                const y = max - value * keyHeight;

                return (
                    <Key
                        key={value}
                        value={value}
                        x={0}
                        y={y}
                        width={width}
                        height={keyHeight}
                        off={off}
                        onDown={onDown}
                        onUp={onUp}
                        onOver={onOver}
                        onOut={onOut}
                        pressed={active.includes(value)}
                    />)
            })}
        </g>
    )

}

export default memo(Keyboard, (prev, next) => {

    return prev.keys === next.keys &&
        JSON.stringify(prev.active) === JSON.stringify(next.active) &&
        prev.width === next.width &&
        prev.keyHeight === next.keyHeight &&
        prev.offset.x === next.offset.x &&
        prev.offset.y === next.offset.y
})