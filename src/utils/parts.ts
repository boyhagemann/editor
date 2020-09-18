import { Element, ComposedPart, Track, Part } from "../types.d";
import { snapTo } from "./numbers";
import { isTrack } from "./tracks";
import { Settings } from "../hooks/useEditor";



export const composePart = (tracks: Track[]) => (part: Part) => {

    const track = tracks.find(track => track.id === part.track)

    return track ? { ...part, track } : undefined
}

export const isComposedPart = (value: any): value is ComposedPart => typeof value === "object" && isTrack(value.track)

export const mapPartToElement = ({ grid, quantize, offset }: Settings) => (part: ComposedPart): Element => {

    const width = grid.width / quantize.width;
    const height = grid.height / quantize.height;

    return {
        id: part.id,
        x: snapTo(part.start * width - offset.x, width),
        y: snapTo((part.track.order) * height - offset.y, height),
        width: snapTo((part.end - part.start) * width, width),
        height: height
    }
}