import { useQuery } from "@tanstack/react-query";
import { fetchOneWorkout } from "../services/workoutService";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { FetchWorkout } from "../types/workout";

// Fetch all workouts
export const useWorkout = (workoutId: number) => {
  const user = useAtomValue(userAtom)

  return useQuery<FetchWorkout>({
    queryKey: ["workout", workoutId],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return fetchOneWorkout(user.token, workoutId)
    },
    enabled: !!user?.token,
    staleTime: 5000
  });
};
