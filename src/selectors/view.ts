import { State } from "../reducers";
import { createSelector } from "reselect";


export const getView = (state: State) => state.view

export const getOffset = createSelector(getView, view => view.offset)

export const getZoom = createSelector(getView, view => view.zoom)