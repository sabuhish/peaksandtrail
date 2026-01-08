import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<any>) => {
    // Handle network errors
    if (!error.response) {
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
      })
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Handle specific HTTP error codes
    switch (status) {
      case 400:
        toast({
          variant: 'destructive',
          title: 'Invalid Request',
          description: data?.detail || 'Please check your input and try again.',
        })
        break
      case 401:
        // Don't show toast for auth endpoints to avoid duplicate messages
        if (!error.config?.url?.includes('/auth/')) {
          toast({
            variant: 'destructive',
            title: 'Unauthorized',
            description: 'Your session has expired. Please log in again.',
          })
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
        }
        break
      case 403:
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to perform this action.',
        })
        break
      case 404:
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: data?.detail || 'The requested resource was not found.',
        })
        break
      case 409:
        toast({
          variant: 'destructive',
          title: 'Conflict',
          description: data?.detail || 'This resource already exists or conflicts with existing data.',
        })
        break
      case 422:
        // Validation errors
        const validationErrors = data?.detail
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors
            .map((err: any) => `${err.loc?.join(' → ')}: ${err.msg}`)
            .join('\n')
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: errorMessages || 'Please check your input.',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: data?.detail || 'Please check your input.',
          })
        }
        break
      case 500:
      case 502:
      case 503:
      case 504:
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: 'Something went wrong on the server. Please try again later.',
        })
        break
      default:
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data?.detail || data?.message || 'An unexpected error occurred.',
        })
    }

    return Promise.reject(error)
  }
)
