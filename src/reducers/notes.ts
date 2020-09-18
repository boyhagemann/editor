import { Action, ActionCreator } from "redux";
import { Note } from "../types";

export enum Type {
    Add = "notes.add",
    Update = "notes.update",
    Remove = "notes.remove",
    Batch = "notes.batch",
}

export type Notes = Note[]


export interface Add extends Action {
    type: Type.Add,
    note: Note
}

export const add: ActionCreator<Add> = (note) => ({
    type: Type.Add,
    note
})

export interface Update extends Action {
    type: Type.Update,
    id: Note["id"],
    data: Partial<Note>
}

export const update: ActionCreator<Update> = (id, data) => ({
    type: Type.Update,
    id,
    data
})

export interface Remove extends Action {
    type: Type.Remove,
    id: Note["id"]
}

export const remove: ActionCreator<Remove> = (id) => ({
    type: Type.Remove,
    id
})

export interface Batch extends Action {
    type: Type.Batch,
    changes: NoteAction[]
}

export const batch: ActionCreator<Batch> = (changes) => ({
    type: Type.Batch,
    changes
})

export type NoteAction = Add | Update | Remove | Batch

export const defaultState: Notes = [
    {
        id: "1",
        on: 1,
        off: 3,
        value: 60,
        velocity: 127
    },
    {
        id: "2",
        on: 4,
        off: 5,
        value: 67,
        velocity: 127
    }
]

const reducer = (state: Notes = defaultState, action: NoteAction): Notes => {

    switch (action.type) {

        case Type.Add:
            return [...state, action.note]

        case Type.Update:
            return state.map(note => note.id === action.id
                ? { ...note, ...action.data }
                : note
            )

        case Type.Remove:
            return state.filter(note => note.id !== action.id)

        case Type.Batch:
            return action.changes.reduce<Notes>(reducer, state);

        default:
            return state
    }
}

export default reducer