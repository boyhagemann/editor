import React, { FC, PointerEvent, HTMLProps, memo, } from 'react'
import styled from 'styled-components'
import { Size, Position } from '../types'
import { themeGet } from '@styled-system/theme-get'

interface KeyProps extends HTMLProps<SVGRectElement> {
    pressed: boolean;
    off: boolean;
}

const StyledKey: FC<KeyProps> = styled.rect<KeyProps>`
    ${themeGet('key.default')}
    ${props => props.off && themeGet('key.off')(props)}
    ${props => props.pressed && themeGet('key.active')(props)}
`

const Separator = styled.line`
    stroke: gray;
`


export interface Props extends Size, Position {
    off: boolean;
    pressed: boolean;
    value: number;
    onDown?: (value: number) => void;
    onUp?: (value: number) => void;
    onOver?: (value: number) => void;
    onOut?: (value: number) => void;
}

const Key: FC<Props> = ({ width, height, x, y, value, onDown, onUp, onOver, onOut, pressed, off }) => {

    const handleDown = (e: PointerEvent) => {
        e.preventDefault()
        onDown && onDown(value);
    }

    const handleUp = (e: PointerEvent) => {
        e.preventDefault()
        onUp && onUp(value);
    }

    const handleOver = (e: PointerEvent) => {
        e.preventDefault()
        onOver && onOver(value);
    }

    const handleOut = (e: PointerEvent) => {
        e.preventDefault()
        onOut && onOut(value);
    }

    return (<g key={value} transform={`translate(${x},${y})`}>
        <StyledKey
            width={width}
            height={height}
            off={off}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            // onPointerLeave={handleUp}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
            pressed={pressed}
        />
        <Separator x1={0} x2={width} y1={0} y2={0} />
    </g>)
}

export default memo(Key, (prev, next) => {

    return prev.value === next.value &&
        prev.pressed === next.pressed &&
        prev.width === next.width &&
        prev.height === next.height
})