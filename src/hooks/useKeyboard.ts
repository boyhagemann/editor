import { useReducer, useState } from "react"
import keyboardReducer, { State, defaultState, Add, add, Remove, remove, Set, set } from '../reducers/keyboard'
import { ActionCreator } from "redux";

interface Result {
    playing: boolean,
    active: State,
    setPlaying: (playing: boolean) => void,
    add: (value: number) => void,
    remove: (value: number) => void,
    set: (values: number[]) => void,
}

export default (): Result => {
    const [state, dispatch] = useReducer(keyboardReducer, defaultState);
    const [playing, setPlaying] = useState<boolean>(false)


    return {
        playing,
        active: playing ? state : [],
        setPlaying,
        add: (value) => dispatch(add(value)),
        remove: (value) => dispatch(remove(value)),
        set: (values) => dispatch(set(values)),
    }

}
