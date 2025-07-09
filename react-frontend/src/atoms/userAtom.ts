import { atomWithStorage } from "jotai/utils";
import type { User } from "../types/user";
// Initialize userAtom to a null state.
export const userAtom = atomWithStorage<User | null>('user', null);