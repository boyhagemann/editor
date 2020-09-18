import { useReducer, useEffect, useRef, useCallback } from "react"
import transportReducer, { defaultState, play, stop, record, reset, Transport, setBpm, setPlayingAt, setStartedAt, toggleCycle, setCycleStart, setCycleEnd } from '../reducers/transport'
import context from "../utils/audio";
import { Locators } from "../reducers/locators";

export interface WithTransport extends Transport {
    play: () => void,
    stop: () => void,
    record: () => void,
    reset: () => void,
    setBpm: (bpm: number) => void
    setPlayingAt: (time: number) => void
    setStartedAt: (time: number) => void
    setCycleStart: (time?: number) => void
    setCycleEnd: (time?: number) => void
    toggleCycle: () => void
}


export default (initialState: Transport): WithTransport => {

    const [state, dispatch] = useReducer(transportReducer, { ...defaultState, ...initialState });

    const ref = useRef<number>()

    const { bpm, startedAt, playing, playingAt, cycle, start, end } = state

    const update = useCallback(() => {

        if (!playing) return

        const seconds = context.currentTime - startedAt;
        const time = seconds * (bpm / 60)

        if (start && end && cycle && playingAt < end && time >= end) {
            dispatch(setStartedAt(context.currentTime))
            // dispatch(setPlayingAt(start.time))
            dispatch(setPlayingAt(start - (time - end)))
        }
        else {
            dispatch(setPlayingAt(time))
        }

        ref.current = requestAnimationFrame(update)

    }, [startedAt, playing, playingAt, cycle, start, end])


    useEffect(() => {

        // Start the context time if not started
        if (context.state === "suspended") {
            context.resume()
            console.log("resume")
        }

        ref.current = requestAnimationFrame(update)

        return () => {
            ref.current && cancelAnimationFrame(ref.current)
        }

    }, [playing, playingAt, update])


    return {
        ...state,
        play: () => dispatch(play()),
        stop: () => dispatch(stop(2)),
        record: () => dispatch(record()),
        reset: () => dispatch(reset()),
        setBpm: (bpm: number) => dispatch(setBpm(bpm)),
        setPlayingAt: (time: number) => dispatch(setPlayingAt(time)),
        setStartedAt: (time: number) => dispatch(setStartedAt(time)),
        setCycleStart: (time?: number) => dispatch(setCycleStart(time)),
        setCycleEnd: (time?: number) => dispatch(setCycleEnd(time)),
        toggleCycle: () => dispatch(toggleCycle())
    }
}