export interface Workout {
  id: number;
  workout_type_id: number;
  duration_mins: number;
  calories_burned: number;
  workout_date: Date;
  category: string;
}

export interface AddWorkout {
  user_id: number;
  workout_type_id: number;
  duration_mins: number;
  calories_burned: number;
  workout_date: Date;
}