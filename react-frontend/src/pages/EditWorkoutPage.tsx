import { WorkoutFormPage } from "./WorkoutFormPage";
import { useParams } from "react-router";

export const EditWorkoutPage = () => {
  const { workoutId } = useParams();
  const workoutIdNumber =
    workoutId !== undefined ? Number(workoutId) : undefined;
  return <WorkoutFormPage workoutId={workoutIdNumber} />;
};
