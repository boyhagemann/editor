import { State } from "../reducers";
import { createSelector } from "reselect";
import last from "lodash/fp/last";
import first from "lodash/fp/first";

export const getHistory = (state: State) => state.history

export const getLastSteps = createSelector(getHistory, history => last(history))

export const getStepsOn = (time: number) => createSelector(getHistory, history => history.find(steps => steps.time === time))

export const getStepsBefore = (time: number) => createSelector(getHistory, history => last(
    history.filter(steps => steps.time < time)
))

export const getStepsAfter = (time: number) => createSelector(getHistory, history => first(
    history.filter(steps => steps.time > time)
))