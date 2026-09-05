// TODO: API client with axios
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Configure axios instance with interceptors

export default axiosInstance;
