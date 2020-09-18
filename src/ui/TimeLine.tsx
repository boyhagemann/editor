import React, { HTMLProps, FC } from 'react'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'
import { Size, Position, Tool } from '../types.d'
import Grid from './Grid'
import Overlay from './Overlay'
import { mapXToTime } from '../utils/time'
import { snapTo } from '../utils/numbers'



interface ContainerProps extends HTMLProps<SVGRectElement> {
}

const Container: FC<ContainerProps> = styled.rect<ContainerProps>`
    ${themeGet('timeline.container.default')}
`

interface Props extends Size {
    playingAt: number
    grid: Size
    quantize: Size
    offset: Position
    snapToGrid: boolean
    onDown: (time: number) => void
}

const TimeLine: FC<Props> = ({ width, height, grid, quantize, snapToGrid, offset, onDown }) => {

    const handleDown = ({ x }: Position) => {

        const division = grid.width / quantize.width
        const snapped = snapToGrid ? snapTo(x, division) : x
        const time = mapXToTime(snapped, grid, quantize)

        onDown(time)
    }

    return <g>
        <Container width={width} height={height} />
        <Grid id="timeline" width={width} height={height} color="white" grid={grid} offset={offset} />
        <Overlay tool={Tool.Pointer} width={width} height={height} onDown={handleDown} />
    </g>
}

export default TimeLine