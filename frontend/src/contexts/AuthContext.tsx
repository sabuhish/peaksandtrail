import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/auth'
import { api } from '@/lib/api'
import type { LoginCredentials, RegisterData, User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser(token)
          setUser(currentUser)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error) {
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [token])

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    const newToken = response.access_token
    setToken(newToken)
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    const currentUser = await authService.getCurrentUser(newToken)
    setUser(currentUser)
  }

  const register = async (data: RegisterData) => {
    await authService.register(data)
    await login({ username: data.username, password: data.password })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
