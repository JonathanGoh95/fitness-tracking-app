import type { FC } from "react";
import { WorkoutFormPage } from "./WorkoutFormPage";
import { useParams } from "react-router-dom";

export const EditWorkoutPage: FC = () => {
  const { workoutId } = useParams();
  const workoutIdNumber = workoutId !== undefined ? Number(workoutId) : undefined;
  return <WorkoutFormPage workoutId={workoutIdNumber} />;
};
