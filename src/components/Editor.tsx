import React, { FC, ReactElement } from 'react'
import { Size, ChangeEvent, Element } from '../types.d'
import useEditor, { RenderElementProps, Settings, KeyHandler } from '../hooks/useEditor'
import { Locators } from '../reducers/locators'
import EditorUI from '../ui/Editor'


export interface Props extends Settings, Size {
    id: string,
    elements: Element[],
    locators: Locators,
    renderElement: (props: RenderElementProps) => ReactElement
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId: () => string,
    keys?: Record<string, KeyHandler>
}

const Editor: FC<Props> = ({
    id,
    renderElement,
    elements,
    locators,
    width,
    height,
    onChange,
    generateId,
    keys,
    grid,
    quantize,
    snapToGrid,
}) => {

    const withEditorProps = useEditor({ elements, renderElement, dimensions: { width, height }, grid, quantize, snapToGrid, generateId, onChange, keys });

    return <EditorUI
        {...withEditorProps}
        id={id}
        width={width}
        height={height}
        locators={locators}
        grid={grid}
        quantize={quantize}
    />
}

export default Editor