

type Values = Record<string, any>

export type Result = [Values, (values: Values) => void]

export default (key: string, initialState: Values) => {

    const values = localStorage.getItem(key);

    const initial = values ? JSON.parse(values) : initialState;

    const persist = (values: Values) => {
        localStorage.setItem(key, JSON.stringify(values));
    }

    return [
        initial,
        persist,
    ]
}