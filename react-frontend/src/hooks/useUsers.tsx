import { useQuery } from "@tanstack/react-query";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { User } from "../types/user";
import { fetchUsers } from "../services/userService";

// Fetch all workouts
export const useUsers = () => {
  const user = useAtomValue(userAtom)

  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return fetchUsers(user.token)
    },
    enabled: !!user?.token,
    staleTime: 5000
  });
};
