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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
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
        const userJobsResponse = await ApiService.getEmployerJobs(user._id)
        if (userJobsResponse.success) {
          dispatch({ type: 'SET_USER_JOBS', payload: userJobsResponse.jobs || [] })
        }
      }

      // Load favorites from localStorage
      const storedFavorites = localStorage.getItem('favoriteJobs')
      if (storedFavorites) {
        dispatch({ type: 'SET_FAVORITES', payload: JSON.parse(storedFavorites) })
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = currentJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !filterLocation || 
                           job.location?.toLowerCase().includes(filterLocation.toLowerCase())
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory
    
    return matchesSearch && matchesLocation && matchesCategory
  })

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
    localStorage.setItem('favoriteJobs', JSON.stringify(newFavorites))
  }

  const renderHomeSection = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="welcome-section bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-4">
            {currentLanguage === 'en' 
              ? `Welcome to Kazi Mashinani, ${user?.name}!` 
              : `Karibu Kazi Mashinani, ${user?.name}!`
            }
          </h1>
          <p className="text-xl opacity-90">
            {userRole === 'employee' 
              ? (currentLanguage === 'en' 
                  ? 'Find your perfect job opportunity in rural areas' 
                  : 'Tafuta fursa bora za kazi katika maeneo ya vijijini')
              : (currentLanguage === 'en' 
                  ? 'Find qualified workers for your business needs' 
                  : 'Tafuta wafanyikazi waliohitimu kwa mahitaji ya biashara yako')
            }
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600 hover-lift">
          <div className="flex items-center gap-4">
            <div className="stat-icon w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <i className="fas fa-briefcase text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">{filteredJobs.length}</h3>
              <p className="text-gray-600 font-semibold">
                {currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600 hover-lift">
          <div className="flex items-center gap-4">
            <div className="stat-icon w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600">{currentEmployees.length}</h3>
              <p className="text-gray-600 font-semibold">
                {currentLanguage === 'en' ? 'Active Workers' : 'Wafanyikazi Walioajiriwa'}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600 hover-lift">
          <div className="flex items-center gap-4">
            <div className="stat-icon w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <i className="fas fa-building text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-600">
                {userRole === 'employer' ? userJobs.length : '50+'}
              </h3>
              <p className="text-gray-600 font-semibold">
                {currentLanguage === 'en' ? 'Business Partners' : 'Washirika Wa Biashara'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <i className="fas fa-bolt text-yellow-500 text-xl"></i>
          <h2 className="text-xl font-bold text-blue-600">
            {currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo Vya Haraka'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userRole === 'employee' ? (
            <>
              <button 
                onClick={() => setActiveSection('jobs')}
                className="action-btn bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-search text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
              </button>
              <button 
                onClick={() => setActiveSection('favorites')}
                className="action-btn bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-heart text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</span>
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className="action-btn bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-user-edit text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveSection('post')}
                className="action-btn bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-plus text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}</span>
              </button>
              <button 
                onClick={() => setActiveSection('employees')}
                className="action-btn bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-search text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'Find Workers' : 'Tafuta Wafanyikazi'}</span>
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className="action-btn bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <i className="fas fa-chart-line text-lg group-hover:scale-110 transition-transform"></i>
                <span>{currentLanguage === 'en' ? 'View Analytics' : 'Angalia Takwimu'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderJobsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <i className="fas fa-briefcase text-blue-500 text-xl"></i>
          <h2 className="text-xl font-bold text-blue-600">
            {currentLanguage === 'en' ? 'Available Job Opportunities' : 'Fursa Za Kazi Zilizopo'}
          </h2>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder={currentLanguage === 'en' ? 'Search by position...' : 'Tafuta kwa nafasi...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder={currentLanguage === 'en' ? 'Filter by location...' : 'Chagua kwa eneo...'}
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{currentLanguage === 'en' ? 'All Categories' : 'Aina Zote'}</option>
            <option value="agriculture">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
            <option value="construction">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
            <option value="domestic">{currentLanguage === 'en' ? 'Domestic Work' : 'Kazi Ya Nyumbani'}</option>
          </select>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              onToggleFavorite={toggleFavorite}
              isFavorite={favoriteJobs.some(fav => fav._id === job._id)}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">
              {currentLanguage === 'en' 
                ? 'No jobs found matching your criteria.' 
                : 'Hakuna kazi zilizopatikana kulingana na vigezo vyako.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )

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
            {activeSection === 'profile' && <ProfileSection />}
            {/* Add other sections similarly */}
          </>
        )}
      </main>
    </div>
  )
}
