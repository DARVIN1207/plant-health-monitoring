const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const api = {
  // Auth
  login: async (username, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  // Plants
  getPlants: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/plants${queryString ? '?' + queryString : ''}`);
  },

  getPlant: async (id) => {
    return apiCall(`/plants/${id}`);
  },

  createPlant: async (plantData) => {
    return apiCall('/plants', {
      method: 'POST',
      body: JSON.stringify(plantData)
    });
  },

  updatePlant: async (id, plantData) => {
    return apiCall(`/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plantData)
    });
  },

  // Health Logs
  getHealthLogs: async (plantId, days = null) => {
    const params = days ? { days } : {};
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/healthlogs/${plantId}${queryString ? '?' + queryString : ''}`);
  },

  createHealthLog: async (plantId, logData) => {
    return apiCall(`/healthlogs/${plantId}`, {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  },

  // Recommendations
  getRecommendations: async (plantId) => {
    return apiCall(`/recommendations/${plantId}`);
  },

  createRecommendation: async (recommendationData) => {
    return apiCall('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendationData)
    });
  },

  // Alerts
  getAlerts: async (plantId, status = null) => {
    const params = status ? { status } : {};
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/alerts/${plantId}${queryString ? '?' + queryString : ''}`);
  },

  createAlert: async (alertData) => {
    return apiCall('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }
};

// Check authentication and redirect if needed
const checkAuth = () => {
  const token = getToken();
  if (!token) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
};

// Logout function
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
};

