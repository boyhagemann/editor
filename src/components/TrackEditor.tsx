import React, { FC, useState, useReducer, useEffect, } from 'react'
import Editor from './Editor'
import Compose, { Align, Component } from '../ui/Compose'
import { Size, Part, Position, ChangeEvent, Change, isElementEvent, Tool, Selection, Mode, Track } from '../types.d'
import noteReducer, { NoteAction, batch, Add, add, Update, update, Remove, remove, defaultState as defaultNotes } from '../reducers/notes'
import locatorReducer, { add as addLocator, defaultState as defaultLocators } from '../reducers/locators'
import { defaultState as defaultTransport } from '../reducers/transport'
import { v4 as uuid } from 'uuid'
import keyboardJS from 'keyboardjs'
import Element from '../ui/Element'
import { getUpperBounds, reduceNotesToMidiEvents, mapChangeToNoteAction } from '../utils/notes'
import useKeyboard from '../hooks/useKeyboard'
import useScheduler from '../hooks/useScheduler'
import useSynth from '../hooks/useSynth'
import TimeLine from '../ui/TimeLine'
import context from '../utils/audio'
import usePersist from '../hooks/usePersist'
import { mapPartToElement, isComposedPart, composePart } from '../utils/parts'
import useTransport from '../hooks/useTransport'
import { Settings } from '../hooks/useEditor'


export interface Props extends Size {
    parts: Part[],
    tracks: Track[],
    onTimeLineChange: (time: number) => void,
}

