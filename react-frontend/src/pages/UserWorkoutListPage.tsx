import { WorkoutListPage } from "./WorkoutLIstPage";
import { useParams } from "react-router";

export const UserWorkoutListPage = () => {
  const { userId } = useParams();
  const userIdNumber = userId !== undefined ? Number(userId) : undefined;
  return <WorkoutListPage userId={userIdNumber} />;
};
