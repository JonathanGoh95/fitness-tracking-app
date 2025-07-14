import { userAtom } from "../atoms/userAtom";
import { useAtomValue, useAtom } from "jotai";
import type { FC } from "react";
import { useNavigate, useParams } from "react-router";
import { useWorkout } from "../hooks/useWorkout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "../services/workoutService";
import { deleteIdAtom } from "../atoms/deleteIdAtom";

export const WorkoutItem: FC = () => {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useAtom(deleteIdAtom);
  const { workoutId } = useParams();

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

  const { isLoading, error, data } = useWorkout(Number(workoutId))

  if (isLoading) return <span className="loading loading-spinner loading-xl"></span>

  if (error) return 'An error has occurred: ' + error.message
  
  const openDeleteModal = (id: number) => setDeleteId(id);
  const closeDeleteModal = () => setDeleteId(null);
  
  const handleEdit = (workoutId:number) => {
    navigate(`workouts/${workoutId}/edit`)
  }

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      closeDeleteModal();
    }
  }

  return (
  <>
  {user ? (
  <>
  <div className="hero bg-base-200 min-h-screen">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold">Workout Details</h1>
        <p className="py-6">{data?.workout_type}</p>
        <p className="py-6">{data?.category}</p>
        <p className="py-6">{data?.duration_mins}</p>
        <p className="py-6">{data?.calories_burned}</p>
        <p className="py-6">{data?.workout_date ? new Date(data.workout_date).toLocaleDateString() : ""}</p>
        <div className="flex gap-4">
          <button
            className="btn btn-warning mt-4"
            onClick={() => data?.id !== undefined && handleEdit(data.id)}
            disabled={data?.id === undefined}
          >
            Edit
          </button>
          <button
            className="btn btn-error mt-4"
            onClick={() => data?.id !== undefined && openDeleteModal(data?.id)}
            disabled={data?.id === undefined}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
    <dialog className="modal" open={deleteId !== null}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Workout Deletion</h3>
        <p className="py-4">This action cannot be undone. Are you sure you want to continue?</p>
      </div>
      <form method="dialog" className="modal-action flex justify-center gap-2">
        <button className="btn btn-error" type="button" onClick={handleDelete}>Delete Workout</button>
        <button className="btn btn-neutral" type="button" onClick={closeDeleteModal}>Close</button>
      </form>
    </dialog>
  </>
  ) : (
    <h1>Sign Up/Sign In to view your workouts!</h1>
  )}
  </>
  );
};
