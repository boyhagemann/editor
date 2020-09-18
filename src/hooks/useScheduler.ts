import { useState, useEffect } from "react"


export interface MidiEvent {
    id: string,
    time: number,
    data: [number, number, number]
}

export enum MidiEventType {
    On = 144,
    Off = 127
}

export interface Result {
    clear: () => void
}

interface Props {
    events: MidiEvent[],
    active: boolean,
    time: number,
    lookahead?: number,
    onChange: (events: MidiEvent[]) => void
}

export default ({ events, active, time, onChange, lookahead = 0.1 }: Props): Result => {

    const [scheduled, setScheduled] = useState<MidiEvent[]>([])

    useEffect(() => {

        const ready = events
            .filter(event => event.time >= time
                && event.time < time + lookahead
                && !scheduled.some(prev => prev.id === event.id))

        if (active && ready.length) {

            onChange(ready)

            setScheduled([...scheduled, ...ready])
        }

    }, [time, scheduled])

    return {
        clear: () => {
            setScheduled([])
        }
    }
}