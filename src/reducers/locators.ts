import { AnyAction, Action, ActionCreator } from "redux";

export enum Type {
    Set = "locators.set",
    Add = "locators.add",
    Remove = "locators.remove"
}

interface Set extends Action {
    type: Type.Set,
    locators: Locators
}

export const set: ActionCreator<Set> = (locators) => ({
    type: Type.Set,
    locators
})

interface Add extends Action {
    type: Type.Add,
    locator: Locator
}

export const add: ActionCreator<Add> = (locator) => ({
    type: Type.Add,
    locator
})

interface Remove extends Action {
    type: Type.Remove,
    id: Locator["id"]
}

export const remove: ActionCreator<Remove> = (id) => ({
    type: Type.Remove,
    id
})

export interface Locator {
    id: string,
    time: number
}

export type Locators = Locator[]

export const defaultState = [
    {
        id: "1",
        time: 2.5
    },
    {
        id: "2",
        time: 4.5
    }
]

export default (state: Locators = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Set:
            return action.locators

        case Type.Add:
            return [...state.filter(locator => locator.id !== action.locator.id), action.locator]

        case Type.Remove:
            return state.filter(locator => locator.id !== action.id)

        default:
            return state
    }
} 