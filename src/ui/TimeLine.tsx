import React, { HTMLProps, FC, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'
import { themeGet } from '@styled-system/theme-get'
import { Size, Position, Tool } from '../types.d'
import Grid from './Grid'
import Overlay from './Overlay'
import { mapXToTime } from '../utils/time'
import { snapTo } from '../utils/numbers'
import Text from './Text'


interface Time {
    bar: number,
    division: number
}

interface TextProps {
    faded: boolean
}

const StyledText = styled(Text) <TextProps>`
    ${themeGet('timeline.text.default')}
    ${props => props.faded && themeGet('timeline.text.faded')}
`


interface ContainerProps extends HTMLProps<SVGRectElement> { }

const Container: FC<ContainerProps> = styled.rect<ContainerProps>`
    ${themeGet('timeline.container.default')}
`

interface Props extends Size {
    playingAt: number
    grid: Size
    quantize: Size
    zoom: Position
    offset: Position
    snapToGrid: boolean
    onDown: (time: number) => void
}

const TimeLine: FC<Props> = ({ width, height, grid, quantize, snapToGrid, zoom, offset, onDown, ...props }, context) => {

    const handleDown = useCallback(({ x }: Position) => {

        const division = (grid.width / quantize.width)
        const snapped = snapToGrid ? snapTo(x / zoom.x, division) : x / zoom.x
        const time = mapXToTime(snapped, grid, quantize)

        onDown(time)
    }, [zoom])

    const gridLarge = {
        width: zoom.x * grid.width,
        height,
    }

    const gridSmall = {
        width: zoom.x * grid.width / quantize.width,
        height,
    }

    const theme = useTheme() as any;

    const bars = Array.from(Array(Math.ceil(width / (grid.width))).keys())
    const divisions = Array.from(Array(quantize.width).keys());

    const numbers = bars.reduce<Time[]>((all, bar) => {

        const items = divisions.map<Time>(division => ({
            bar,
            division
        }))

        return [...all, ...items]
    }, [])



    const calculateX = (number: number) => number * (grid.width / quantize.width) * zoom.x

    return <g>
        <Container width={width} height={height} />
        <Grid id="timeline-large" color={theme.timeline.grid.large.color} width={width} height={height} grid={gridLarge} offset={offset} />
        <Grid id="timeline-small" color={theme.timeline.grid.small.color} width={width} height={height} grid={gridSmall} offset={offset} />
        {numbers.map(({ bar, division }, index) => (
            <StyledText faded={division !== 0} x={calculateX(index) + 2} y={height - 2}>{bar + 1}.{division}</StyledText>
        ))}
        <Overlay tool={Tool.Pointer} width={width} height={height} onDown={handleDown} />
    </g>
}

export default TimeLine