const TrackEditor: FC<Props> = ({ width, height, parts, tracks, onTimeLineChange }) => {

    // Persist
    const [initialState, persist] = usePersist("test2", {
        notes: defaultNotes,
        transport: defaultTransport,
        locators: defaultLocators,
        selection: []
    })

    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState<Position>({ x: 1, y: 1 })
    const [tool, setTool] = useState(Tool.Pointer);
    const [mode, setMode] = useState(Mode.Default);
    const [selection, setSelection] = useState<Selection>(initialState.selection);

    // Locators
    const [locators, dispatchLocatorAction] = useReducer(locatorReducer, initialState.locators);

    // Keyboard
    const { active: activeKeys, add: addKey, remove: removeKey, setPlaying } = useKeyboard();

    // Notes
    const [notes, dispatchNoteAction] = useReducer(noteReducer, initialState.notes)

    // Transport
    const { bpm, playingAt, startedAt, playing, play, stop, cycle, reset: resetTransport, setPlayingAt, setStartedAt, toggleCycle } = useTransport(initialState.transport)

    // Synth
    const { addEvents, reset: resetSynth } = useSynth(16, bpm, startedAt);

    // Scheduler
    const { clear: clearScheduler } = useScheduler({
        events: notes.reduce(reduceNotesToMidiEvents, []),
        active: playing,
        time: playingAt,
        onChange: addEvents
    })

    /**
     * Persist to local storage if any of these values change.
     */
    useEffect(() => {

        persist({
            notes,
            locators,
            transport: { startedAt, playingAt, cycle },
            selection
        })

    }, [notes, locators, startedAt, playingAt, cycle, selection])


    const settings: Settings = {
        dimensions: {
            width,
            height: 50 * tracks.length
        },
        grid: {
            width: 50,
            height: 50
        },
        quantize: {
            width: 4,
            height: 1
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

    const partElements = parts
        .map(composePart(tracks))
        .filter(isComposedPart)
        .map(mapPartToElement(settings))

    /**
     * 
     * Selectors
     * 
     */
    const getLocators = () => [...locators, {
        id: "time",
        time: playingAt
    }]

    const findLocator = (id: string) => getLocators().find(locator => locator.id === id)

    /**
     * 
     * Helpers
     * 
     */

    const isNotePlaying = (id: string) => playing && notes.some(note => note.id === id && note.on < playingAt && note.off > playingAt);

    const stopPlayingNotes = () => {
        resetSynth();
        clearScheduler()
    }

    const setLocator = (id: string, time: number) => {
        console.log(id, time)
        dispatchLocatorAction(addLocator({ id, time }))
    }

    const jumpToLocator = (id: string) => {
        const locator = findLocator(id)

        if (locator) {
            setPlayingAt(locator.time);
            setStartedAt(context.currentTime)
        }
    }

    const getActiveValues = () => playing ? notes
        .filter(note => note.on < playingAt && note.off > playingAt)
        .map(note => note.value) : activeKeys

    const moveSelection = (offset: Position) => {

        const changes = notes
            .filter(note => selection.includes(note.id))
            .map<Update>(note => update(note.id, {
                on: note.on + offset.x,
                off: note.off + offset.x,
                value: note.value + offset.y
            }))

        batchNoteChanges(changes);
    }

    const selectAll = () => {
        setSelection(notes.map(note => note.id))
    }

    const deselectAll = () => {
        setSelection([])
    }

    const duplicateSelection = () => {

        const selected = notes
            .filter(note => selection.includes(note.id));

        const bounds = getUpperBounds(selected)

        const changes = selected.map<Add>(note => add({
            ...note,
            id: uuid(),
            on: note.on + bounds.width - bounds.x,
            off: note.off + bounds.width - bounds.x,
        }))

        batchNoteChanges(changes);

        setSelection(changes.map(change => change.note.id))
    }

    const deleteSelection = () => {
        const changes = selection.map<Remove>(remove)
        batchNoteChanges(changes);
    }

    const zoomInX = (value: number) => {
        setZoom({
            ...zoom,
            x: zoom.x * value,
        })
    }

    const zoomInY = (value: number) => {
        setZoom({
            ...zoom,
            y: zoom.y * value,
        })
    }

    const zoomOutX = (value: number) => {
        setZoom({
            ...zoom,
            x: zoom.x / value,
        })
    }

    const zoomOutY = (value: number) => {
        setZoom({
            ...zoom,
            y: zoom.y / value,
        })
    }

    const offsetX = (value: number) => {
        setOffset({
            ...offset,
            x: offset.x + value * (settings.grid.width / settings.quantize.width)
        })
    }

    const offsetY = (value: number) => {
        setOffset({
            ...offset,
            y: offset.y + value * (settings.grid.height / settings.quantize.height)
        })
    }

    const reset = () => {
        deselectAll();
        setZoom({ x: 1, y: 1 })
    }


    const batchNoteChanges = (changes: NoteAction[]) => dispatchNoteAction(batch(changes));


    useEffect(() => {
        stopPlayingNotes()
    }, [notes])

    useEffect(() => {
        if (!playing || startedAt !== playingAt) {
            stopPlayingNotes()
        }
    }, [playing, startedAt])

    // useEffect(() => {
    //     if (!playing) {
    //         stopPlayingNotes()
    //     }
    // }, [playing])

    /**
     * 
     * Keyboard listeners
     * 
     */
    useEffect(() => {

        keyboardJS.bind("shift", (e) => {
            e?.preventDefault()
            setMode(Mode.Special)
        }, () => {
            setMode(Mode.Default)
        })

        keyboardJS.bind("spacebar", (e) => {
            e?.preventDefault()
            playing ? stop() : play()
        })

        keyboardJS.bind("backspace", (e) => {
            e?.preventDefault()
            deleteSelection()
        })

        keyboardJS.bind("esc", (e) => {
            e?.preventDefault()
            reset()
        })

        keyboardJS.bind(".", (e) => {
            e?.preventDefault()
            resetTransport()
        })

        keyboardJS.bind("/", (e) => {
            e?.preventDefault()
            toggleCycle()
        })

        keyboardJS.bind("1", (e) => {
            e?.preventDefault()
            jumpToLocator("1")
        })

        keyboardJS.bind("2", (e) => {
            e?.preventDefault()
            jumpToLocator("2")
        })

        keyboardJS.bind("command+1", (e) => {
            e?.preventDefault()
            setLocator("1", playingAt)
        })

        keyboardJS.bind("command+2", (e) => {
            e?.preventDefault()
            setLocator("2", playingAt)
        })

        keyboardJS.bind("alt+1", (e) => {
            e?.preventDefault()
            setTool(Tool.Pointer)
        })

        keyboardJS.bind("alt+2", (e) => {
            e?.preventDefault()
            setTool(Tool.Pencil)
        })

        keyboardJS.bind("alt+3", (e) => {
            e?.preventDefault()
            setTool(Tool.Scissor)
        })

        keyboardJS.bind("alt+4", (e) => {
            e?.preventDefault()
            setTool(Tool.Lasso)
        })

        keyboardJS.bind("left", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: -1, y: 0 })
                : offsetX(-1)
        })

        keyboardJS.bind("shift+left", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: -5, y: 0 })
                : offsetX(-5)
        })

        keyboardJS.bind("command+left", (e) => {
            e?.preventDefault()
            zoomOutX(1.2)
        })

        keyboardJS.bind("right", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 1, y: 0 })
                : offsetX(1)
        })

        keyboardJS.bind("shift+right", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 5, y: 0 })
                : offsetX(5)
        })

        keyboardJS.bind("command+right", (e) => {
            e?.preventDefault()
            zoomInX(1.2)
        })

        keyboardJS.bind("up", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 0, y: 1 })
                : offsetY(1)
        })

        keyboardJS.bind("shift+up", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 0, y: 12 })
                : offsetY(12)
        })

        keyboardJS.bind("command+up", (e) => {
            e?.preventDefault()
            zoomOutY(1.2)
        })

        keyboardJS.bind("down", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 0, y: -1 })
                : offsetY(-1)
        })

        keyboardJS.bind("shift+down", (e) => {
            e?.preventDefault()
            selection.length
                ? moveSelection({ x: 1, y: -12 })
                : offsetY(-12)
        })

        keyboardJS.bind("command+down", (e) => {
            e?.preventDefault()
            zoomInY(1.2)
        })

        keyboardJS.bind("command+a", (e) => {
            e?.preventDefault()
            selectAll();
        })

        keyboardJS.bind("command+d", (e) => {
            e?.preventDefault()
            duplicateSelection();
        })

        return () => {
            keyboardJS.unbind("shift")
            keyboardJS.unbind("spacebar")
            keyboardJS.unbind("backspace")
            keyboardJS.unbind("esc")
            keyboardJS.unbind("/")
            keyboardJS.unbind("/")
            keyboardJS.unbind(".")
            keyboardJS.unbind("1")
            keyboardJS.unbind("2")
            keyboardJS.unbind("command+1")
            keyboardJS.unbind("command+2")
            keyboardJS.unbind("alt+1")
            keyboardJS.unbind("alt+2")
            keyboardJS.unbind("alt+3")
            keyboardJS.unbind("alt+4")
            keyboardJS.unbind("left")
            keyboardJS.unbind("shift+left")
            keyboardJS.unbind("command+left")
            keyboardJS.unbind("right")
            keyboardJS.unbind("shift+right")
            keyboardJS.unbind("command+right")
            keyboardJS.unbind("up")
            keyboardJS.unbind("shift+up")
            keyboardJS.unbind("command+up")
            keyboardJS.unbind("down")
            keyboardJS.unbind("shift+down")
            keyboardJS.unbind("command+down")
            keyboardJS.unbind("command+d")
            keyboardJS.unbind("command+a")
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, playingAt, selection, notes, zoom, offset])


    /**
     * 
     * Editor handlers
     * 
     */

    const handleChange = (changes: ChangeEvent[]) => {

        console.log(changes)

        const noteBatch = changes
            .filter(isElementEvent)
            .map(mapChangeToNoteAction(settings))

        if (noteBatch.length) {
            batchNoteChanges(noteBatch)
        }

        changes.forEach(change => {

            if (change.type === Change.Select) {
                setSelection(change.selection)
            }
        })
    }


    /**
     * 
     * Keyboard handlers
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
        first: "timeline",
        second: "editor",
        align: Align.Top,
        split: 20,
    }

    const components: Component[] = [
        {
            id: "editor",
            render: (size: Size) => (
                <Editor
                    {...size}
                    {...settings}
                    id="track-editor"
                    locators={getLocators()}
                    height={settings.grid.height / settings.quantize.height * tracks.length}
                    elements={partElements}
                    onChange={handleChange}
                    renderElement={props => (<Element {...props} key={props.id} active={false} />)}
                    generateId={uuid}
                />)
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


export default TrackEditor