import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for extracting error payloads cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard ProblemDetails parser for backend RFC 7807 exceptions
    const problemDetails = error.response?.data || {
      title: 'Network Error',
      status: error.response?.status || 500,
      detail: error.message || 'An unexpected connection error occurred.',
    };
    return Promise.reject(problemDetails);
  }
);
