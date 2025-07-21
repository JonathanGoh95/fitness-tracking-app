export interface Workout {
  id: number;
  user_id?: number;
  workout_type: string;
  duration_mins: number;
  calories_burned: number;
  workout_date: Date;
  category: string;
}

export interface FetchWorkout {
  id: number;
  user_id?: number;
  duration_mins: number;
  calories_burned: number;
  workout_date: Date;
  workout_type_id: number;
  workout_type: string;
  category_id: number;
  category: string;
}

export interface AddEditWorkout {
  user_id: number;
  workout_type_id: number;
  duration_mins: number;
  calories_burned: number;
  workout_date: string;
}
