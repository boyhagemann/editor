import { State } from "../reducers";
import { createSelector } from "reselect";
import transport from "../reducers/transport";


export const getTransport = (state: State) => state.transport

export const isPlaying = createSelector(getTransport, transport => transport.playing)
export const isRecording = createSelector(getTransport, transport => transport.recording)
export const isStartedAt = createSelector(getTransport, transport => transport.startedAt)
export const isPlayingAt = createSelector(getTransport, transport => transport.playingAt)