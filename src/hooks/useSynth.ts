import context from '../utils/audio'
import { MidiEvent, MidiEventType } from "./useScheduler";
import { useState, useEffect } from "react";

interface Result {
    addEvents: (events: MidiEvent[]) => void;
    reset: () => void;
}



const buildEngine = (): Engine => {
    const osc = context.createOscillator();
    const env = context.createGain()
    const amp = context.createGain()

    osc.frequency.value = 100;
    osc.start();

    osc.connect(env);
    env.connect(amp);
    amp.connect(context.destination);

    env.gain.value = 0
    amp.gain.value = 0.05

    return { osc, env, amp };
}

interface Engine {
    osc: OscillatorNode,
    env: GainNode,
    amp: GainNode,
}

interface Carrier {
    values: number[],
    index: number
}

const handleOn = (event: MidiEvent, { osc, env }: Engine) => {

    const frequency = 440 * Math.pow(2, (event.data[1] - 60) / 12);
    const time = Math.max(event.time, context.currentTime)
    const attack = 0.3

    osc.frequency.setValueAtTime(frequency, time)

    env.gain.cancelScheduledValues(context.currentTime)
    env.gain.setValueCurveAtTime([0, 1], time, attack)

}

const handleOff = (event: MidiEvent, { osc, env }: Engine) => {

    const time = Math.max(event.time, context.currentTime)
    const release = 1

    env.gain.cancelScheduledValues(context.currentTime)
    env.gain.setValueCurveAtTime([env.gain.value, 0], time, release)

}

export default (voices: number, bpm: number, startedAt: number): Result => {

    const [index, setIndex] = useState<number>(0);
    const [values, setValues] = useState<number[]>([])
    const [stack, setStack] = useState<Engine[]>([])

    useEffect(() => {

        const range = Array.from(Array(voices));
        const stack = range.map(buildEngine)

        setStack(stack);

    }, [])

    useEffect(() => {

    }, [startedAt])


    const nextIndex = (index: number) => index < voices - 1 ? index + 1 : 0


    const handleEvent = ({ values, index }: Carrier, event: MidiEvent) => {

        switch (event.data[0]) {

            case MidiEventType.On: {

                handleOn(event, stack[index]);

                return {
                    values: Object.assign([...values], { [index]: event.data[1] }),
                    index: nextIndex(index)
                }
            }

            case MidiEventType.Off: {

                const valueIndex = values.findIndex(value => value === event.data[1])

                if (valueIndex < 0) return { values, index };

                handleOff(event, stack[valueIndex])

                return {
                    values: Object.assign([...values], { [valueIndex]: -1 }),
                    index
                }
            }

            default:
                return { values, index }
        }
    }

    const addEvents = (events: MidiEvent[]) => {

        const { values: newValues, index: newIndex } = events
            .sort((a, b) => a.data[0] - b.data[0])
            .map(event => ({
                ...event,
                time: (event.time / (bpm / 60)) + startedAt
            }))
            .reduce(handleEvent, { values, index })

        setValues(newValues)
        setIndex(newIndex)
    }

    const reset = () => {

        const { values: newValues } = values
            .filter(value => value >= 0)
            .map<MidiEvent>(value => ({
                id: "",
                time: context.currentTime,
                data: [MidiEventType.Off, value, 0]
            }))
            .reduce(handleEvent, { values, index })

        setValues(newValues)

    }

    return { addEvents, reset }
}