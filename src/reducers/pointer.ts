import { Action, AnyAction, ActionCreator } from "redux";
import { Position, Size } from "../types";


export enum Type {
    Target = "pointer.target",
    Up = "pointer.up",
    Down = "pointer.down",
    Move = "pointer.move"
}

export interface Target extends Action {
    type: Type.Target,
    target: string,
    origin: Position & Size
}

export const target: ActionCreator<Target> = (target, origin) => ({
    type: Type.Target,
    target,
    origin
})

export interface Down extends Action {
    type: Type.Down,
    position: Position
}

export const down: ActionCreator<Down> = (position) => ({
    type: Type.Down,
    position
})

export interface Up extends Action {
    type: Type.Up
}

export const up: ActionCreator<Up> = () => ({
    type: Type.Up,
})

export interface Move extends Action {
    type: Type.Move
}

export const move: ActionCreator<Move> = (offset) => ({
    type: Type.Move,
    offset
})

export interface Pointer {
    target?: string,
    origin?: Position & Size,
    position?: Position,
    offset?: Position
}

const defaultState: Pointer = {
    target: undefined,
    origin: undefined,
    position: undefined,
    offset: undefined
}

export default (state: Pointer = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Target:
            return { ...state, target: action.target, origin: action.origin }

        case Type.Down:
            return { ...state, position: action.position }

        case Type.Move:
            return { ...state, offset: action.offset }

        case Type.Up:
            return defaultState

        default:
            return state
    }
}