import { userAtom } from "../atoms/userAtom";
import { useAtomValue, useAtom } from "jotai";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "../services/workoutService";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
import { totalCaloriesAtom } from "../atoms/totalCaloriesAtom";
import { totalDurationAtom } from "../atoms/totalDurationAtom";
import { BannerImage } from "../components/BannerImage";
import { useEffect, type FC } from "react";
import type { WorkoutListPageProps } from "../types/workoutlistprops";
import { useWorkoutsByUserId } from "../hooks/useWorkoutsByUserId";
import { useUsers } from "../hooks/useUsers";

export const WorkoutListPage: FC<WorkoutListPageProps> = ({ userId }) => {
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useAtom(deleteIdAtom);
  const [totalCalories, setTotalCalories] = useAtom(totalCaloriesAtom);
  const [totalDuration, setTotalDuration] = useAtom(totalDurationAtom);
  const { data: users } = useUsers(user?.token); // Fetch all users if admin

  // Find the user by userId if admin and userId is present
  const viewedUser = user?.user_role === "admin" && userId && Array.isArray(users)
    ? users.find(u => u.id === Number(userId))
    : user;


  const deleteMutation = useMutation({
    mutationFn: (workoutId: number) => {
      if (!user || !user.token) {
        return Promise.reject(new Error("User not authenticated"));
      }
      return deleteWorkout(user.token, workoutId);
    },
    onSuccess: () => {
      // Refetch workouts after deletion
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const { isLoading, error, data } = user?.user_role === "admin" && userId
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ? useWorkoutsByUserId(Number(userId))
      // eslint-disable-next-line react-hooks/rules-of-hooks
      : useWorkouts();

  const totalCal = Array.isArray(data)
    ? data.reduce((acc, workout) => acc + (workout.calories_burned || 0), 0)
    : 0;
  const totalDur = Array.isArray(data)
    ? data.reduce((acc, workout) => acc + (workout.duration_mins || 0), 0)
    : 0;

  useEffect(() => {
    setTotalCalories(totalCal);
    setTotalDuration(totalDur);
  }, [totalCal, totalDur, setTotalCalories, setTotalDuration]);

  if (isLoading)
    return (
      <div className="mt-6 flex justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (error) return (<h1 className="mt-6 text-center text-3xl italic">An error has occurred: {error.message}</h1>)

  const openDeleteModal = (id: number) => setDeleteId(id);
  const closeDeleteModal = () => setDeleteId(null);

  const handleEdit = (workoutId: number) => {
    navigate(`${workoutId}/edit`);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      closeDeleteModal();
    }
  };

  return (
    <>
      <BannerImage />
      {user ? (
        <div className="mx-auto max-w-6xl p-6">
          <div className="mb-6 flex flex-col items-center justify-self-center text-4xl font-bold italic">
            <h1>{viewedUser?.username
                ? `${viewedUser.username}'s Workouts`
                : "Workouts"}</h1>
          </div>
          {Array.isArray(data) && data.length !== 0 ? (
            <div className="overflow-x-auto">
              <table className="border-base-300 table w-full border">
                {/* head */}
                <thead className="bg-base-200">
                  <tr className="text-center">
                    <th>Workout ID</th>
                    <th>Workout Duration</th>
                    <th>Calories Burned</th>
                    <th>Workout Date</th>
                    <th>Workout Type</th>
                    <th>Workout Category</th>
                    {user?.user_role === "admin" && userId ? "" : <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data?.map((w) => (
                    <tr className="text-center" key={w.id}>
                      <th>{w.id}</th>
                      <td>
                        {w.duration_mins !== undefined
                          ? w.duration_mins >= 60
                            ? `${Math.floor(w.duration_mins / 60)} hr${Math.floor(w.duration_mins / 60) > 1 ? "s" : ""} ${w.duration_mins % 60} min${Math.floor(w.duration_mins % 60) > 1 ? "s" : ""}`
                            : `${w.duration_mins} mins`
                          : ""}
                      </td>
                      <td>{w.calories_burned}</td>
                      {/* Date Formatting for Frontend */}
                      <td>{new Date(w.workout_date).toLocaleDateString()}</td>
                      <td>{w.workout_type}</td>
                      <td>{w.category}</td>
                      {user?.user_role === "admin" && userId ? "" : 
                      <td><div className="flex gap-4">
                          <button
                            className="btn btn-soft mt-4"
                            onClick={() => navigate(`/workouts/${w.id}`)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-warning mt-4"
                            onClick={() => handleEdit(w.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error mt-4"
                            onClick={() => openDeleteModal(w.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center gap-6 py-4 text-xl font-bold italic">
                <p>Total Calories Burned: {totalCalories}</p>
                <p>
                  Total Workout Duration:{" "}
                  {totalDuration >= 60
                    ? `${Math.floor(totalDuration / 60)} hr${Math.floor(totalDuration / 60) > 1 ? "s" : ""} ${totalDuration % 60} min${Math.floor(totalDuration % 60) > 1 ? "s" : ""}`
                    : `${totalDuration} mins`}
                </p>
              </div>
              <div className="mt-2 flex justify-center gap-4">
                {user?.user_role === "admin" && userId ? "" : <button
                  className="btn btn-soft"
                  type="button"
                  onClick={() => navigate("/workouts/new")}
                >
                  Create New Workout
                </button>}
                <button
                  className="btn btn-soft"
                  type="button"
                  onClick={() => navigate(user?.user_role === "admin" && userId ? "/users" : "/")}
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="my-6 flex flex-col items-center gap-6 justify-self-center text-3xl italic">
              <p>No Workout Data Found for {viewedUser?.username ? `${viewedUser.username}` : ""}.</p>
              <button
                className="btn btn-soft"
                type="button"
                onClick={() => navigate(user?.user_role === "admin" && userId ? "/users": "/workouts/new")}
              >
                {user?.user_role === "admin" && userId ? "Back" : "Create New Workout"}
              </button>
            </div>
          )}
          <dialog
            className="modal"
            open={deleteId !== null}
            onClick={(e) => {
              // Only close if the user clicks the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                closeDeleteModal();
              }
            }}
          >
            <div className="modal-box text-center">
              <h3 className="text-xl font-bold">Confirm Workout Deletion</h3>
              <p className="py-4">
                This action cannot be undone. Are you sure you want to continue?
              </p>
              <form
                method="dialog"
                className="modal-action flex justify-center gap-2"
              >
                <button
                  className="btn btn-error"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete Workout
                </button>
                <button
                  className="btn btn-neutral"
                  type="button"
                  onClick={closeDeleteModal}
                >
                  Close
                </button>
              </form>
            </div>
          </dialog>
        </div>
      ) : (
        <div className="mt-6 flex justify-center text-3xl italic">
          <h1>Sign Up/Sign In to view your workouts!</h1>
        </div>
      )}
    </>
  );
};
