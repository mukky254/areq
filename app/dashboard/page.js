'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService, AppUtils } from '../../lib/api'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [favorites, setFavorites] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: '',
    skills: ''
  })
  const [sideNavOpen, setSideNavOpen] = useState(false)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const router = useRouter()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        
        if (!token || !userData) {
          router.push('/auth')
          return
        }

        const user = JSON.parse(userData)
        setUser(user)
        setEditProfile({
          name: user.name || '',
          phone: user.phone || '',
          location: user.location || '',
          skills: user.skills || ''
        })

        // Load jobs, applications, and favorites
        const jobsData = await ApiService.getJobs()
        const appsData = await ApiService.getMyApplications()
        const favsData = await ApiService.getFavorites(user._id)

        if (jobsData.success) {
          setJobs(jobsData.jobs)
          setFilteredJobs(jobsData.jobs)
        }
        if (appsData.success) setApplications(appsData.applications)
        if (favsData.success) setFavorites(favsData.favorites)

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Apply search and filters
  useEffect(() => {
    const filtered = AppUtils.filterJobs(jobs, {
      searchQuery,
      category: selectedCategory,
      location: selectedLocation
    })
    setFilteredJobs(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, jobs])

  // Feature 1: Advanced Search & Filtering
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Feature 2: Smart Job Matching
  const getMatchingJobs = () => {
    if (!user?.skills) return filteredJobs
    const userSkills = user.skills.toLowerCase().split(',')
    return filteredJobs.filter(job => {
      if (!job.skills) return false
      const jobSkills = job.skills.map(s => s.toLowerCase())
      return userSkills.some(userSkill => 
        jobSkills.some(jobSkill => jobSkill.includes(userSkill))
      )
    })
  }

  // Feature 3: Quick Apply
  const quickApply = async (jobId) => {
    if (!user) return
    
    try {
      const response = await ApiService.applyForJob(jobId, {
        applicantId: user._id,
        applicantName: user.name,
        applicantPhone: user.phone,
        coverLetter: currentLanguage === 'en' 
          ? 'I am interested in this job' 
          : 'Nina hamu ya kufanya kazi hii'
      })

      if (response.success) {
        const job = jobs.find(j => j._id === jobId)
        const newApplication = {
          ...response.application,
          jobTitle: job?.title,
          employer: job?.employer?.name || 'Employer'
        }
        setApplications(prev => [...prev, newApplication])
        
        alert(currentLanguage === 'en' ? 'Application sent!' : 'Ombi limewasilishwa!')
      }
    } catch (error) {
      console.error('Apply error:', error)
      alert(currentLanguage === 'en' ? 'Failed to apply' : 'Imeshindwa kuomba')
    }
  }

  // Feature 4: Enhanced Favorites
  const toggleFavorite = async (jobId) => {
    if (!user) return
    
    try {
      const isFavorite = favorites.some(fav => fav.jobId === jobId)
      
      if (isFavorite) {
        await ApiService.removeFavorite(jobId, user._id)
        setFavorites(prev => prev.filter(fav => fav.jobId !== jobId))
      } else {
        await ApiService.saveFavorite(jobId, user._id)
        setFavorites(prev => [...prev, { jobId, userId: user._id }])
      }
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  // Feature 5: Job Sharing
  const shareJob = (job) => {
    const text = `${job.title} - ${job.location}\n${job.description}\nContact: ${job.phone}`
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: job.title,
        text: text
      })
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      alert(currentLanguage === 'en' ? 'Copied to clipboard!' : 'Imeigwa kwenye clipboard!')
    }
  }

  // Feature 6: Application Status Tracking
  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.jobId === jobId)
    return application ? application.status : 'not_applied'
  }

  // Feature 7: Profile Completeness
  const profileCompleteness = AppUtils.calculateProfileCompleteness(user)

  // Feature 8: Language Persistence
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLanguage)
    }
  }

  // Feature 9: Data Export
  const exportData = (type) => {
    let data, filename
    
    if (type === 'applications') {
      data = applications
      filename = 'my-applications.json'
    } else if (type === 'favorites') {
      data = favorites
      filename = 'my-favorites.json'
    } else {
      return
    }
    
    AppUtils.exportData(data, filename)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await ApiService.updateProfile(editProfile)
      if (response.success) {
        setUser(response.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        alert(currentLanguage === 'en' ? 'Profile updated!' : 'Wasifu umehakikishwa!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert(currentLanguage === 'en' ? 'Update failed' : 'Imeshindwa kusasisha')
    }
  }

  const logout = () => {
    if (confirm(currentLanguage === 'en' ? 'Logout?' : 'Toka?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
      router.push('/auth')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedLocation('')
    setShowFilters(false)
  }

  const matchingJobs = getMatchingJobs()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>{currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}</p>
      </div>
    )
  }

  if (!user) {
    return null
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
              <button onClick={toggleLanguage} className="language-btn">
                {currentLanguage === 'en' ? 'EN' : 'SW'}
              </button>
              
              <button 
                className="menu-btn"
                onClick={() => setSideNavOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      {sideNavOpen && (
        <div className="overlay show" onClick={() => setSideNavOpen(false)}></div>
      )}
      
      <div className={`side-nav ${sideNavOpen ? 'open' : ''}`}>
        <div className="side-nav-header">
          <h3>{currentLanguage === 'en' ? 'Menu' : 'Menyu'}</h3>
          <button className="close-btn" onClick={() => setSideNavOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="side-nav-content">
          <a href="/blog" className="side-nav-item" onClick={() => setSideNavOpen(false)}>
            <i className="fas fa-info-circle"></i>
            <span>{currentLanguage === 'en' ? 'About' : 'Kuhusu'}</span>
          </a>
          
          <a href="tel:+254790528837" className="side-nav-item" onClick={() => setSideNavOpen(false)}>
            <i className="fas fa-phone"></i>
            <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
          </a>
          
          <a href="mailto:myhassan19036@gmail.com" className="side-nav-item" onClick={() => setSideNavOpen(false)}>
            <i className="fas fa-envelope"></i>
            <span>Email</span>
          </a>

          <div className="side-nav-section">
            <h4>{currentLanguage === 'en' ? 'Export' : 'Pakua'}</h4>
            <button onClick={() => exportData('applications')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</span>
            </button>
            <button onClick={() => exportData('favorites')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</span>
            </button>
          </div>

          <button onClick={logout} className="side-nav-item logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>{currentLanguage === 'en' ? 'Logout' : 'Toka'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Home Section */}
          {activeSection === 'home' && (
            <div>
              <div className="card welcome-card">
                <div className="card-header">
                  <h1>{currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user.name}!</h1>
                  <p>{currentLanguage === 'en' 
                    ? 'Find your next opportunity' 
                    : 'Tafuta fursa yako ijayo'}</p>
                  
                  {/* Profile Completeness */}
                  <div className="profile-completeness">
                    <div className="completeness-header">
                      <span>{currentLanguage === 'en' ? 'Profile Complete' : 'Wasifu Kamili'}</span>
                      <span>{profileCompleteness}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${profileCompleteness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{jobs.length}</h3>
                    <p>{currentLanguage === 'en' ? 'Jobs' : 'Kazi'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon success">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{applications.length}</h3>
                    <p>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon warning">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{favorites.length}</h3>
                    <p>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3>{currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}</h3>
                </div>
                <div className="card-body">
                  <div className="quick-actions">
                    <button onClick={() => setActiveSection('jobs')} className="quick-action-btn">
                      <i className="fas fa-search"></i>
                      <span>{currentLanguage === 'en' ? 'Find Jobs' : 'Tafuta Kazi'}</span>
                    </button>
                    <button onClick={() => setActiveSection('profile')} className="quick-action-btn">
                      <i className="fas fa-user-edit"></i>
                      <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div>
              {/* Search Header */}
              <div className="card search-header">
                <div className="card-body">
                  <div className="search-container">
                    <div className="search-input-group">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder={currentLanguage === 'en' ? 'Search jobs...' : 'Tafuta kazi...'}
                        className="search-input"
                      />
                    </div>
                    
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-filter"></i>
                      {currentLanguage === 'en' ? 'Filters' : 'Chuja'}
                    </button>
                  </div>

                  {/* Filters Panel */}
                  {showFilters && (
                    <div className="filters-panel">
                      <div className="filter-group">
                        <label>{currentLanguage === 'en' ? 'Category' : 'Aina'}</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="all">{currentLanguage === 'en' ? 'All' : 'Zote'}</option>
                          <option value="kilimo">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                          <option value="ujenzi">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                          <option value="nyumbani">{currentLanguage === 'en' ? 'Domestic' : 'Nyumbani'}</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label>{currentLanguage === 'en' ? 'Location' : 'Eneo'}</label>
                        <input
                          type="text"
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          placeholder={currentLanguage === 'en' ? 'Location...' : 'Eneo...'}
                        />
                      </div>

                      <div className="filter-actions">
                        <button onClick={clearFilters} className="btn btn-outline">
                          {currentLanguage === 'en' ? 'Clear' : 'Futa'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="search-results-info">
                    <p>
                      {currentLanguage === 'en' 
                        ? `Found ${filteredJobs.length} jobs` 
                        : `Imepata kazi ${filteredJobs.length}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Matching Banner */}
              {matchingJobs.length > 0 && matchingJobs.length < filteredJobs.length && (
                <div className="card matching-banner">
                  <div className="card-body">
                    <div className="banner-content">
                      <i className="fas fa-lightbulb"></i>
                      <div>
                        <h4>{currentLanguage === 'en' ? 'Matching Jobs' : 'Kazi Zinalingana'}</h4>
                        <p>
                          {currentLanguage === 'en' 
                            ? `${matchingJobs.length} jobs match your skills` 
                            : `Kazi ${matchingJobs.length} zinalingana na ujuzi wako`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              <div className="jobs-list">
                {filteredJobs.map(job => {
                  const isFavorite = favorites.some(fav => fav.jobId === job._id)
                  const applicationStatus = getApplicationStatus(job._id)
                  
                  return (
                    <div key={job._id} className="job-card">
                      <div className="job-header">
                        <div className="job-title-section">
                          <h3>{job.title}</h3>
                          <div className="job-meta">
                            <span className="category-badge">{job.category}</span>
                          </div>
                        </div>
                        <div className="job-actions">
                          <button
                            onClick={() => toggleFavorite(job._id)}
                            className={`icon-btn ${isFavorite ? 'favorited' : ''}`}
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                          <button
                            onClick={() => shareJob(job)}
                            className="icon-btn"
                          >
                            <i className="fas fa-share-alt"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="job-body">
                        <p className="job-description">{job.description}</p>
                        
                        <div className="job-details-grid">
                          <div className="job-detail">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{job.location}</span>
                          </div>
                          <div className="job-detail">
                            <i className="fas fa-building"></i>
                            <span>{job.businessType}</span>
                          </div>
                          {job.salary && (
                            <div className="job-detail">
                              <i className="fas fa-money-bill-wave"></i>
                              <span>{job.salary}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="job-footer">
                        <div className="job-contact">
                          <a href={`tel:${job.phone}`} className="btn btn-primary">
                            <i className="fas fa-phone"></i>
                            {currentLanguage === 'en' ? 'Call' : 'Piga'}
                          </a>
                          
                          {/* Smart Apply Button */}
                          <button
                            onClick={() => quickApply(job._id)}
                            className={`btn ${
                              applicationStatus === 'pending' ? 'btn-warning' :
                              applicationStatus === 'accepted' ? 'btn-success' :
                              applicationStatus === 'rejected' ? 'btn-danger' : 'btn-secondary'
                            }`}
                            disabled={applicationStatus !== 'not_applied'}
                          >
                            <i className="fas fa-paper-plane"></i>
                            {applicationStatus === 'not_applied' 
                              ? (currentLanguage === 'en' ? 'Apply' : 'Omba')
                              : applicationStatus === 'pending' 
                                ? (currentLanguage === 'en' ? 'Pending' : 'Inasubiri')
                                : applicationStatus === 'accepted'
                                  ? (currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa')
                                  : (currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa')
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div className="card">
              <div className="card-body">
                <h2>
                  <i className="fas fa-file-alt"></i> 
                  {currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'} 
                  ({applications.length})
                </h2>
                
                {applications.length > 0 ? (
                  <div className="applications-list">
                    {applications.map(application => (
                      <div key={application._id} className="application-item">
                        <div className="app-header">
                          <h4>{application.jobTitle}</h4>
                          <span className={`status ${application.status}`}>
                            {application.status === 'pending' ? (currentLanguage === 'en' ? 'Pending' : 'Inasubiri') :
                             application.status === 'accepted' ? (currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa') :
                             (currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa')}
                          </span>
                        </div>
                        <p>{currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}: {application.employer}</p>
                        <small>{new Date(application.appliedDate).toLocaleDateString()}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-file-alt"></i>
                    <h3>{currentLanguage === 'en' ? 'No Applications' : 'Hakuna Maombi'}</h3>
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="btn btn-primary"
                    >
                      {currentLanguage === 'en' ? 'Find Jobs' : 'Tafuta Kazi'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && user && (
            <div className="card">
              <div className="card-body">
                <div className="profile-header">
                  <div className="user-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.location}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>{currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}</label>
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{currentLanguage === 'en' ? 'Phone' : 'Simu'}</label>
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{currentLanguage === 'en' ? 'Location' : 'Eneo'}</label>
                    <input
                      type="text"
                      value={editProfile.location}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{currentLanguage === 'en' ? 'Skills' : 'Ujuzi'}</label>
                    <input
                      type="text"
                      value={editProfile.skills}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder={currentLanguage === 'en' ? 'e.g. farming, construction' : 'K.m. kilimo, ujenzi'}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    {currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Kazi Mashinani &copy; 2025</p>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-content">
          {[
            { id: 'home', icon: 'fa-home', label: { en: 'Home', sw: 'Nyumbani' } },
            { id: 'jobs', icon: 'fa-briefcase', label: { en: 'Jobs', sw: 'Kazi' } },
            { id: 'applications', icon: 'fa-file-alt', label: { en: 'Applications', sw: 'Maombi' } },
            { id: 'profile', icon: 'fa-user', label: { en: 'Profile', sw: 'Wasifu' } }
          ].map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={`fas ${section.icon}`}></i>
              <span>{currentLanguage === 'en' ? section.label.en : section.label.sw}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
