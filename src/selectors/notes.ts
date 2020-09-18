// import { createSelector } from "reselect";
// import { getEvents, getEvent } from "./events";
// import { getSettings } from "./settings";
// import { getSelected } from "./selected";
// import { transformToNotes, isNoteInBounds, getNoteOffEvent } from '../utils/notes'
// import { getBounds } from "./pointer";
// import { getTransport } from "./transport";
import { State } from "../reducers";

export const getNotes = (state: State) => state.notes;

// export const getNotes = createSelector(getEvents, getSettings, getSelected, getTransport, transformToNotes)

// export const getNoteIds = createSelector(getNotes, notes => notes.map(note => note.id))

// export const getSelectedNoteIds = createSelector(getNotes, getBounds, getSettings, (notes, bounds, settings) => {

//     return notes
//         // .filter(isNoteInBounds(bounds, settings))
//         .map(note => note.id)
// })

// export const getActiveNotes = createSelector(getNotes, getTransport, (notes, transport) => {

//     return notes.filter(note => note.on < transport.playingAt && note.off > transport.playingAt)

// })


// export const getNoteEvents = (id: string) => createSelector(
//     getEvents,
//     getEvent(id),
//     getTransport,
//     (events, noteOn) => {

//         const noteOff = noteOn ? getNoteOffEvent(noteOn, events) : undefined

//         return [noteOn, noteOff]
//     }
// )