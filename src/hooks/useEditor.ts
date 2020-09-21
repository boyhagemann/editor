import { useEffect, useState } from "react";
import { Position, Bounds, ChangeEvent, Target, isAddEvent, Change, Add, Update, Element, ElementEvent, Selection, isElementEvent, Tool, Mode, Size, Remove } from "../types.d";
import { calculateBounds, isInBounds, getUpperBounds } from "../utils/selection";
import { snapTo, floorTo } from "../utils/numbers";
import uniqBy from 'lodash/fp/uniqBy'
import { compose } from 'redux'
import sortBy from 'lodash/fp/sortBy'
import keyboardJS from 'keyboardjs'


export interface Settings {
    bounds: Bounds,
    grid: Size,
    quantize: Size,
    offset: Position,
    snapToGrid: boolean,
    zoom: Position,
}

export interface RenderElementProps extends Element {
    selected: boolean
    moving: boolean
}


type Callback = (helpers: WithEditor) => void;

export type KeyHandler = Callback | [Callback, Callback]

interface WithEditor extends Settings {
    changes: ChangeEvent[],
    selection?: Bounds,
    selected: Selection,
    blocks: Element[],
    tool: Tool,
    mode: Mode,
    selectAll: () => void,
    deselectAll: () => void,
    moveSelection: (transition: Position) => void,
    duplicateSelection: () => void,
    deleteSelection: () => void,
    setZoom: (zoom: Position) => void
    resetZoom: () => void
    multiplyZoom: (transition: Position) => void,
    setOffset: (offset: Position) => void,
    resetOffset: () => void,
    transposeOffset: (transition: Position) => void,
    setTool: (tool: Tool) => void,
    setMode: (mode: Mode) => void,
    onDown: (position: Position) => void,
    onUp: (position: Position) => void,
    onMove: (offset: Position) => void,
    isSelected: (element: Element) => boolean,
    isChanged: (element: Element) => boolean,
}

interface Props {
    elements: Element[],
    bounds: Bounds,
    grid: Size,
    quantize: Size,
    snapToGrid: boolean,
    generateId: () => string,
    onChange?: (changes: ChangeEvent[]) => void,
    keys?: Record<string, KeyHandler>
}

