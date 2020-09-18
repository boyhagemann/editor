import { AnyAction, ActionCreator, Action } from "redux";
import { Type as EventType, Add as AddEvent, Update as UpdateEvent, Remove as RemoveEvent } from "./events";
import { Type as PointerType, Move } from './pointer'

export enum Type {
    Undo = "history.undo",
    Redo = "history.redo",
    Add = "history.add",
    Remove = "history.remove"
}

export enum Kind {
    ProjectCreated = "ProjectCreated",
    MovedSelection = "MovedSelection",
    CopiedSelection = "CopiedSelection",
    RemovedSelection = "RemovedSelection",
}

export enum Direction {
    Up = "Up",
    Down = "Down"
}

export interface Steps {
    time: number,
    kind: Kind,
    up: AnyAction[],
    down: AnyAction[]
}

export interface Undo extends Action {
    type: Type.Undo
}

export const undo: ActionCreator<Undo> = () => ({
    type: Type.Undo,
})

export interface Redo extends Action {
    type: Type.Redo
}

export const redo: ActionCreator<Redo> = () => ({
    type: Type.Redo,
})

export interface Add extends Action {
    type: Type.Add,
    steps: Steps
}

export const add: ActionCreator<Add> = (steps) => ({
    type: Type.Add,
    steps
})

export interface Remove extends Action {
    type: Type.Remove,
    time: number
}

export const remove: ActionCreator<Remove> = (time) => ({
    type: Type.Remove,
    time
})



export type HistoryAction = AddEvent | UpdateEvent | RemoveEvent | Move

export const isHistoryAction = (action: AnyAction): action is HistoryAction => [
    ...Object.values(EventType),
    ...Object.values(PointerType),
].includes(action.type)

export type History = Steps[]


const defaultState: History = []

export default (state: History = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Add:
            return [...state, action.steps]

        case Type.Remove: {
            return state.filter(steps => steps.time < action.time)
        }

        default:
            return state
    }
}