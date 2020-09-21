import React, { FC, ReactElement } from 'react'
import { useTheme } from 'styled-components'
import { Size, Position, Locator, Bounds, Tool } from '../types.d'
import Grid from './Grid'
import Selection from './Selection'
import Overlay from './Overlay'
import LocatorUI from './Locator'


const calculateLocatorX = (grid: Size, quantize: Size, zoom: Position, offset: Position) => (locator: Locator) => (locator.time * grid.width / quantize.width + offset.x) * zoom.x

interface Props extends Size {
    id: string,
    bounds: Bounds,
    grid: Size,
    quantize: Size,
    zoom: Position,
    offset: Position,
    locators: Locator[],
    blocks: ReactElement[]
    selection?: Bounds,
    tool: Tool,
    onDown?: (position: Position) => void,
    onUp?: (position: Position) => void,
    onMove?: (offset: Position) => void,
}

const Editor: FC<Props> = ({ id, width, height, bounds, grid, quantize, zoom, offset, locators, blocks, selection, tool, onDown, onUp, onMove }) => {

    const theme = useTheme() as any;

    const calculatePosition = calculateLocatorX(grid, quantize, zoom, offset)

    return (
        <g>
            <Grid
                id={`${id}-small`}
                color={theme.editor.grid.small.color}
                x={offset.x}
                y={offset.y}
                width={bounds.width}
                height={bounds.height}
                grid={{
                    width: zoom.x * grid.width / quantize.width,
                    height: zoom.y * grid.height / quantize.height
                }}
                offset={offset}
            />
            <Grid
                id={`${id}-large`}
                color={theme.editor.grid.small.color}
                width={bounds.width}
                height={bounds.height}
                grid={{
                    width: zoom.x * grid.width,
                    height: zoom.y * grid.height
                }}
                offset={offset}
            />
            {locators.map(locator => (
                <LocatorUI key={locator.id} x={calculatePosition(locator)} active={locator.id !== "time"} />
            ))}
            {blocks}
            {selection && <Selection {...selection} />}
            <Overlay
                width={width}
                height={height}
                tool={tool}
                onDown={onDown}
                onUp={onUp}
                onMove={onMove}
            />
        </g>
    )

}

export default Editor