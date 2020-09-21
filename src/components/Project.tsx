import React, { FC, useState, useReducer, useEffect, } from 'react'
import { useWindowSize } from '@react-hook/window-size'
import Compose, { Align, Component } from '../ui/Compose'
import { Size, Part, Tool, Mode, Track } from '../types.d'
import noteReducer, { NoteAction, batch, defaultState as defaultNotes, } from '../reducers/notes'
import locatorReducer, { add as addLocator, defaultState as defaultLocators, Locator } from '../reducers/locators'
import { defaultState as defaultTransport } from '../reducers/transport'
import Tools from '../ui/Tools'
import useTransport from '../hooks/useTransport'
import Transport from '../ui/Transport'
import keyboardJS from 'keyboardjs'
import { reduceNotesToMidiEvents, } from '../utils/notes'
import useScheduler from '../hooks/useScheduler'
import useSynth from '../hooks/useSynth'
import context from '../utils/audio'
import usePersist from '../hooks/usePersist'
import NoteEditor from './NoteEditor'


export interface Props { }

const Project: FC<Props> = () => {

    const [width, height] = useWindowSize();

    const defaultState = {
        notes: defaultNotes,
        transport: defaultTransport,
        locators: defaultLocators,
    }

    // Persist
    const [initialState, persist] = usePersist("test", defaultState)

    const [tool, setToolInProject] = useState(Tool.Pointer);

    // Locators
    const [locators, dispatchLocatorAction] = useReducer(locatorReducer, initialState.locators);

    // Notes
    const [notes, dispatchNoteAction] = useReducer(noteReducer, initialState.notes)

    // Transport
    const { bpm, playingAt, startedAt, playing, play, stop, cycle, reset: resetTransport, setBpm, setCycleStart, setCycleEnd, setPlayingAt, setStartedAt, toggleCycle } = useTransport(initialState.transport)

    // Synth
    const { addEvents, reset: resetSynth } = useSynth(64, bpm, startedAt);

    // Scheduler
    const { clear } = useScheduler({
        events: notes.reduce(reduceNotesToMidiEvents, []),
        active: playing,
        time: playingAt,
        onChange: addEvents
    })



    const stopPlayingNotes = () => {
        resetSynth();
        clear()
    }


    useEffect(() => {
        stopPlayingNotes()
    }, [notes])

    useEffect(() => {
        if (!playing || startedAt !== playingAt) {
            stopPlayingNotes()
        }
    }, [playing, startedAt])

    useEffect(() => {
        if (!playing) {
            stopPlayingNotes()
        }
    }, [playing])


    /**
     * Change the transport cycle start and end
     */
    useEffect(() => {

        // The start and end time of the loop
        const start = getStartLocator()
        const end = getEndLocator()

        setCycleStart(start?.time)
        setCycleEnd(end?.time)

    }, [locators])

    /**
     * Persist to local storage if any of these values change.
     */
    useEffect(() => {

        persist({
            notes,
            locators,
            transport: { startedAt, playingAt, cycle },
        })

    }, [notes, locators, startedAt, playingAt, cycle])



    const parts: Part[] = [
        {
            id: "part-1",
            track: "track-1",
            name: "part-1",
            color: "blue",
            start: 0,
            end: 5
        },
        {
            id: "part-2",
            track: "track-2",
            name: "part-2",
            color: "green",
            start: 2,
            end: 6
        },
    ]

    const tracks: Track[] = [
        {
            id: "track-1",
            name: "Test",
            order: 0,
        },
        {
            id: "track-2",
            name: "Test 2",
            order: 1,
        },
    ]


    /**
     * 
     * Selectors
     * 
     */
    const getLocators = () => [...locators, {
        id: "time",
        time: playingAt
    }]

    const findLocator = (id: string) => locators.find((locator: Locator) => locator.id === id)

    const getStartLocator = () => findLocator("1")
    const getEndLocator = () => findLocator("2")

    const start = findLocator("1")
    const endLocator = findLocator("2")

    /**
     * 
     * Helpers
     * 
     */

    const setLocator = (id: string, time: number) => {
        dispatchLocatorAction(addLocator({ id, time }))
    }

    const jumpToLocator = (id: string) => {
        const locator = findLocator(id)

        if (locator) {
            setPlayingAt(locator.time);
            setStartedAt(context.currentTime)
        }
    }

    /**
     * 
     * Handlers
     * 
     */
    const handleNotesChange = (changes: NoteAction[]) => dispatchNoteAction(batch(changes));

    const handleTimeLineChange = (time: number) => {
        setPlayingAt(time);
        setStartedAt(context.currentTime)
    }

    /**
     * 
     * Keyboard listeners
     * 
     */
    useEffect(() => {

        keyboardJS.bind("spacebar", (e) => {
            e?.preventDefault()
            playing ? stop() : play()
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

        return () => {
            keyboardJS.unbind("/")
            keyboardJS.unbind("spacebar")
            keyboardJS.unbind(".")
            keyboardJS.unbind("1")
            keyboardJS.unbind("2")
            keyboardJS.unbind("command+1")
            keyboardJS.unbind("command+2")
        }

        //     // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, playingAt, notes])



    const tree = {
        first: "tools",
        second: {
            second: {
                first: "note-editor",
                second: "transport",
                split: 20,
                align: Align.Bottom
            },
            split: 0,
            align: Align.Top
        },
        split: 20,
        align: Align.Top
    }


    const components: Component[] = [
        {
            id: "note-editor",
            render: (size: Size) => (
                <NoteEditor
                    {...size}
                    notes={notes}
                    locators={getLocators()}
                    onChange={handleNotesChange}
                    onTimeLineChange={handleTimeLineChange}
                    playingAt={playingAt}
                    playing={playing}
                    keys={{
                        shift: [
                            ({ setMode }) => setMode(Mode.Special),
                            ({ setMode }) => setMode(Mode.Default),
                        ],
                        left: ({ selected, moveSelection, transposeOffset, grid, quantize }) => selected.length
                            ? moveSelection({ x: -1 * grid.width / quantize.width, y: 0 })
                            : transposeOffset({ x: -1 * grid.width / quantize.width, y: 0 }),
                        right: ({ selected, moveSelection, transposeOffset, grid, quantize }) => selected.length
                            ? moveSelection({ x: 1 * grid.width / quantize.width, y: 0 })
                            : transposeOffset({ x: 1 * grid.width / quantize.width, y: 0 }),
                        up: ({ selected, moveSelection, transposeOffset, grid, quantize }) => selected.length
                            ? moveSelection({ x: 0, y: -1 * grid.height / quantize.height })
                            : transposeOffset({ x: 0, y: -1 * grid.height / quantize.height }),
                        down: ({ selected, moveSelection, transposeOffset, grid, quantize }) => selected.length
                            ? moveSelection({ x: 0, y: 1 * grid.height / quantize.height })
                            : transposeOffset({ x: 0, y: 1 * grid.height / quantize.height }),
                        "shift+left": ({ moveSelection, transposeOffset, selected, grid }) => selected.length
                            ? moveSelection({ x: -1 * grid.width, y: 0 })
                            : transposeOffset({ x: -1 * grid.width, y: 0 }),
                        "shift+right": ({ moveSelection, transposeOffset, selected, grid }) => selected.length
                            ? moveSelection({ x: 1 * grid.width, y: 0 })
                            : transposeOffset({ x: 1 * grid.width, y: 0 }),
                        "shift+up": ({ moveSelection, transposeOffset, selected, grid }) => selected.length
                            ? moveSelection({ x: 0, y: -1 * grid.height })
                            : transposeOffset({ x: 0, y: -1 * grid.height }),
                        "shift+down": ({ moveSelection, transposeOffset, selected, grid }) => selected.length
                            ? moveSelection({ x: 0, y: 1 * grid.height })
                            : transposeOffset({ x: 0, y: 1 * grid.height }),
                        "command+a": ({ selectAll }) => selectAll(),
                        "command+d": ({ duplicateSelection }) => duplicateSelection(),
                        "backspace": ({ deleteSelection }) => deleteSelection(),
                        "esc": ({ resetZoom, resetOffset, deselectAll }) => {
                            resetZoom()
                            resetOffset();
                            deselectAll();
                        },
                        "command+left": ({ multiplyZoom }) => multiplyZoom({ x: 1 / 1.2, y: 1 }),
                        "command+right": ({ multiplyZoom }) => multiplyZoom({ x: 1.2, y: 1 }),
                        "command+up": ({ multiplyZoom }) => multiplyZoom({ x: 1, y: 1 / 1.2 }),
                        "command+down": ({ multiplyZoom }) => multiplyZoom({ x: 1, y: 1.2 }),
                        "alt+1": ({ setTool }) => {
                            setToolInProject(Tool.Pointer)
                            setTool(Tool.Pointer)
                        },
                        "alt+2": ({ setTool }) => {
                            setToolInProject(Tool.Pencil)
                            setTool(Tool.Pencil)
                        },
                        "alt+3": ({ setTool }) => {
                            setToolInProject(Tool.Scissor)
                            setTool(Tool.Scissor)
                        },
                        "alt+4": ({ setTool }) => {
                            setToolInProject(Tool.Lasso)
                            setTool(Tool.Lasso)
                        },
                    }}
                />)
        },
        {
            id: "tools",
            render: (size: Size) => (
                <Tools {...size} active={tool} onChange={setToolInProject} />
            )
        },
        {
            id: "transport",
            render: (size: Size) => (
                <Transport {...size} playing={playing} cycle={cycle} onPlay={play} onStop={stop} onCycle={toggleCycle} />
            )
        },
    ]

    return (
        <Compose width={width} height={height} tree={tree} components={components} />
    )
}


export default Project