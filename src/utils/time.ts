import { Size } from "../types.d";
import { Settings } from "../hooks/useEditor";

export const mapTimeToX = (time: number, settings: Settings) => (time * settings.grid.width / settings.quantize.width)

export const mapXToTime = (x: number, grid: Size, quantize: Size) => (x / grid.width * quantize.width)