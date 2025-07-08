import axios from 'axios'

const BASE_URL:string = 'http://localhost:5000'

const getWorkouts = async() => {
    return await axios.get(`${BASE_URL}/workouts`)
        .then(res => res.data)
        .catch(error => {
            console.error('Error fetching workout data: ', error)
            throw error
        })
}

export { getWorkouts }