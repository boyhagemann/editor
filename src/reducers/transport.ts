import { AnyAction, ActionCreator, Action } from "redux";
import context from "../utils/audio";


export enum Type {
    Play = "transport.play",
    Stop = "transport.stop",
    Record = "transport.record",
    Reset = "transport.reset",
    Bpm = "transport.bpm",
    PlayingAt = "transport.playingAt",
    StartedAt = "transport.startedAt",
    ToggleCycle = "transport.toggleCycle",
    CycleStart = "transport.cycle.start",
    CycleEnd = "transport.cycle.end"
}

export interface Transport {
    bpm: number,
    playing: boolean,
    recording: boolean,
    playingAt: number,
    startedAt: number
    cycle: boolean;
    start?: number;
    end?: number;
}

export interface Play extends Action {
    type: Type.Play,
}

export const play: ActionCreator<Play> = () => ({
    type: Type.Play,
})

export interface Stop extends Action {
    type: Type.Stop,
}

export const stop: ActionCreator<Stop> = () => ({
    type: Type.Stop,
})

export interface Record extends Action {
    type: Type.Record,
}

export const record: ActionCreator<Record> = () => ({
    type: Type.Record,
})

export interface Reset extends Action {
    type: Type.Reset,
}

export const reset: ActionCreator<Reset> = () => ({
    type: Type.Reset,
})

export interface SetBpm extends Action {
    type: Type.Bpm,
    bpm: number
}

export const setBpm: ActionCreator<SetBpm> = (bpm) => ({
    type: Type.Bpm,
    bpm
})

export interface SetPlayingAt extends Action {
    type: Type.PlayingAt,
    time: number
}

export const setPlayingAt: ActionCreator<SetPlayingAt> = (time) => ({
    type: Type.PlayingAt,
    time
})


export interface SetStartedAt extends Action {
    type: Type.StartedAt,
    time: number
}
export const setStartedAt: ActionCreator<SetStartedAt> = (time) => ({
    type: Type.StartedAt,
    time
})

export interface SetCycleStart extends Action {
    type: Type.CycleStart,
    time?: number
}
export const setCycleStart: ActionCreator<SetCycleStart> = (time) => ({
    type: Type.CycleStart,
    time
})

export interface SetCycleEnd extends Action {
    type: Type.CycleEnd,
    time?: number
}
export const setCycleEnd: ActionCreator<SetCycleEnd> = (time) => ({
    type: Type.CycleEnd,
    time
})

export interface ToggleCycle extends Action {
    type: Type.ToggleCycle
}
export const toggleCycle: ActionCreator<ToggleCycle> = () => ({
    type: Type.ToggleCycle
})


export const defaultState: Transport = {
    bpm: 120,
    playing: false,
    recording: false,
    playingAt: 0,
    startedAt: 0,
    cycle: false,
    start: undefined,
    end: undefined
}

export default (state: Transport = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Play:
            return { ...state, playing: true, startedAt: context.currentTime - state.playingAt / (state.bpm / 60) }

        case Type.Stop:
            return { ...state, playing: false, recording: false }

        case Type.Record:
            return { ...state, recording: true }

        case Type.Reset:
            return { ...state, playingAt: 0, startedAt: context.currentTime }

        case Type.Bpm:
            return { ...state, bpm: action.bpm }

        case Type.PlayingAt:
            return { ...state, playingAt: action.time }

        case Type.StartedAt:
            return { ...state, startedAt: action.time - state.playingAt / (state.bpm / 60) }

        case Type.ToggleCycle:
            return { ...state, cycle: !state.cycle }

        case Type.CycleStart:
            return { ...state, start: action.time }

        case Type.CycleEnd:
            return { ...state, end: action.time }

        default:
            return state
    }
}