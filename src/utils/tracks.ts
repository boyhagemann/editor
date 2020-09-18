import { Track } from "../types.d";

export const isTrack = (value: any): value is Track => typeof value === "object" && value.id
