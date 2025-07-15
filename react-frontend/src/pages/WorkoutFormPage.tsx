import { userAtom } from "../atoms/userAtom";
import { useAtom, useAtomValue } from "jotai";
import { useWorkoutMetadata } from "../hooks/useWorkoutMetadata";
import { categoryIdAtom } from "../atoms/categoryIdAtom";
import { workoutTypeIdAtom } from "../atoms/workoutTypeIdAtom";
import { durationAtom } from "../atoms/durationAtom";
import { caloriesBurnedAtom } from "../atoms/caloriesBurnedAtom";
import { useEffect, type FC } from "react";
import { addWorkout, fetchOneWorkout, updateWorkout } from "../services/workoutService";
import { useNavigate } from "react-router";
import type { AddEditWorkout } from "../types/workout";
import type { WorkoutFormPageProps } from "../types/workoutformprops";
import { toast } from "react-toastify";

export const WorkoutFormPage: FC<WorkoutFormPageProps> = ({workoutId}) => {
  const user = useAtomValue(userAtom)
  const [selectedWorkoutTypeId, setSelectedWorkoutTypeId] = useAtom(workoutTypeIdAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [caloriesBurned, setCaloriesBurned] = useAtom(caloriesBurnedAtom); 
  const navigate = useNavigate()
  const isEditing= Boolean(workoutId)

  // Get user's weight (from user object) and fallback to a default value if not found
  const userWeight = user?.user_weight ?? 70;

  const { isLoading, error, data } = useWorkoutMetadata()

  const [selectedCategoryId, setSelectedCategoryId] = useAtom(categoryIdAtom)

  // If editing workout, fetch the workout and prefill/set atoms
  useEffect(() => {
    if (isEditing && workoutId) {
      const fetchWorkout = async () => {
        const workout = await fetchOneWorkout(user?.token ?? "", workoutId)
        setSelectedCategoryId(workout.category_id);
        setSelectedWorkoutTypeId(workout.workout_type_id);
        setDuration(workout.duration_mins);
      }
      fetchWorkout()
    }
    }, [isEditing, workoutId, setSelectedCategoryId, setSelectedWorkoutTypeId, setDuration, user?.token]);

  // Calculate calories burned when workout type or duration changes using useEffect
  useEffect(() => {
    if (selectedWorkoutTypeId && duration > 0 && data) {
      const workoutType = data?.workout_types.find(wt => wt.id === selectedWorkoutTypeId);
      if (workoutType) {
        // MET formula: MET * weight (kg) * duration (hours)
        const met = workoutType.met_value;
        const hours = duration / 60;
        setCaloriesBurned(Math.round(met * userWeight * hours));
      }
    } else {
      setCaloriesBurned(0);
    }
  }, [selectedWorkoutTypeId, duration, data, userWeight, setCaloriesBurned]);

  // Filter workout types by selected category
  const filteredWorkoutTypes = selectedCategoryId
  ? data?.workout_types.filter(wt => wt.category_id === selectedCategoryId)
  : [];
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const workoutData:AddEditWorkout = {
      user_id: user?.id ?? 0,
      workout_type_id: Number(formData.get("workout_type")),
      duration_mins: Number(formData.get("duration")),
      calories_burned: Number(formData.get("calories_burned")),
      workout_date: new Date(formData.get("workout_date") as string),
    };
    try {
      if (isEditing && workoutId) {
        await updateWorkout(user?.token ?? "", workoutId, workoutData);
        toast.success("Workout Updated! Redirecting to Workouts...");
      } else {
        await addWorkout(user?.token ?? "", workoutData);
        toast.success("Workout Added! Redirecting to Workouts...");
      }
      setTimeout(() => navigate("/workouts"), 1500);
    } catch (err) {
      console.error("Failed to add/edit workout:", err);
      toast.error("Failed to add/edit workout: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (isLoading) return <span className="loading loading-spinner loading-xl"></span>

  if (error) return 'An error has occurred: ' + error.message

  return (
  <>
  {user ? (
    <div className="w-full max-w-lg px-4">
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">{isEditing ? "Edit Workout" : "Add a New Workout"}</legend>
          <label className="text-sm/6 font-medium text-white">Category</label>
          <select
            name="category"
            className="select"
            required
            value={selectedCategoryId ?? ""}
            onChange={e => {
              setSelectedCategoryId(Number(e.target.value))
              setSelectedWorkoutTypeId(null)
            }}
          >
            <option value="" disabled>Select a workout category</option>
            {data?.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>

          <label className="text-sm/6 font-medium text-white mt-2">Workout Type</label>
          <select 
            name="workout_type"
            className="select"
            required
            disabled={!selectedCategoryId}
            value={selectedWorkoutTypeId ?? ""}
            onChange={e => setSelectedWorkoutTypeId(Number(e.target.value))}
          >
            <option value="" disabled>Select a workout type</option>
            {filteredWorkoutTypes?.map(wt => (
              <option key={wt.id} value={wt.id}>{wt.workout_name}</option>
            ))}
          </select>

          <label className="text-sm/6 font-medium text-white">Duration (in mins)</label>
          <input
            type='number'
            name='duration'
            required
            className="input validator"
            placeholder="Input Workout Duration (at least 1)"
            min={1}
            title="Must be at least 1"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
          <p className="validator-hint">Value must be at least 1</p>

          <label className="text-sm/6 font-medium text-white">Workout Date</label>
          <input
            type="date"
            name="workout_date"
            className="input validator"
            required
            // Set defaultValue to today:
            defaultValue={new Date().toISOString().split("T")[0]}
            // Unable to select 'future' dates
            max={new Date().toISOString().split("T")[0]}
          />

          <label className="text-sm/6 font-medium text-white">Calories Burned</label>
            <input
              type="number"
              name="calories_burned"
              className="input"
              value={caloriesBurned}
              // No changes to be made
              readOnly
              // Not selectable via keyboard
              tabIndex={-1}
          />

          <button className="btn btn-neutral mt-4">{isEditing? "Edit" : "Add"} Workout</button>
      </fieldset>
    </form>
  </div>)
  : (
    <h1>Sign Up/Sign In to add/create your workout(s)!</h1>
  )}
  </>
  );
};
