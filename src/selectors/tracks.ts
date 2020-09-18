import { State } from "../reducers";
import { createSelector } from "reselect";


export const getTracks = (state: State) => state.tracks

export const getTrack = (id: string) => createSelector(
    getTracks,
    tracks => tracks.find(track => track.id === id)
)