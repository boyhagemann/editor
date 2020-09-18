import { Steps, Kind, HistoryAction, isHistoryAction } from "../reducers/history";
import { State } from "../reducers";
import { AnyAction } from "redux";
import { Type as EventType, remove, update, add } from "../reducers/events";
import { Type as PointerType } from "../reducers/pointer";
import { getEvent } from "../selectors/events";


const counterActions = (action: HistoryAction, state: State) => {

    switch (action.type) {

        case EventType.Add:
            return [remove([action.event.id])]

        case EventType.Update:
            return [update(action.id, getEvent(action.id)(state))]

        case EventType.Remove:
            return action.ids.map(id => add(getEvent(id)(state)))

        case PointerType.Move: {
            console.log({ action })
            return []
        }

        default:
            return []
    }

}

export const reduceActionToSteps = (state: State) => (steps: Steps, action: AnyAction): Steps => {

    if (!isHistoryAction(action)) return steps;

    return {
        ...steps,
        up: [...steps.up, action],
        down: [...steps.down, ...counterActions(action, state)]
    }
}

export const toSteps = (kind: Kind, actions: AnyAction[], state: State): Steps => actions.reduce<Steps>(reduceActionToSteps(state), {
    kind,
    time: Date.now(),
    up: [],
    down: []
})