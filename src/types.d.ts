

export interface Position {
    x: number,
    y: number,
}

export interface Size {
    width: number,
    height: number
}


export interface Element extends Size, Position {
    id: string;
}

export type Selection = Element["id"][]

export interface Bounds extends Position, Size { }

export interface Note {
    id: string;
    on: number,
    off: number,
    value: number,
    velocity: number
}

export interface Track {
    id: string;
    name: string;
    order: number;
}

export interface Part {
    id: string;
    track: string;
    name: string;
    color: string;
    start: number;
    end: number;
}

export interface ComposedPart extends Part {
    track: Track
}

export interface Note {
    id: string;
    on: number,
    off: number,
    value: number,
    velocity: number
}

export interface Locator {
    id: string;
    time: number;
}

export enum Tool {
    Pointer = "pointer",
    Pencil = "pencil",
    Lasso = "lasso",
    Eraser = "eraser",
    Scissor = "scissor"
}

export enum Mode {
    Default = "default",
    Special = "special"
}

export enum Change {
    Add = "Add",
    Update = "Update",
    Remove = "Remove",
    Select = "Select",
}

export interface Add {
    type: Change.Add,
    element: Element
}

export interface Update {
    type: Change.Update,
    element: Element
}

export interface Remove {
    type: Change.Remove,
    element: Element
}

export interface Select {
    type: Change.Select,
    selection: Selection
}

export type ElementEvent = Add | Update | Remove
export type EditorEvent = Select
export type ChangeEvent = ElementEvent | EditorEvent

export enum Target {
    Grid = "Grid",
    Element = "Element"
}

export const isAddEvent = (change: AnyAction): change is Add => change.type === Change.Add
export const isUpdateEvent = (change: AnyAction): change is Update => change.type === Change.Update
export const isRemoveEvent = (change: AnyAction): change is Remove => change.type === Change.Remove

export const isElementEvent = (change: AnyAction): change is ElementEvent => [Change.Add, Change.Update, Change.Remove].includes(change.type)
export const isEditorEvent = (change: AnyAction): change is EditorEvent => [Change.Select].includes(change.type)
