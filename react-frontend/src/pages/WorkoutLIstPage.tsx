import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import { useWorkouts } from "../hooks/useWorkouts";
import type { FC } from "react";

export const WorkoutListPage: FC = () => {
  const user = useAtomValue(userAtom)

  const { isLoading, error, data } = useWorkouts()

  if (isLoading) return <progress className="progress progress-info w-56"/>

  if (error) return 'An error has occurred: ' + error.message

  return (
  <>
  {user ? (
    <>
    <h1>Welcome, {user.username}</h1>
    <div className="overflow-x-auto">
  <table className="table">
    {/* head */}
    <thead>
      <tr>
        <th>ID</th>
        <th>Workout Duration (mins)</th>
        <th>Calories Burned</th>
        <th>Workout Date</th>
        <th>Workout Type</th>
        <th>Workout Category</th>
      </tr>
    </thead>
    <tbody>
    {data?.map((w)=>(
      <tr>
        <th>{w.id}</th>
        <td>{w.duration_mins}</td>
        <td>{w.calories_burned}</td>
        <td>{w.workout_date.toLocaleDateString()}</td>
        <td>{w.workout_type}</td>
        <td>{w.category}</td>
      </tr>
    ))}
    </tbody>
  </table>
</div></>
  ) : (
    <h1>Sign Up/Sign In to create/view your workouts!</h1>
  )}
  </>);
};
