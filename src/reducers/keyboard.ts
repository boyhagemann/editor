import { ActionCreator } from "redux"

export enum Type {
    Set = "keyboard.set",
    Add = "keyboard.add",
    Remove = "keyboard.remove"
}

export interface Set {
    type: Type.Set,
    values: number[]
}

export const set: ActionCreator<Set> = (values) => ({
    type: Type.Set,
    values
})

export interface Add {
    type: Type.Add,
    value: number
}

export const add: ActionCreator<Add> = (value) => ({
    type: Type.Add,
    value
})

export interface Remove {
    type: Type.Remove,
    value: number
}

export const remove: ActionCreator<Remove> = (value) => ({
    type: Type.Remove,
    value
})

export type State = number[]

export const defaultState: State = []

export default (state: State = defaultState, action: Set | Add | Remove) => {

    switch (action.type) {

        case Type.Set:
            return action.values

        case Type.Add:
            return [...state, action.value]

        case Type.Remove:
            return state.filter(value => value !== action.value)

        default:
            return state
    }
}