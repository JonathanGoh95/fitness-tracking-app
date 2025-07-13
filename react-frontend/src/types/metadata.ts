export type Category = { id: number; category_name: string };
export type WorkoutType = { id: number; workout_name: string; met_value: number; category_id: number };

export type WorkoutMetadata = {
  categories: Category[];
  workout_types: WorkoutType[];
};