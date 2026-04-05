const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const fetchStats = async(userId: string)=>{
    //Fetch stats from backend and update state
    const response = await fetch(`${BACKEND_URL}/api/stats?userId=${userId}`, {
      method:'GET',
    }).then(res=>res.json());
    return response;
}

export const getCurrentLocationWhether = async()=>{
    //Fetch weather data from backend and update state
    const response = await fetch(`${BACKEND_URL}/api/weather`, {
      method:'GET',
    }).then(res=>res.json());

    return response;
}