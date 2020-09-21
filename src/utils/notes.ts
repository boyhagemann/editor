import { Note, Bounds, ElementEvent, Change, Element } from "../types.d";
import { NoteAction, Type } from "../reducers/notes";
import { MidiEventType, MidiEvent } from "../hooks/useScheduler";
import { snapTo } from "./numbers";
import { Settings } from "../hooks/useEditor";

export type Notes = Note[];

// export const getUpperBounds = (notes: Notes): Bounds => {

//     const x = Math.min(...notes.map(note => note.on))
//     const y = Math.min(...notes.map(note => note.value))
//     const width = Math.max(...notes.map(note => note.off))
//     const height = Math.max(...notes.map(note => note.value + 1))

//     return { x, y, width, height }
// }


export const mapNoteToElement = ({ grid, quantize, offset, bounds }: Settings) => (note: Note): Element => {

    const width = grid.width / quantize.width;
    const height = grid.height / quantize.height;

    return {
        id: note.id,
        x: snapTo(note.on * width - offset.x, width),
        y: snapTo((bounds.height - note.value * height) - offset.y, height),
        width: snapTo((note.off - note.on) * width, width),
        height: height
    }
}

export const mapElementToNote = ({ grid, quantize, offset, bounds }: Settings) => (element: Element): Note => {

    const width = grid.width / quantize.width;
    const height = grid.height / quantize.height;

    return {
        id: element.id,
        on: (element.x + offset.x) / width,
        off: (element.x + element.width + offset.x) / width,
        value: (bounds.height - element.y + offset.y) / height,
        velocity: 127
    }
}

export const reduceNotesToMidiEvents = (events: MidiEvent[], note: Note): MidiEvent[] => {

    return [
        ...events,
        {
            id: `${note.id}--on`,
            time: note.on,
            data: [MidiEventType.On, note.value, note.velocity]
        },
        {
            id: `${note.id}--off`,
            time: note.off,
            data: [MidiEventType.Off, note.value, note.velocity]
        },
    ]
}

export const mapChangeToNoteAction = (settings: Settings) => (change: ElementEvent): NoteAction => {

    switch (change.type) {

        case Change.Add:
            return { type: Type.Add, note: mapElementToNote(settings)(change.element) }

        case Change.Update:
            return { type: Type.Update, id: change.element.id, data: mapElementToNote(settings)(change.element) }

        case Change.Remove:
            return { type: Type.Remove, id: change.element.id }

    }

}