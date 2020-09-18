import { State } from "../reducers";
import { createSelector } from "reselect";
import { calculateBounds } from "../utils/selection";


export const getPointer = (state: State) => state.pointer

export const getBounds = createSelector(getPointer, ({ position, offset }) => {

    if (!position || !offset) return {
        position: {
            x: 0,
            y: 0,
        }, size: {
            width: 0,
            height: 0
        }
    }

    return calculateBounds(position, offset)
})

export const isSelecting = createSelector(getPointer, pointer => pointer.target === "grid" && pointer.position && pointer.offset)