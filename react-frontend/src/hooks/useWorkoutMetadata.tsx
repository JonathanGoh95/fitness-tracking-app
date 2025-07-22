import { useQuery } from "@tanstack/react-query";
import { getWorkoutMetadata } from "../services/metadataService";
import type { WorkoutMetadata } from "../types/metadata";

// Fetch all workouts
export const useWorkoutMetadata = () => {
  return useQuery<WorkoutMetadata>({
    queryKey: ["metadata"],
    queryFn: getWorkoutMetadata,
    staleTime: 5000,
  });
};
