import { userAtom } from "../atoms/userAtom";
import { useAtomValue, useAtom } from "jotai";
import { useNavigate, useParams } from "react-router";
import { useWorkout } from "../hooks/useWorkout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "../services/workoutService";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
import { BannerImage } from "./BannerImage";

export const WorkoutItem = () => {
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

  const { isLoading, error, data } = useWorkout(Number(workoutId));

  if (isLoading)
    return (
      <div className="mt-6 flex justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (error)
    <h1 className="mt-6 text-center text-3xl italic">
      An error has occurred: {error.message}
    </h1>;

  const openDeleteModal = (id: number) => setDeleteId(id);
  const closeDeleteModal = () => setDeleteId(null);

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      closeDeleteModal();
      navigate("/workouts");
    }
  };

  return (
    <>
      <BannerImage />
      {user ? (
        <div className="flex justify-center">
          <div className="hero bg-base-200 mt-6 w-1/4 rounded-xl">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="py-4 text-5xl font-bold italic">
                  Workout Details
                </h1>
                <div className="flex justify-center gap-2 py-4">
                  <p className="text-xl font-bold">Workout Type:</p>
                  <p className="text-xl">{data?.workout_type}</p>
                </div>
                <div className="flex justify-center gap-2 py-4">
                  <p className="text-xl font-bold">Category:</p>
                  <p className="text-xl">{data?.category}</p>
                </div>
                <div className="flex justify-center gap-2 py-4">
                  <p className="text-xl font-bold">Duration:</p>
                  <p className="text-xl">
                    {data?.duration_mins !== undefined
                      ? data.duration_mins >= 60
                        ? `${Math.floor(data.duration_mins / 60)} hr${Math.floor(data.duration_mins / 60) > 1 ? "s" : ""} ${data.duration_mins % 60} min${Math.floor(data.duration_mins % 60) > 1 ? "s" : ""}`
                        : `${data.duration_mins} mins`
                      : ""}
                  </p>
                </div>
                <div className="flex justify-center gap-2 py-4">
                  <p className="text-xl font-bold">Calories Burned:</p>
                  <p className="text-xl">{data?.calories_burned}</p>
                </div>
                <div className="flex justify-center gap-2 py-4">
                  <p className="text-xl font-bold">Date of Workout:</p>
                  <p className="text-xl">
                    {data?.workout_date
                      ? new Date(data.workout_date).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                {data?.user_id === user?.id && (
                  <div className="flex justify-center gap-4">
                    <button
                      className="btn btn-warning mt-4"
                      onClick={() => navigate(`edit`)}
                      disabled={data?.id === undefined}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error mt-4"
                      onClick={() =>
                        data?.id !== undefined && openDeleteModal(data?.id)
                      }
                      disabled={data?.id === undefined}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-soft mt-4"
                      onClick={() => navigate("/workouts")}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
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
              <h3 className="text-lg font-bold">Confirm Workout Deletion</h3>
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
