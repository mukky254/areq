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

  const handleJobFormChange = (field, value) => {
    setJobFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    
    if (userRole !== 'employer') {
      alert(currentLanguage === 'en' 
        ? 'Only employers can post jobs' 
        : 'Ni waajiri pekee wanaweza kutangaza kazi')
      return
    }

    const { title, description, location, category, phone, businessType } = jobFormData
    
    if (!title || !description || !location || !phone) {
      alert(currentLanguage === 'en' 
        ? 'Please fill in all required fields' 
        : 'Tafadhali jaza sehemu zote zinazohitajika')
      return
    }

    setPostingJob(true)
    try {
      const jobData = {
        title,
        description,
        location,
        category,
        phone,
        businessType: businessType || user?.name,
        employerId: user._id,
        employerName: user.name,
        language: currentLanguage
      }

      const response = await ApiService.postJob(jobData)

      if (response.success) {
        alert(currentLanguage === 'en' 
          ? 'Job posted successfully!' 
          : 'Kazi imetangazwa kikamilifu!')
        
        setJobFormData({
          title: '',
          description: '',
          location: '',
          category: 'general',
          phone: '',
          businessType: ''
        })

        // Reload jobs
        await loadInitialData()
        setActiveSection('home')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      alert(currentLanguage === 'en' 
        ? 'Failed to post job. Please try again.' 
        : 'Imeshindwa kutangaza kazi. Tafadhali jaribu tena.')
    } finally {
      setPostingJob(false)
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

  // ADD THE MISSING RENDER FUNCTIONS:

  const renderHomeSection = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 id="welcomeMessage">
          {currentLanguage === 'en' 
            ? `Welcome to Kazi Mashinani, ${user?.name}!` 
            : `Karibu Kazi Mashinani, ${user?.name}!`
          }
        </h1>
        <p id="welcomeDescription">
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

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h3 id="stat1" className="counter">{filteredJobs.length}</h3>
            <p id="stat1Label">{currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3 id="stat2" className="counter">{currentEmployees.length}</h3>
            <p id="stat2Label">{currentLanguage === 'en' ? 'Active Workers' : 'Wafanyikazi Walioajiriwa'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-content">
            <h3 id="stat3" className="counter">{userRole === 'employer' ? userJobs.length : '50+'}</h3>
            <p id="stat3Label">{currentLanguage === 'en' ? 'Business Partners' : 'Washirika Wa Biashara'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container">
        <div className="section-header">
          <i className="fas fa-bolt"></i>
          <h2>{currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo Vya Haraka'}</h2>
        </div>
        <div className="quick-actions-grid" id="quickActions">
          {userRole === 'employee' ? (
            <>
              <button className="action-btn" onClick={() => setActiveSection('jobs')}>
                <i className="fas fa-search"></i>
                <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
              </button>
              <button className="action-btn" onClick={() => setActiveSection('favorites')}>
                <i className="fas fa-heart"></i>
                <span>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</span>
              </button>
              <button className="action-btn" onClick={() => setActiveSection('profile')}>
                <i className="fas fa-user-edit"></i>
                <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
              </button>
            </>
          ) : (
            <>
              <button className="action-btn" onClick={() => setActiveSection('post')}>
                <i className="fas fa-plus"></i>
                <span>{currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}</span>
              </button>
              <button className="action-btn" onClick={() => setActiveSection('employees')}>
                <i className="fas fa-search"></i>
                <span>{currentLanguage === 'en' ? 'Find Workers' : 'Tafuta Wafanyikazi'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Professional Insights */}
      <div className="container">
        <div className="section-header">
          <i className="fas fa-chart-line"></i>
          <h2>{currentLanguage === 'en' ? 'Career Insights & Opportunities' : 'Uchambuzi Wa Kazi Na Fursa'}</h2>
        </div>
        
        <div className="insights-grid">
          {[
            {
              icon: 'fas fa-trending-up',
              title: currentLanguage === 'en' ? 'High-Demand Skills' : 'Ujuzi Unaohitajika',
              content: currentLanguage === 'en' 
                ? 'Agricultural and construction skills are in high demand' 
                : 'Ujuzi wa kilimo na ujenzi unaongezeka kwa sasa'
            },
            {
              icon: 'fas fa-handshake',
              title: currentLanguage === 'en' ? 'Building Trust' : 'Kujenga Uaminifu',
              content: currentLanguage === 'en' 
                ? 'Maintain clear communication for sustained employment' 
                : 'Weka mawasiliano madhubuti kwa ajira endelevu'
            }
          ].map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-icon">
                <i className={insight.icon}></i>
              </div>
              <div className="insight-title">{insight.title}</div>
              <div className="insight-content">{insight.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderJobsSection = () => (
    <div className="space-y-6">
      <div className="container">
        <div className="section-header">
          <i className="fas fa-briefcase"></i>
          <h2>{currentLanguage === 'en' ? 'Available Job Opportunities' : 'Fursa Za Kazi Zilizopo'}</h2>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <form className="search-form" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="form-group">
              <label>{currentLanguage === 'en' ? 'Search by Position' : 'Tafuta kwa Nafasi'}</label>
              <input 
                type="text" 
                id="positionSearch" 
                placeholder={currentLanguage === 'en' ? 'Search by job title...' : 'Tafuta kwa nafasi...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{currentLanguage === 'en' ? 'Filter by Location' : 'Chagua kwa Eneo'}</label>
              <input 
                type="text" 
                id="locationSearch" 
                placeholder={currentLanguage === 'en' ? 'Filter by location...' : 'Chagua kwa eneo...'}
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </div>
            <div>
              <button type="submit" className="btn-primary">
                <i className="fas fa-search"></i>
                <span>{currentLanguage === 'en' ? 'Search' : 'Tafuta'}</span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="job-grid" id="jobListings">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <JobCard 
                key={job._id} 
                job={job} 
                onToggleFavorite={toggleFavorite}
                isFavorite={favoriteJobs.some(fav => fav._id === job._id)}
              />
            ))
          ) : (
            <div className="message">
              <i className="fas fa-info-circle"></i>
              <span>
                {currentLanguage === 'en' 
                  ? 'No jobs available at the moment. Check back later!' 
                  : 'Hakuna kazi zinazopatikana kwa sasa. Angalia tena baadaye!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderFavoritesSection = () => (
    <div className="space-y-6">
      <div className="container">
        <div className="section-header">
          <i className="fas fa-heart"></i>
          <h2>{currentLanguage === 'en' ? 'Favorite Jobs' : 'Kazi Unazopenda'}</h2>
        </div>
        
        <div className="job-grid" id="favoritesListings">
          {favoriteJobs.length > 0 ? (
            favoriteJobs.map(job => (
              <JobCard 
                key={job._id} 
                job={job} 
                onToggleFavorite={toggleFavorite}
                isFavorite={true}
              />
            ))
          ) : (
            <div className="message">
              <i className="fas fa-info-circle"></i>
              <span>
                {currentLanguage === 'en' 
                  ? "You haven't added any jobs to favorites yet." 
                  : 'Hujaongeza kazi yoyote kwenye orodha ya vipendwa bado.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPostJobSection = () => (
    <div className="space-y-6">
      <div className="container">
        <div className="section-header">
          <i className="fas fa-plus-circle"></i>
          <h2>{currentLanguage === 'en' ? 'Post a Job Opportunity' : 'Tanga Fursa Ya Kazi'}</h2>
        </div>
        
        <form id="jobForm" onSubmit={handlePostJob}>
          <div className="form-group">
            <label>{currentLanguage === 'en' ? 'Job Title *' : 'Kichwa Cha Kazi *'}</label>
            <input 
              type="text" 
              id="jobTitle" 
              required 
              placeholder={currentLanguage === 'en' ? 'e.g., Farm Worker' : 'K.m. Mfanyakazi Shambani'}
              value={jobFormData.title}
              onChange={(e) => handleJobFormChange('title', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>{currentLanguage === 'en' ? 'Job Description *' : 'Maelezo Ya Kazi *'}</label>
            <textarea 
              id="jobDescription" 
              required 
              rows="4" 
              placeholder={currentLanguage === 'en' ? 'Describe the job responsibilities...' : 'Eleza majukumu ya kazi...'}
              value={jobFormData.description}
              onChange={(e) => handleJobFormChange('description', e.target.value)}
            ></textarea>
          </div>
          
          <div className="responsive-table">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Location *' : 'Eneo *'}</label>
                <input 
                  type="text" 
                  id="jobLocation" 
                  required 
                  placeholder={currentLanguage === 'en' ? 'e.g., Nairobi' : 'K.m. Nairobi'}
                  value={jobFormData.location}
                  onChange={(e) => handleJobFormChange('location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Category' : 'Aina'}</label>
                <select 
                  id="jobCategory"
                  value={jobFormData.category}
                  onChange={(e) => handleJobFormChange('category', e.target.value)}
                >
                  <option value="general">{currentLanguage === 'en' ? 'General' : 'Jumla'}</option>
                  <option value="agriculture">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                  <option value="construction">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="responsive-table">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Phone Number *' : 'Nambari ya Simu *'}</label>
                <input 
                  type="tel" 
                  id="jobPhone" 
                  required 
                  placeholder="0712345678"
                  value={jobFormData.phone}
                  onChange={(e) => handleJobFormChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Business Type' : 'Aina ya Biashara'}</label>
                <input 
                  type="text" 
                  id="businessType" 
                  placeholder={currentLanguage === 'en' ? 'e.g., Farm' : 'K.m. Shamba'}
                  value={jobFormData.businessType}
                  onChange={(e) => handleJobFormChange('businessType', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={postingJob}>
            <i className="fas fa-paper-plane"></i>
            {postingJob 
              ? (currentLanguage === 'en' ? 'Posting...' : 'Inatangaza...')
              : (currentLanguage === 'en' ? 'Post Job' : 'Tanga Kazi')
            }
          </button>
        </form>
      </div>
    </div>
  )

  const renderEmployeesSection = () => (
    <div className="space-y-6">
      <div className="container">
        <div className="section-header">
          <i className="fas fa-users"></i>
          <h2>{currentLanguage === 'en' ? 'Available Workers' : 'Wafanyikazi Walioopo'}</h2>
        </div>
        
        <div className="job-grid" id="employeeListings">
          {currentEmployees.length > 0 ? (
            currentEmployees.map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))
          ) : (
            <div className="message">
              <i className="fas fa-info-circle"></i>
              <span>
                {currentLanguage === 'en' 
                  ? 'No workers available at the moment.' 
                  : 'Hakuna wafanyikazi walioopo kwa sasa.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

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
      
      <main className="main-container">
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
