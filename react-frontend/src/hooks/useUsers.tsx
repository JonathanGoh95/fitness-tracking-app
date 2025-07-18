import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/userService";

// Fetch all workouts
export const useUsers = (token: string | undefined) => {
  return useQuery({
    queryKey: ["users", token],
    queryFn: () => {
      if (!token) throw new Error("User not authenticated");
      return fetchUsers(token);
    },
    enabled: !!token,
    staleTime: 5000,
  });
};
