'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ApiService } from '../lib/api'
import Navigation from './Navigation'
import JobCard from './JobCard'
import EmployeeCard from './EmployeeCard'
import ProfileSection from './ProfileSection'

export default function Dashboard() {
  const { 
    user, 
    userRole, 
    currentLanguage, 
    currentJobs, 
    currentEmployees,
    userJobs,
    favoriteJobs,
    dispatch 
  } = useApp()

  const [activeSection, setActiveSection] = useState('home')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'general',
    phone: '',
    businessType: ''
  })
  const [postingJob, setPostingJob] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [jobsResponse, employeesResponse] = await Promise.all([
        ApiService.getJobs(),
        ApiService.getEmployees()
      ])

      if (jobsResponse.success) {
        dispatch({ type: 'SET_JOBS', payload: jobsResponse.jobs || [] })
      }

      if (employeesResponse.success) {
        dispatch({ type: 'SET_EMPLOYEES', payload: employeesResponse.employees || [] })
      }

      if (userRole === 'employer' && user?._id) {
        try {
          const userJobsResponse = await ApiService.getEmployerJobs(user._id)
          if (userJobsResponse.success) {
            dispatch({ type: 'SET_USER_JOBS', payload: userJobsResponse.jobs || [] })
          }
        } catch (error) {
          console.error('Error loading user jobs:', error)
          // Fallback: filter from all jobs
          const filteredUserJobs = currentJobs.filter(job => 
            job.employerId === user._id || 
            job.employerName === user.name
          )
          dispatch({ type: 'SET_USER_JOBS', payload: filteredUserJobs })
        }
      }

      // Load favorites from localStorage only on client side
      if (typeof window !== 'undefined') {
        const storedFavorites = localStorage.getItem('favoriteJobs')
        if (storedFavorites) {
          try {
            dispatch({ type: 'SET_FAVORITES', payload: JSON.parse(storedFavorites) })
          } catch (error) {
            console.error('Error parsing favorites:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (jobId) => {
    const job = currentJobs.find(j => j._id === jobId)
    if (!job) return

    const isFavorite = favoriteJobs.some(fav => fav._id === jobId)
    let newFavorites

    if (isFavorite) {
      newFavorites = favoriteJobs.filter(fav => fav._id !== jobId)
    } else {
      newFavorites = [...favoriteJobs, job]
    }

    dispatch({ type: 'SET_FAVORITES', payload: newFavorites })
    
    // Only save to localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteJobs', JSON.stringify(newFavorites))
    }
  }

  // ... rest of the component remains the same, but make sure all window/localStorage usage is wrapped in typeof window checks

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeSection === 'home' && renderHomeSection()}
            {activeSection === 'jobs' && renderJobsSection()}
            {activeSection === 'favorites' && renderFavoritesSection()}
            {activeSection === 'post' && renderPostJobSection()}
            {activeSection === 'employees' && renderEmployeesSection()}
            {activeSection === 'profile' && <ProfileSection />}
          </>
        )}
      </main>
    </div>
  )
}
