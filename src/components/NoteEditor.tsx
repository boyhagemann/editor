import React, { FC } from 'react'
import Keyboard from '../ui/Keyboard'
// import Editor from './Editor'
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


    /**
     * 
     * Helpers
     * 
     */

    const isNotePlaying = (id: string) => playing && notes.some(note => note.id === id && note.on < playingAt && note.off > playingAt);

    const getActiveValues = () => playing ? notes
        .filter(note => note.on < playingAt && note.off > playingAt)
        .map(note => note.value) : activeKeys

    const settings: Settings = {
        dimensions: {
            width,
            height: 100 * 128,
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

    const { grid, quantize, snapToGrid } = settings;

    const elements = notes.map(mapNoteToElement(settings));
    const renderElement = (props: RenderElementProps) => <Element {...props} key={props.id} active={isNotePlaying(props.id)} />
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
    const withEditorProps = useEditor({ elements, renderElement, dimensions: { width, height }, grid, quantize, snapToGrid, generateId, onChange: handleChange, keys });

    // Keyboard
    const { active: activeKeys, add: addKey, remove: removeKey, setPlaying } = useKeyboard();


    /**
     * 
     * Handlers
     * 
     */

    const handleKeyboardDown = (value: number) => {
        setPlaying(true);
        addKey(value);
    }

    const handleKeyboardUp = () => {
        setPlaying(false)
    }

    const handleKeyboardOver = (value: number) => {
        addKey(value);
    }

    const handleKeyboardOut = (value: number) => {
        removeKey(value)
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
                    keyHeight={settings.grid.height / settings.quantize.height}
                    keys={128}
                    active={getActiveValues()}
                    offset={{ x: 0, y: 0 }}
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
            render: (size: Size) => (
                <TimeLine {...size} {...settings} offset={{ x: 0, y: 0 }} playingAt={playingAt} onDown={onTimeLineChange} />
            )
        },
    ]

    return (
        <Compose width={width} height={height} tree={tree} components={components} />
    )
}


export default NoteEditor