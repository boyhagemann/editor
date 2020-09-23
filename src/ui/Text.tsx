import React, { FC, HTMLProps } from 'react'
import styled from 'styled-components'
import { Position } from '../types.d'

interface TextProps extends Position, HTMLProps<SVGTextElement> { }

const Text: FC<TextProps> = styled.text<TextProps>`
    font: ${props => typeof props.height === "number" ? props.height - 4 : 16}px sans-serif;
    fill: white;
    text-anchor: middle;
    pointer-events: none;
`

export default Text