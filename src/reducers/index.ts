import { createStore, applyMiddleware, combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import notes, { Notes } from './notes';
import transport, { Transport } from './transport';
import tracks, { Tracks } from './tracks';
import events, { Events } from './events';
import pointer, { Pointer } from './pointer';
import selected, { Selected } from './selected';
import history, { History } from './history';
import view, { View } from './view';

// import DragNotes from "../middleware/DragNotes";
// import SpecialKeys from '../middleware/SpecialKeys';
// import SelectNotes from '../middleware/SelectNotes';
// import UndoRedo from '../middleware/UndoRedo';
// import RemoveHistory from '../middleware/RemoveHistory';
// import UpdatePlayingTime from '../middleware/UpdatePlayingTime';
// import RecordMidiEvents from '../middleware/RecordMidiEvents';


const persistConfig = {
    key: 'root',
    storage,
}

export interface State {
    notes: Notes,
    transport: Transport,
    view: View,
    tracks: Tracks,
    events: Events,
    pointer: Pointer,
    selected: Selected,
    history: History
}

const reducer = combineReducers({
    notes,
    transport,
    view,
    tracks,
    events,
    pointer,
    selected,
    history
})

const persistedReducer = persistReducer(persistConfig, reducer)

const middleware = applyMiddleware(
    // // DragNotes as any,
    // SpecialKeys as any,
    // // SelectNotes as any,
    // RemoveHistory as any,
    // UndoRedo as any,
    // UpdatePlayingTime as any,
    // RecordMidiEvents as any,
)

// export default createStore(reducer, middleware);

export default () => {

    const store = createStore(persistedReducer, middleware)
    const persistor = persistStore(store)

    return { store, persistor }
}