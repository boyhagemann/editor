import React, { FC } from 'react'
import Keyboard from '../ui/Keyboard'
import Compose, { Align, Component } from '../ui/Compose'
import { Size, ChangeEvent, isElementEvent, Note, Locator } from '../types.d'
import { NoteAction } from '../reducers/notes'
import { v4 as uuid } from 'uuid'
import Element from '../ui/Element'
import { mapNoteToElement, mapChangeToNoteAction } from '../utils/notes'
import useKeyboard from '../hooks/useKeyboard'
import TimeLine from '../ui/TimeLine'
import useEditor, { KeyHandler, Settings, RenderElementProps } from '../hooks/useEditor'
import Editor from '../ui/Editor'


export interface Props extends Size {
    notes: Note[],
    onChange: (events: NoteAction[]) => void,
    onTimeLineChange: (time: number) => void,
    locators: Locator[],
    playing: boolean,
    playingAt: number,
    keys?: Record<string, KeyHandler>
}

const NoteEditor: FC<Props> = ({ width, height, notes, keys, onChange, locators, playing, playingAt, onTimeLineChange }) => {

    const settings: Settings = {
        bounds: {
            x: 0,
            y: 0,
            width,
            height: 128 * (100 / 12)
        },
        grid: {
            width: 50,
            height: 100
        },
        quantize: {
            width: 4,
            height: 12
        },
        zoom: {
            x: 1,
            y: 1
        },
        offset: {
            x: 0,
            y: 0
        },
        snapToGrid: true
    }

    const { bounds, grid, quantize, snapToGrid } = settings;

    const elements = notes.map(mapNoteToElement(settings));

    const generateId = () => uuid();

    const handleChange = (changes: ChangeEvent[]) => {

        const noteBatch = changes
            .filter(isElementEvent)
            .map(mapChangeToNoteAction(settings))

        if (onChange && noteBatch.length) {
            onChange(noteBatch)
        }
    }

    // Editor
    const withEditorProps = useEditor({ elements, bounds, grid, quantize, snapToGrid, generateId, onChange: handleChange, keys });

    // Keyboard
    const { active, add, remove, setPlaying } = useKeyboard();

    const { zoom, offset, isSelected, isChanged } = withEditorProps


    /**
     * 
     * Selectors
     * 
     */

    const getActiveValues = () => playing ? notes
        .filter(note => note.on < playingAt && note.off > playingAt)
        .map(note => note.value) : active

    const isNotePlaying = (id: string) => playing && notes.some(note => note.id === id && note.on < playingAt && note.off > playingAt);



    /**
     * 
     * Helpers
     * 
     */
    const renderElement = (props: RenderElementProps) => <Element {...props} key={props.id} active={isNotePlaying(props.id)} />


    const blocks = withEditorProps.blocks.map(element => renderElement({
        ...element,
        x: element.x * zoom.x + offset.x,
        y: element.y * zoom.y + offset.y,
        width: element.width * zoom.x,
        height: element.height * zoom.y,
        selected: isSelected(element),
        moving: isChanged(element),
    }))


    /**
     * 
     * Handlers
     * 
     */

    const handleKeyboardDown = (value: number) => {
        setPlaying(true);
        add(value);
    }

    const handleKeyboardUp = () => {
        setPlaying(false)
    }

    const handleKeyboardOver = (value: number) => {
        add(value);
    }

    const handleKeyboardOut = (value: number) => {
        remove(value)
    }


    const tree = {
        first: {
            second: "timeline",
            split: 20,
            align: Align.Left
        },
        second: {
            first: "keyboard",
            second: "editor",
            align: Align.Left,
            split: 20,
        },
        align: Align.Top,
        split: 20,
    }

    const components: Component[] = [
        {
            id: "keyboard",
            render: (size: Size) => (
                <Keyboard
                    width={size.width}
                    keyHeight={settings.grid.height / settings.quantize.height * withEditorProps.zoom.y}
                    keys={128}
                    active={getActiveValues()}
                    offset={{ x: 0, y: -withEditorProps.offset.y }}
                    onDown={handleKeyboardDown}
                    onUp={handleKeyboardUp}
                    onOver={handleKeyboardOver}
                    onOut={handleKeyboardOut}
                />
            )
        },
        {
            id: "editor",
            render: (size: Size) => (

                <Editor
                    {...withEditorProps}
                    blocks={blocks}
                    id="note-editor"
                    width={width}
                    height={height}
                    locators={locators}
                    grid={grid}
                    quantize={quantize}
                />

            )
        },
        {
            id: "timeline",
            render: (size: Size) => {

                return (
                    <TimeLine {...size} {...withEditorProps} playingAt={playingAt} onDown={onTimeLineChange} />
                )
            }
        },
    ]

    return (
        <Compose width={width} height={height} tree={tree} components={components} />
    )
}


export default NoteEditor