import { AnyAction } from "redux";
import { Track } from "../types.d";

export type Tracks = Track[]


const defaultState: Tracks = []

export default (state: Tracks = defaultState, action: AnyAction) => {

    switch (action.type) {

        default:
            return state
    }
}