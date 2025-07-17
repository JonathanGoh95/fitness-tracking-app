import { atom } from "jotai";
export const workoutDateAtom = atom<string>(new Date().toISOString().split("T")[0]);