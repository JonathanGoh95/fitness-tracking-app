import { userAtom } from "../atoms/userAtom";
import { useAtomValue, useAtom } from "jotai";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "../services/workoutService";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
// import { useState } from "react";
import type { FC } from "react";
import { BannerImage } from "../components/BannerImage";

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

  if (isLoading) return <div className="flex justify-center mt-6"><span className="loading loading-spinner loading-xl"></span></div>

  if (error) return 'An error has occurred: ' + error.message

  const openDeleteModal = (id: number) => setDeleteId(id);
  const closeDeleteModal = () => setDeleteId(null);

  const handleEdit = (workoutId:number) => {
    navigate(`${workoutId}/edit`)
  }

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      closeDeleteModal();
    }
  }

  return (
  <>
  <BannerImage />
  {user ? (
    <div className="max-w-6xl mx-auto p-6">
    <div className="flex flex-col justify-self-center items-center mb-6 text-4xl italic">
      <h1>{user.username}'s Workouts</h1>
    </div>
    {Array.isArray(data) && data.length !== 0 ? (
    <div className="overflow-x-auto rounded-lg shadow">
    <table className="table w-full border border-base-300">
    {/* head */}
    <thead>
      <tr className="text-center">
        <th>Workout ID</th>
        <th>Workout Duration</th>
        <th>Calories Burned</th>
        <th>Workout Date</th>
        <th>Workout Type</th>
        <th>Workout Category</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    {data?.map((w)=>(
      <tr className="text-center" key={w.id}>
          <th>{w.id}</th>
          <td>{w.duration_mins !== undefined
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
          <td>
            <div className="flex gap-4">
              <button className="btn btn-soft mt-4" onClick={() => navigate(`/workouts/${w.id}`)}>View</button>
              <button className="btn btn-warning mt-4" onClick={() => handleEdit(w.id)}>Edit</button>
              <button className="btn btn-error mt-4" onClick={() => openDeleteModal(w.id)}>Delete</button>
            </div>
          </td>
      </tr>
    ))}
    </tbody>
    </table>
    <div className="flex justify-center mt-4">
      <button className="btn btn-soft" type="button" onClick={() => navigate("/workouts/new")}>Create New Workout</button>
    </div>
  </div>) : 
  (
    <div className="flex flex-col items-center justify-self-center text-3xl italic my-6 gap-6">
      <p>No Workout Data Found for {user.username}.</p>
      <button className="btn btn-soft" type="button" onClick={() => navigate("/workouts/new")}>Create New Workout</button>
    </div>
  )}
  <dialog className="modal" open={deleteId !== null} onClick={e => {
      // Only close if the user clicks the backdrop, not the modal content
      if (e.target === e.currentTarget) {
        closeDeleteModal();
      }}}>
    <div className="modal-box text-center">
      <h3 className="font-bold text-xl">Confirm Workout Deletion</h3>
      <p className="py-4">This action cannot be undone. Are you sure you want to continue?</p>
    <form method="dialog" className="modal-action flex justify-center gap-2">
      <button className="btn btn-error" type="button" onClick={handleDelete}>Delete Workout</button>
      <button className="btn btn-neutral" type="button" onClick={closeDeleteModal}>Close</button>
    </form>
    </div>
  </dialog>
  </div>
  ) : (
    <div className="flex justify-center text-3xl mt-6 italic">
      <h1>Sign Up/Sign In to view your workouts!</h1>
    </div>
  )}
  </>
  );
};
