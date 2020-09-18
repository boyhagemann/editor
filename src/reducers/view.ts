import { ActionCreator, Action, AnyAction } from "redux";
import { Position } from "../types";

export enum Type {
    Scroll = "view.scroll",
    Zoom = "view.zoom"
}

export interface Scroll extends Action {
    type: Type.Scroll,
    offset: Position
}

export const scroll: ActionCreator<Scroll> = (offset) => ({
    type: Type.Scroll,
    offset
})

export interface Zoom extends Action {
    type: Type.Zoom,
    offset: Position
}

export const zoom: ActionCreator<Zoom> = (offset) => ({
    type: Type.Zoom,
    offset
})


export interface View {
    zoom: Position,
    offset: Position
}

const defaultState: View = {
    zoom: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
}

export default (state: View = defaultState, action: AnyAction) => {

    switch (action.type) {

        case Type.Scroll:

            console.log("test", action.offset)
            return {
                ...state, offset: {
                    x: state.offset.x + action.offset.x,
                    y: state.offset.y + action.offset.y,
                }
            }

        default:
            return state
    }

}
