import React, { PointerEvent, FC, HTMLProps } from 'react'
import styled from 'styled-components'
import { Position, Size } from '../types.d'
import { themeGet } from '@styled-system/theme-get'


interface ContainerProps extends HTMLProps<SVGRectElement> {
    active: boolean;
}

const Container: FC<ContainerProps> = styled.rect<ContainerProps>`
    ${themeGet('button.default.container')}
    ${props => props.active && themeGet('button.active.container')(props)}
`

interface TextProps extends Position, HTMLProps<SVGTextElement> { }

const Text: FC<TextProps> = styled.text<TextProps>`
    font: ${props => typeof props.height === "number" ? props.height - 4 : 16}px sans-serif;
    fill: white;
    text-anchor: middle;
    pointer-events: none;
`

interface Props extends Position, Size {
    active?: boolean;
    onDown?: (e: PointerEvent) => void;
    text: string;
}

const Button: FC<Props> = ({ x, y, width, height, text, active, onDown }) => {

    return (<g transform={`translate(${x}, ${y})`}>
        <Container width={width} height={height} active={!!active} onPointerDown={onDown} />
        <Text x={width / 2} y={height - 4} width={width} height={height}>{text}</Text>
    </g>)
}

export default Button