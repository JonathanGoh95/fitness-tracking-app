import { Routes, Route } from 'react-router-dom'
import { SignUpPage } from './pages/SignUpPage'
import { SignInPage } from './pages/SignInPage'
import { Dashboard } from './pages/Dashboard'
import { WorkoutListPage } from './pages/WorkoutLIstPage'
import { WorkoutItem } from './components/WorkoutItem'
import { NavBar } from './components/NavBar'
import './App.css'
import { AddWorkoutPage } from './pages/AddWorkoutPage'
import { EditWorkoutPage } from './pages/EditWorkoutPage'

export const App = () => {

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/sign-up' element={<SignUpPage />}/>
        <Route path='/sign-in' element={<SignInPage />}/>
        <Route path='/' element={<Dashboard />}/>
        <Route path='/workouts' element={<WorkoutListPage />}/>
        <Route path='/workouts/:id' element={<WorkoutItem />}/>
        <Route path='/workouts/new' element={<AddWorkoutPage />}/>
        <Route path='/workouts/:id/edit' element={<EditWorkoutPage />}/>
      </Routes>
    </>
  )
}
