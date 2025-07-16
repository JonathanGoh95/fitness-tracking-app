import { userAtom } from "../atoms/userAtom";
import { useAtom, useAtomValue } from "jotai";
import { useWorkoutMetadata } from "../hooks/useWorkoutMetadata";
import { categoryAtom } from "../atoms/categoryIdAtom";
import { workoutTypeAtom } from "../atoms/workoutTypeIdAtom";
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
  const [selectedCategory, setSelectedCategory] = useAtom(categoryAtom)
  const [selectedWorkoutType, setSelectedWorkoutType] = useAtom(workoutTypeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [caloriesBurned, setCaloriesBurned] = useAtom(caloriesBurnedAtom); 
  const navigate = useNavigate()
  const isEditing= Boolean(workoutId)

  // Get user's weight (from user object) and fallback to a default value if not found
  const userWeight = user?.user_weight ?? 70;

  const { isLoading, error, data } = useWorkoutMetadata()

  // Derive unique categories from metadata
  const categories = data ? Array.from(
    data.reduce((acc, curr) => {
      acc.add(curr.category_name);
      return acc;
    }, new Set<string>())
  )
  : [];
        
  // Filter workout types by selected category
  const filteredWorkoutTypes = selectedCategory && data
  ? data.filter((wt) => wt.category_name === selectedCategory)
  : [];

  // If editing workout, fetch the workout and prefill/set atoms
  useEffect(() => {
    if (isEditing && workoutId && user?.token && data) {
      const fetchWorkout = async () => {
        const workout = await fetchOneWorkout(user?.token ?? "", workoutId)
        const workoutType = data.find((wt) => wt.id === workout.workout_type_id);
        setSelectedCategory(workoutType?.category_name ?? "");
        setSelectedWorkoutType(workoutType?.id? String(workoutType.id) : "");
        setDuration(workout.duration_mins);
      }
      fetchWorkout()
    }
    // eslint-disable-next-line
  }, [isEditing, workoutId, user?.token, data]);

  // Calculate calories burned when workout type or duration changes using useEffect
  useEffect(() => {
    if (selectedWorkoutType && duration > 0 && data) {
      const workoutType = data.find((wt) => String(wt.id) === selectedWorkoutType && wt.category_name === selectedCategory);
      if (workoutType) {
        // MET formula: MET * weight (kg) * duration (hours)
        const met = workoutType.met_value;
        const hours = duration / 60;
        setCaloriesBurned(Math.round(met * userWeight * hours));
      }
    } else {
      setCaloriesBurned(0);
    }
  }, [selectedWorkoutType, selectedCategory, duration, data, userWeight, setCaloriesBurned]);

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;
    // Find the selected workout type object to get its ID
    const workoutTypeObj = data.find(wt => String(wt.id) === selectedWorkoutType);
    if (!workoutTypeObj) {
      toast.error("Please select a valid workout type.");
      return;
    }
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
            value={selectedCategory ?? ""}
            onChange={e => {
              setSelectedCategory(e.target.value)
              setSelectedWorkoutType("")
            }}
          >
            <option value="" disabled>Select a workout category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="text-sm/6 font-medium text-white mt-2">Workout Type</label>
          <select 
            name="workout_type"
            className="select"
            required
            disabled={!selectedCategory}
            value={selectedWorkoutType ?? ""}
            onChange={e => setSelectedWorkoutType(e.target.value)}
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
    <div className="flex justify-center text-3xl mt-6 italic">
      <h1>Sign Up/Sign In to add/create your workout(s)!</h1>
    </div>
  )}
  </>
  );
};
