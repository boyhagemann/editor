import React, { PointerEvent, FC, HTMLProps } from 'react'
import styled from 'styled-components'
import { Size, Tool } from '../types.d'
import Button from './Button'
import { themeGet } from '@styled-system/theme-get'


interface ContainerProps extends HTMLProps<SVGRectElement> {
}

const Container: FC<ContainerProps> = styled.rect<ContainerProps>`
    ${themeGet('tools.default')}
`


interface Props extends Size {
    active: Tool;
    onChange: (tool: Tool) => void;
}

const Tools: FC<Props> = ({ width, height, active, onChange }) => {

    const selectPointer = (e: PointerEvent) => {
        onChange(Tool.Pointer)
    }

    const selectPencil = (e: PointerEvent) => {
        onChange(Tool.Pencil)
    }

    const selectScissor = (e: PointerEvent) => {
        onChange(Tool.Scissor)
    }

    const selectLasso = (e: PointerEvent) => {
        onChange(Tool.Lasso)
    }

    return (<g>
        <Container width={width} height={height} />
        <Button x={2} y={2} width={16} height={16} active={active === Tool.Pointer} onDown={selectPointer} text="1" />
        <Button x={18} y={2} width={16} height={16} active={active === Tool.Pencil} onDown={selectPencil} text="2" />
        <Button x={36} y={2} width={16} height={16} active={active === Tool.Scissor} onDown={selectScissor} text="3" />
        <Button x={54} y={2} width={16} height={16} active={active === Tool.Lasso} onDown={selectLasso} text="4" />
    </g>)
}

export default Tools