export default ({ elements, bounds, grid, quantize, snapToGrid, onChange, generateId, keys }: Props): WithEditor => {

    const [selected, select] = useState<Selection>([]);
    const [zoom, setZoom] = useState<Position>({ x: 1, y: 1 })
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
    const [tool, setTool] = useState(Tool.Pointer);
    const [mode, setMode] = useState(Mode.Default);

    // Track pointer movement
    const [pointerPosition, setPointerPosition] = useState<Position>({ x: 0, y: 0 })
    const [pointerOffset, setPointerOffset] = useState<Position | undefined>()

    // Track pointer selection
    const [down, setDown] = useState<boolean>(false)
    const [target, setTarget] = useState<Target | undefined>()

    // Keep track of local changes, that do not directly bubble to the outside.
    const [changes, setChanges] = useState<ChangeEvent[]>([])

    // Used as temporary id for creating and updating elements
    const [id, setId] = useState<string>(generateId())


    /**
     * Selectors
     */
    const isSelected = (element: Element) => selected.includes(element.id)

    const isChanged = (element: Element) => changes
        .filter(isElementEvent)
        .some(change => change.element.id === element.id);

    // Calculate the selection bounds
    const selection = target === Target.Grid && tool === Tool.Pointer && down && pointerOffset
        ? calculateBounds(pointerPosition, pointerOffset)
        : undefined;

    // Merge the original elements with the local changes.
    const blocks = compose<Element[]>(
        uniqBy("id"),
        sortBy(isSelected)
    )([
        ...changes
            .filter(isElementEvent)
            .map(change => change.element),
        ...elements
    ])

    /**
     * Helpers
     */
    const selectAll = () => select(elements.map(element => element.id))

    const deselectAll = () => select([])

    const moveSelection = (transition: Position) => {

        const changes = elements
            .filter(element => selected.includes(element.id))
            .map<Update>(element => ({
                type: Change.Update,
                element: {
                    ...element,
                    x: element.x + transition.x,
                    y: element.y + transition.y
                }
            }))

        onChange && onChange(changes)
    }

    const duplicateSelection = () => {

        const selectedElements = elements
            .filter(element => selected.includes(element.id));

        const bounds = getUpperBounds(selectedElements)

        const changes = selectedElements.map<Add>(element => ({
            type: Change.Add,
            element: {
                ...element,
                id: generateId(),
                x: element.x + bounds.width - bounds.x,
            }
        }))

        onChange && onChange(changes);

        select(changes.map(change => change.element.id))
    }

    const deleteSelection = () => {

        const changes = elements
            .filter(element => selected.includes(element.id))
            .map<Remove>(element => ({ type: Change.Remove, element }))

        onChange && onChange(changes)
    }


    const resetZoom = () => {
        setZoom({ x: 1, y: 1 })
    }

    const multiplyZoom = (transition: Position) => {
        setZoom({
            x: zoom.x * transition.x,
            y: zoom.y * transition.y,
        })
    }

    const transposeOffset = (transition: Position) => {
        setOffset({
            x: offset.x + transition.x,
            y: offset.y + transition.y,
        })
    }

    const resetOffset = () => {
        setOffset({ x: 0, y: 0 })
    }

    const onMove = (position: Position) => {
        setPointerOffset(position);
    }

    const onDown = (position: Position) => {
        setDown(true);
        setPointerPosition(position);
        setPointerOffset(undefined);
    }

    const onUp = (position: Position) => {
        setDown(false);
    }

    const flushChanges = (changes: ChangeEvent[]) => {
        onChange && changes.length && onChange(changes)
        setChanges([]);
    }


    /**
     * 
     * Build the helpers object
     * 
     */
    const helpers: WithEditor = {
        grid,
        bounds,
        quantize,
        snapToGrid,
        changes,
        selected,
        selection,
        zoom,
        offset,
        blocks,
        tool,
        mode,
        selectAll,
        deselectAll,
        moveSelection,
        duplicateSelection,
        deleteSelection,
        setZoom,
        resetZoom,
        multiplyZoom,
        setOffset,
        resetOffset,
        transposeOffset,
        setTool,
        setMode,
        onDown,
        onUp,
        onMove,
        isSelected,
        isChanged
    }

    /**
     * Keyboard bindings
     */
    useEffect(() => {

        if (!keys) return;

        Object.keys(keys).forEach(key => {

            const handler = keys[key];

            Array.isArray(handler)
                ? keyboardJS.bind(key, (e) => {
                    e?.preventDefault()
                    setTarget(undefined)
                    handler[0](helpers)
                }, (e) => {
                    e?.preventDefault()
                    setTarget(undefined)
                    handler[1](helpers)
                })
                : keyboardJS.bind(key, (e) => {
                    e?.preventDefault()
                    handler(helpers)
                })

        })

        return () => {
            Object.keys(keys).forEach(key => {
                keyboardJS.unbind(key)
            })
        }

    }, [keys, selected, zoom, offset, mode])


    /**
     * 
     * Change hooks state
     * 
     */
    useEffect(() => {

        const calculatedPosition = {
            x: pointerPosition.x - offset.x,
            y: pointerPosition.y - offset.y
        }

        // Find the element we are pointing on
        const element = elements.find(element => isInBounds(element)({ ...calculatedPosition, width: 0, height: 0 }))

        // Set the target
        element
            ? setTarget(Target.Element)
            : setTarget(Target.Grid)

        // Select the single element if it is not selected yet
        if (tool === Tool.Pointer && down && element && !isSelected(element)) {
            mode === Mode.Special
                ? select([...selected, element.id])
                : select([element.id])
        }

        // Select again, if we already have a selection but did not move it.
        if (tool === Tool.Pointer && !down && element && !pointerOffset && mode === Mode.Special) {
            select([...selected, element.id])
        }

        // Reset the selection if clicked outside and not moved
        if (target && tool === Tool.Pointer && !down && mode === Mode.Default && !element && !pointerOffset) {
            select([])
        }

        // CHange the selection to the new elements, if there are clones.
        if (!down && changes.some(change => change.type === Change.Add)) {
            select(changes.filter(isAddEvent).map(change => change.element.id))
        }

        // If there are changes, wait for the pointer to be up and propagate
        // the changes to the outside.
        if (!down && tool === Tool.Pointer && pointerOffset && changes.length) {
            flushChanges(changes)
        }




        // Create a new element
        if (down && tool === Tool.Pencil && !element && !pointerOffset) {
            console.log("creating an element")
            const id = generateId();
            const { x, y } = pointerPosition

            const width = grid.width / quantize.width;
            const height = grid.height / quantize.height;

            setId(id);

            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id])

            // Temporary store the new element, wait for a possible resize
            setChanges([
                {
                    type: Change.Add,
                    element: {
                        id,
                        x: snapToGrid ? floorTo(x, width) : x,
                        y: snapToGrid ? floorTo(y, height) : y,
                        width: width,
                        height: height
                    }
                }
            ])
        }

        // Resize an existing element
        if (down && tool === Tool.Pencil && element && !pointerOffset) {
            console.log("start resizing an existing element")

            const id = element.id;

            setId(id);

            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id])


            const width = Math.max(grid.width / quantize.width, pointerPosition.x - element.x)

            // Resize, but wait for the pointer up
            setChanges([
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width: snapToGrid ? snapTo(width, grid.width / quantize.width) : width,
                    }
                }
            ])

        }
        // Split an existing element
        if (down && tool === Tool.Scissor && element && !pointerOffset) {
            console.log("start splitting an existing element")

            const baseWidth = Math.max(grid.width / quantize.width, pointerPosition.x - element.x)
            const width = snapToGrid ? snapTo(baseWidth, grid.width / quantize.width) : baseWidth
            const elementCount = mode === Mode.Special
                ? Math.ceil(element.width / width) - 1
                : 1

            const newElements = Array.from(Array(elementCount).keys()).map<Add>((index) => ({

                type: Change.Add,
                element: {
                    ...element,
                    id: generateId(),
                    x: element.x + width * (index + 1),
                    width: element.width - (width * (index + 1))
                }
            }))

            const changes: ElementEvent[] = [
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width,
                    }
                },
                ...newElements
            ]

            flushChanges(changes)

            // Get the last element id, for selection
            const id = changes[changes.length - 1].element.id;

            select([id]);
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [down, mode, pointerOffset])

    /**
     * 2. When the target changes
     */
    useEffect(() => {

        if (!down && tool === Tool.Pointer && target === Target.Grid && pointerPosition && pointerOffset) {


            const calculatedPosition = {
                x: (pointerPosition.x - offset.x) / zoom.x,
                y: (pointerPosition.y - offset.y) / zoom.y
            }

            const calculatedOffset = {
                x: (pointerOffset.x - offset.x) / zoom.x,
                y: (pointerOffset.y - offset.y) / zoom.y
            }

            const bounds = calculateBounds(calculatedPosition, calculatedOffset);

            const selection = bounds
                ? elements.filter(isInBounds(bounds)).map(element => element.id)
                : []


            mode === Mode.Special
                ? select([...selected, ...selection])
                : select(selection)

            // Reset the target, we want to verify a new click on the grid.
            // Otherwise hitting the shift key only will cause the select.
            setTarget(undefined)

            setPointerOffset(undefined)
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, down, mode])

    /**
     * 2. Move the elements by setting elements changes
     */
    useEffect(() => {

        // Move the selection
        if (down && tool === Tool.Pointer && target === Target.Element && pointerOffset && selected.length) {

            const changes = elements
                .filter(element => selected.includes(element.id))
                .map<Add | Update>(element => {

                    const x = element.x + pointerOffset.x - pointerPosition.x;
                    const y = element.y + pointerOffset.y - pointerPosition.y;

                    const width = grid.width / quantize.width;
                    const height = grid.height / quantize.height;

                    return mode === Mode.Special
                        ? {
                            type: Change.Add,
                            element: {
                                ...element,
                                id: generateId(),
                                x: snapToGrid ? snapTo(x, width) : x,
                                y: snapToGrid ? snapTo(y, height) : y
                            }
                        }
                        : {
                            type: Change.Update,
                            element: {
                                ...element,
                                x: snapToGrid ? snapTo(x, width) : x,
                                y: snapToGrid ? snapTo(y, height) : y
                            }
                        }
                })

            // Temporary store the changes, so we don't always fire all movements
            setChanges(changes)

        }

        // Resize an element
        if (down && tool === Tool.Pencil && pointerOffset) {
            console.log("resizing element")


            const event = changes.filter(isElementEvent).find(change => change.element.id === id);

            if (!event) return;

            const width = Math.max(grid.width / quantize.width, pointerOffset.x - event.element.x)

            const { element } = event;

            // Temporary store the changes, so we don't always fire all movements
            setChanges([
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width: snapToGrid
                            ? snapTo(width, grid.width / quantize.width)
                            : width,
                    }
                }
            ])
        }

        // After creating the element and up the pointer, flush the changes.
        if (!down && tool === Tool.Pencil && changes.length) {
            console.log("resized element, flush changes and select the resized element")

            // Change the type to Add again.
            const resizeChanges = changes
                .filter(isElementEvent)
                .map<ElementEvent>(change => target === Target.Element
                    ? change
                    : ({ ...change, type: Change.Add }));

            flushChanges(resizeChanges);
        }

    }, [down, mode, pointerOffset, pointerPosition])


    return helpers
}