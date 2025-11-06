import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileAPI = {
  getAll: () => API.get('/profiles'),
  create: (profileData) => API.post('/profiles', profileData),
  getById: (id) => API.get(`/profiles/${id}`),
  updateTimezone: (id, timezone) => API.put(`/profiles/${id}/timezone`, { timezone })
};

// Event API functions
export const eventAPI = {
  getAll: () => API.get('/events'),
  create: (eventData) => API.post('/events', eventData),
  getById: (id, timezone) => API.get(`/events/${id}`, { 
    params: timezone ? { timezone } : {} 
  }),
  update: (id, eventData) => API.put(`/events/${id}`, eventData),
  getByProfile: (profileId, timezone) => API.get(`/events/profile/${profileId}`, { 
    params: timezone ? { timezone } : {} 
  }),
  getLogs: (id, timezone) => API.get(`/events/${id}/logs`, { 
    params: timezone ? { timezone } : {} 
  })
};

// Health check
export const healthAPI = {
  check: () => API.get('/health'),
  info: () => API.get('/info')
};

export default API;