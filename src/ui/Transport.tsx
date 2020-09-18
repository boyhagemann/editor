import React, { PointerEvent, FC, HTMLProps } from 'react'
import styled from 'styled-components'
import { Size } from '../types.d'
import Button from './Button'
import { themeGet } from '@styled-system/theme-get'


interface ContainerProps extends HTMLProps<SVGRectElement> {
}

const Container: FC<ContainerProps> = styled.rect<ContainerProps>`
    ${themeGet('tools.default')}
`


interface Props extends Size {
    playing: boolean;
    cycle: boolean;
    onPlay: () => void;
    onStop: () => void;
    onCycle: () => void
}

const Transport: FC<Props> = ({ width, height, playing, cycle, onPlay, onStop, onCycle }) => {

    const handlePlay = (e: PointerEvent) => {
        onPlay()
    }

    const handleStop = (e: PointerEvent) => {
        onStop()
    }

    const handleCycle = (e: PointerEvent) => {
        onCycle()
    }


    return (<g>
        <Container width={width} height={height} />
        <Button x={2} y={2} width={50} height={16} active={playing} onDown={handlePlay} text="Play" />
        <Button x={54} y={2} width={50} height={16} onDown={handleStop} text="Stop" />
        <Button x={106} y={2} width={50} height={16} active={cycle} onDown={handleCycle} text="Cycle" />
    </g>)
}

export default Transport