import { userAtom } from "../atoms/userAtom";
import { Link } from "react-router";
import { useAtomValue, useAtom } from "jotai";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "../services/workoutService";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
// import { useState } from "react";
import type { FC } from "react";

export const WorkoutListPage: FC = () => {
  const user = useAtomValue(userAtom)
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useAtom(deleteIdAtom);

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

  const { isLoading, error, data } = useWorkouts()

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
    <h1>Welcome, {user.username}</h1>
    {data?.length !== 0 ? (
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
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    {data?.map((w,idx)=>(
      <tr key={idx}>
          <th><Link to={`/workouts/${w.id}`}>{idx+1}</Link></th>
          <td>{w.duration_mins}</td>
          <td>{w.calories_burned}</td>
          {/* Date Formatting for Frontend */}
          <td>{new Date(w.workout_date).toLocaleDateString()}</td>
          <td>{w.workout_type_id}</td>
          <td>{w.category}</td>
          <td>
            <div className="flex gap-4">
              <button className="btn btn-warning mt-4" onClick={() => handleEdit(w.id)}>Edit</button>
              <button className="btn btn-error mt-4" onClick={() => openDeleteModal(w.id)}>Delete</button>
            </div>
          </td>
      </tr>
    ))}
    </tbody>
    </table>
    <div className="flex justify-center">
      <button className="btn btn-neutral" type="button" onClick={() => navigate("/workouts/new")}>Create New Workout</button>
    </div>
  </div>) : 
  (
    <h2>No Workout Data Found for {user.username}.</h2>
  )}
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
