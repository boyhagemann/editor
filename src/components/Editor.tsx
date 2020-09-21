import React, { FC } from 'react'
import { Size, ChangeEvent, Element } from '../types.d'
import useEditor, { Settings, KeyHandler } from '../hooks/useEditor'
import { Locators } from '../reducers/locators'
import EditorUI from '../ui/Editor'
import ElementUI from '../ui/Element'


export interface Props extends Settings, Size {
    id: string,
    elements: Element[],
    locators: Locators,
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId: () => string,
    keys?: Record<string, KeyHandler>
}

const Editor: FC<Props> = ({
    id,
    elements,
    locators,
    width,
    height,
    onChange,
    generateId,
    keys,
    bounds,
    grid,
    quantize,
    snapToGrid,
}) => {

    const withEditorProps = useEditor({ elements, bounds, grid, quantize, snapToGrid, generateId, onChange, keys });

    const { isSelected, isChanged } = withEditorProps

    const renderElement = (element: Element) => <ElementUI {...element} selected={isSelected(element)} moving={isChanged(element)} />

    return <EditorUI
        {...withEditorProps}
        id={id}
        width={width}
        height={height}
        locators={locators}
        bounds={bounds}
        grid={grid}
        quantize={quantize}
        blocks={elements.map(renderElement)}
    />
}

export default Editor