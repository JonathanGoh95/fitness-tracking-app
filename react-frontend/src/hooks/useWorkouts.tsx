import { useQuery } from '@tanstack/react-query'
import * as workoutService from '../../services/workoutService'

// Fetch all workouts
export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: workoutService.getWorkouts,
  })
}