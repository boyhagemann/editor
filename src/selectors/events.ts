import { State } from "../reducers";
import { createSelector } from "reselect";
import { Events } from "../reducers/events";
// import { getNoteOffEvent } from "../utils/notes";


export const getEvents = (state: State) => state.events.sort((a, b) => a.time - b.time)

export const getEvent = (id: string) => createSelector(
    getEvents,
    events => events.find(event => event.id === id)
)

// export const getNoteEvents = (ids: string[]) => createSelector(
//     getEvents,
//     events => {

//         const selection = events
//             .filter(event => ids.includes(event.id));

//         const noteEvents = selection.reduce<Events>((collection, noteOn) => {

//             const noteOff = noteOn ? getNoteOffEvent(noteOn, events) : undefined;

//             return noteOn && noteOff
//                 ? [...collection, noteOn, noteOff]
//                 : collection

//         }, [])

//         return noteEvents
//     }
// )