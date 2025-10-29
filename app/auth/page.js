'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('employee')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [favorites, setFavorites] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    interviews: 0,
    profileViews: 0
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Check authentication first
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token || !userData) {
        router.push('/auth')
        return
      }

      const user = JSON.parse(userData)
      setUser(user)
      setUserRole(user.role)

      // Load real data from your backend
      const jobsResponse = await ApiService.getJobs()

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
        setStats(prev => ({ ...prev, totalJobs: jobsResponse.jobs?.length || 0 }))
      }

      // Load applications if endpoint exists
      try {
        const applicationsResponse = await ApiService.getMyApplications()
        if (applicationsResponse.success) {
          setApplications(applicationsResponse.applications || [])
          setStats(prev => ({ ...prev, appliedJobs: applicationsResponse.applications?.length || 0 }))
        }
      } catch (error) {
        console.log('Applications endpoint not available yet')
      }

      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('favoriteJobs')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }

      // Load language preference
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Don't redirect on error, just show empty state
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (jobId) => {
    const job = jobs.find(j => j._id === jobId)
    if (!job) return

    const isFavorite = favorites.some(fav => fav._id === jobId)
    let newFavorites

    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav._id !== jobId)
    } else {
      newFavorites = [...favorites, job]
    }

    setFavorites(newFavorites)
    localStorage.setItem('favoriteJobs', JSON.stringify(newFavorites))
  }

  const applyForJob = async (jobId) => {
    try {
      const response = await ApiService.applyForJob(jobId, {
        applicantId: user._id,
        coverLetter: 'Nina hamu ya kufanya kazi hii kwa bidii na uaminifu.'
      })

      if (response.success) {
        const job = jobs.find(j => j._id === jobId)
        const application = {
          id: response.application?._id || 'app-' + Date.now(),
          jobId,
          jobTitle: job?.title,
          appliedDate: new Date().toISOString(),
          status: 'pending',
          employer: job?.employer?.name || 'Mwajiri'
        }

        setApplications(prev => [...prev, application])
        setStats(prev => ({ ...prev, appliedJobs: prev.appliedJobs + 1 }))
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      // Fallback: add to local applications
      const job = jobs.find(j => j._id === jobId)
      const application = {
        id: 'app-' + Date.now(),
        jobId,
        jobTitle: job?.title,
        appliedDate: new Date().toISOString(),
        status: 'pending',
        employer: job?.employer?.name || 'Mwajiri'
      }
      setApplications(prev => [...prev, application])
      setStats(prev => ({ ...prev, appliedJobs: prev.appliedJobs + 1 }))
    }
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  const logout = () => {
    if (confirm(
      currentLanguage === 'en' 
        ? 'Are you sure you want to logout?' 
        : 'Una uhakika unataka kutoka?'
    )) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('favoriteJobs')
      router.push('/auth')
    }
  }

  // Don't render until mounted
  if (!mounted || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Inapakia...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Inaelekeza...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hands-helping"></i>
              <span>Kazi Mashinani</span>
            </div>
            
            <div className="user-menu">
              <div className="language-switcher" onClick={toggleLanguage}>
                <span>{currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}</span>
              </div>
              
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {userRole === 'employee' ? 'Mtafuta Kazi' : 'Mwajiri'}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={logout}
                className="btn"
                style={{ 
                  background: '#e74c3c', 
                  color: 'white',
                  padding: '8px 16px'
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Toka</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Rest of your dashboard JSX remains the same */}
      {/* ... */}
    </div>
  )
}
