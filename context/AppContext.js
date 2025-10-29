'use client'
import { createContext, useContext, useReducer, useEffect, useState } from 'react'

const AppContext = createContext()

const initialState = {
  user: null,
  token: null,
  userRole: null,
  currentLanguage: 'sw',
  darkMode: false,
  currentJobs: [],
  currentEmployees: [],
  userJobs: [],
  favoriteJobs: [],
  currentJobPage: 1,
  currentEmployeePage: 1,
  loading: false,
  error: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload.user,
        token: action.payload.token,
        userRole: action.payload.userRole,
        error: null
      }
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'SET_JOBS':
      return { ...state, currentJobs: action.payload }
    case 'SET_EMPLOYEES':
      return { ...state, currentEmployees: action.payload }
    case 'SET_USER_JOBS':
      return { ...state, userJobs: action.payload }
    case 'SET_FAVORITES':
      return { ...state, favoriteJobs: action.payload }
    case 'SET_JOB_PAGE':
      return { ...state, currentJobPage: action.payload }
    case 'SET_EMPLOYEE_PAGE':
      return { ...state, currentEmployeePage: action.payload }
    case 'LOGOUT':
      return { 
        ...initialState, 
        currentLanguage: state.currentLanguage,
        darkMode: state.darkMode
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const userRole = localStorage.getItem('userRole')
      const language = localStorage.getItem('preferredLanguage')
      const darkMode = localStorage.getItem('darkMode') === 'true'

      if (token && user) {
        try {
          dispatch({ 
            type: 'SET_USER', 
            payload: { 
              user: JSON.parse(user), 
              token, 
              userRole 
            } 
          })
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }

      if (language) {
        dispatch({ type: 'SET_LANGUAGE', payload: language })
      }

      if (darkMode) {
        dispatch({ type: 'TOGGLE_DARK_MODE' })
      }
    }
  }, [])

  useEffect(() => {
    // Only apply dark mode on client side
    if (mounted && typeof document !== 'undefined') {
      if (state.darkMode) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
    }
  }, [state.darkMode, mounted])

  const value = {
    ...state,
    dispatch,
    mounted
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
