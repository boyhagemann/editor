import { AnyAction, ActionCreator, Action } from "redux";

export enum Type {
    Add = "events.add",
    Update = "events.update",
    Remove = "events.remove",
}

export enum EventType {
    NoteOn = 144,
    NoteOff = 128
}

export interface Event {
    id: string
    track: string,
    time: number,
    data: [EventType, number, number]
}

export type Events = Event[]


export interface Add extends Action {
    type: Type.Add,
    event: Event
}

export const add: ActionCreator<Add> = (event) => ({
    type: Type.Add,
    event
})

export interface Update extends Action {
    type: Type.Update,
    id: string,
    data: Partial<Event>
}

export const update: ActionCreator<Update> = (id, data) => ({
    type: Type.Update,
    id,
    data
})

export interface Remove extends Action {
    type: Type.Remove,
    ids: string[]
}

export const remove: ActionCreator<Remove> = (ids) => ({
    type: Type.Remove,
    ids
})

const defaultState: Events = [
    {
        id: "1",
        track: "1",
        time: 0,
        data: [144, 5, 127]
    },
    {
        id: "2",
        track: "1",
        time: 1,
        data: [128, 5, 62],
    },
    {
        id: "3",
        track: "1",
        time: 3,
        data: [144, 7, 127]
    },
    {
        id: "4",
        track: "1",
        time: 4,
        data: [128, 7, 62],
    },
    // {
    //     id: "5",
    //     track: "1",
    //     time: 0,
    //     data: [144, 9, 127]
    // },
    // {
    //     id: "4",
    //     track: "1",
    //     time: 250,
    //     data: [128, 7, 62],
    // },
]

export default (state: Events = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Add:
            return [...state, action.event]

        case Type.Update:
            return state.map(event => action.id === event.id
                ? { ...event, ...action.data }
                : event
            )

        case Type.Remove:
            return state.filter(event => !action.ids.includes(event.id))

        default:
            return state
    }
}