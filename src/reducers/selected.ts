import { AnyAction, ActionCreator, Action } from "redux";


export type Selected = string[]


export enum Type {
    Set = "selected.set",
    Add = "selected.add",
    Remove = "selected.remove",
    Clear = "selected.clear",
}

export interface Set extends Action {
    type: Type.Set,
    ids: string[]
}

export const set: ActionCreator<Set> = (ids) => ({
    type: Type.Set,
    ids
})

export interface Add extends Action {
    type: Type.Add,
    ids: string[]
}

export const add: ActionCreator<Add> = (ids) => ({
    type: Type.Add,
    ids
})
export interface Remove extends Action {
    type: Type.Remove,
    ids: string[]
}

export const remove: ActionCreator<Remove> = (ids) => ({
    type: Type.Remove,
    ids
})

export interface Clear extends Action {
    type: Type.Clear,
}

export const clear: ActionCreator<Clear> = () => ({
    type: Type.Clear
})


const defaultState: Selected = []

export default (state: Selected = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Set: {
            return action.ids
        }

        case Type.Add: {
            return Array.from(new Set([...state, ...action.ids]))
        }

        case Type.Remove: {
            return state.filter(id => !action.ids.includes(id))
        }

        case Type.Clear: {
            return []
        }

        default:
            return state
    }
}