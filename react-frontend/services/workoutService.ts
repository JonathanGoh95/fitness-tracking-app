import axios from 'axios'

const BASE_URL:string = 'http://localhost:5000'

const getWorkouts = async() => {
    try{
        const response = await axios.get(`${BASE_URL}/workouts`)
        return response.data
    }
    catch(error) {
        console.error('Error fetching workout data: ', error)
        throw error
    }
}

export { getWorkouts }