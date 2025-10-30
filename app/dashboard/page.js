'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { AppUtils } from '../../lib/utils'

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
    skills: '',
    experience: ''
  })
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  
  // Feature: Search and Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Feature: Support System
  const [supportMessage, setSupportMessage] = useState('')
  const [showSupport, setShowSupport] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
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
        skills: user.skills || '',
        experience: user.experience || ''
      })

      // Load all data
      const [jobsResponse, applicationsResponse, favoritesResponse] = await Promise.all([
        ApiService.getJobs(),
        ApiService.getMyApplications(),
        ApiService.getFavorites(user._id)
      ])

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
        setFilteredJobs(jobsResponse.jobs || [])
      }
      if (applicationsResponse.success) setApplications(applicationsResponse.applications || [])
      if (favoritesResponse.success) setFavorites(favoritesResponse.favorites || [])

      // Load notifications
      const savedNotifications = AppUtils.getNotifications()
      setNotifications(savedNotifications)
      setUnreadNotifications(savedNotifications.filter(n => !n.read).length)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Feature 1: Advanced Search & Filtering
  useEffect(() => {
    const filters = { searchQuery, category: selectedCategory, location: selectedLocation }
    const filtered = AppUtils.filterJobs(jobs, filters)
    setFilteredJobs(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, jobs])

  // Feature 2: Smart Job Matching
  const matchingJobs = AppUtils.getMatchingJobs(filteredJobs, user?.skills)

  // Feature 3: Quick Apply
  const quickApply = async (jobId) => {
    try {
      const response = await ApiService.applyForJob(jobId, {
        applicantId: user._id,
        applicantName: user.name,
        applicantPhone: user.phone,
        coverLetter: currentLanguage === 'en' 
          ? 'I am interested in this job opportunity.' 
          : 'Nina hamu ya kufanya kazi hii.'
      })

      if (response.success) {
        const job = jobs.find(j => j._id === jobId)
        const application = {
          ...response.application,
          jobTitle: job?.title,
          employer: job?.employer?.name || 'Mwajiri'
        }

        setApplications(prev => [...prev, application])
        AppUtils.addNotification(
          currentLanguage === 'en' 
            ? `Application sent for ${job?.title}` 
            : `Ombi limewasilishwa kwa ${job?.title}`,
          'success'
        )
        loadDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Failed to submit application' : 'Imeshindwa kutuma ombi',
        'error'
      )
    }
  }

  // Feature 4: Enhanced Favorites
  const toggleFavorite = async (jobId) => {
    try {
      const isFavorite = favorites.some(fav => fav.jobId === jobId)
      
      if (isFavorite) {
        await ApiService.removeFavorite(jobId, user._id)
        setFavorites(prev => prev.filter(fav => fav.jobId !== jobId))
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Removed from favorites' : 'Imeondolewa kwenye vipendwa',
          'info'
        )
      } else {
        await ApiService.saveFavorite(jobId, user._id)
        setFavorites(prev => [...prev, { jobId, userId: user._id, _id: 'fav-' + Date.now() }])
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Added to favorites' : 'Imeongezwa kwenye vipendwa',
          'success'
        )
      }
      loadDashboardData() // Refresh favorites
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Feature 5: Job Sharing
  const shareJob = (job) => {
    const jobText = `${job.title}\n📍 ${job.location}\n📞 ${job.phone}\n\n${job.description}`
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: jobText,
      })
    } else {
      navigator.clipboard.writeText(jobText)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Job details copied!' : 'Maelezo yameigwa!',
        'success'
      )
    }
  }

  // Feature 6: Application Status Tracking
  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.jobId === jobId)
    return application ? application.status : 'not_applied'
  }

  // Feature 7: Profile Completeness
  const profileCompleteness = AppUtils.calculateProfileCompleteness(user)

  // Feature 8: Recent Activity Feed
  const recentActivities = AppUtils.getRecentActivities(applications, favorites, jobs, currentLanguage)

  // Feature 9: Support System
  const submitSupportRequest = async () => {
    if (!supportMessage.trim()) return

    try {
      const response = await ApiService.contactSupport({
        userId: user._id,
        userName: user.name,
        message: supportMessage,
        type: 'general'
      })

      if (response.success) {
        setSupportMessage('')
        setShowSupport(false)
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Support request sent' : 'Ombi la usaidizi limetumwa',
          'success'
        )
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Failed to send support request' : 'Imeshindwa kutuma ombi la usaidizi',
        'error'
      )
    }
  }

  // Feature 10: Language Persistence
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
    AppUtils.addNotification(
      newLanguage === 'en' ? 'Language changed to English' : 'Lugha imebadilishwa kuwa Kiswahili',
      'info'
    )
  }

  // Feature 11: Data Export
  const exportData = (type) => {
    let data, filename
    
    if (type === 'applications') {
      data = applications
      filename = 'my-applications.json'
    } else if (type === 'favorites') {
      data = favorites.map(fav => {
        const job = jobs.find(j => j._id === fav.jobId)
        return job ? { ...job, savedDate: fav._id } : null
      }).filter(Boolean)
      filename = 'my-favorites.json'
    } else {
      data = { user, applications, favorites }
      filename = 'my-data.json'
    }
    
    AppUtils.exportData(data, filename)
    AppUtils.addNotification(
      currentLanguage === 'en' ? 'Data exported successfully' : 'Data imepakuliwa',
      'success'
    )
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await ApiService.updateProfile(editProfile)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Profile updated successfully' : 'Wasifu umehakikishwa',
          'success'
        )
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Failed to update profile' : 'Imeshindwa kusasisha wasifu',
        'error'
      )
    }
  }

  const logout = () => {
    if (confirm(currentLanguage === 'en' ? 'Are you sure you want to logout?' : 'Una uhakika unataka kutoka?')) {
      localStorage.clear()
      router.push('/auth')
    }
  }

  const openSideNav = () => setSideNavOpen(true)
  const closeSideNav = () => setSideNavOpen(false)

  // Feature 12: Clear Filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedLocation('')
    setShowFilters(false)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>{currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header with Enhanced Features */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hands-helping"></i>
              <span>Kazi Mashinani</span>
            </div>
            
            <div className="user-menu">
              {/* Feature 13: Notification Bell */}
              <div className="notification-bell">
                <button 
                  onClick={() => setActiveSection('notifications')}
                  className="icon-btn"
                >
                  <i className="fas fa-bell"></i>
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>
              </div>

              <button onClick={toggleLanguage} className="language-btn">
                {currentLanguage === 'en' ? 'EN' : 'SW'}
              </button>
              
              {/* Feature 14: Quick Support Access */}
              <button 
                onClick={() => setShowSupport(true)}
                className="support-btn"
              >
                <i className="fas fa-question-circle"></i>
              </button>

              <button className="menu-btn" onClick={openSideNav}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Side Navigation */}
      <div className={`overlay ${sideNavOpen ? 'show' : ''}`} onClick={closeSideNav}></div>
      
      <div className={`side-nav ${sideNavOpen ? 'open' : ''}`}>
        <div className="side-nav-header">
          <h3>{currentLanguage === 'en' ? 'Quick Links' : 'Viungo vya Haraka'}</h3>
          <button className="close-btn" onClick={closeSideNav}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="side-nav-content">
          <a href="/blog" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-info-circle"></i>
            <span>{currentLanguage === 'en' ? 'About' : 'Kuhusu'}</span>
          </a>
          
          <a href="tel:+254790528837" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-phone"></i>
            <span>{currentLanguage === 'en' ? 'Call Us' : 'Tupe Simu'}</span>
          </a>
          
          <a href="mailto:myhassan19036@gmail.com" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-envelope"></i>
            <span>{currentLanguage === 'en' ? 'Email' : 'Barua Pepe'}</span>
          </a>

          {/* Feature 15: Data Export in Side Nav */}
          <div className="side-nav-section">
            <h4>{currentLanguage === 'en' ? 'Export Data' : 'Pakua Data'}</h4>
            <button onClick={() => exportData('applications')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'}</span>
            </button>
            <button onClick={() => exportData('favorites')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'My Favorites' : 'Vipendwa'}</span>
            </button>
          </div>

          <button onClick={logout} className="side-nav-item logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>{currentLanguage === 'en' ? 'Logout' : 'Toka'}</span>
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{currentLanguage === 'en' ? 'Get Help' : 'Pata Usaidizi'}</h3>
              <button onClick={() => setShowSupport(false)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder={currentLanguage === 'en' 
                  ? 'Describe your issue...' 
                  : 'Eleza tatizo lako...'}
                rows="4"
              />
              <div className="modal-actions">
                <button onClick={submitSupportRequest} className="btn btn-primary">
                  {currentLanguage === 'en' ? 'Send' : 'Tuma'}
                </button>
                <button onClick={() => setShowSupport(false)} className="btn btn-secondary">
                  {currentLanguage === 'en' ? 'Cancel' : 'Ghairi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Home Section */}
          {activeSection === 'home' && (
            <div>
              {/* Feature 16: Welcome Card with Profile Completeness */}
              <div className="card welcome-card">
                <div className="card-header">
                  <div className="welcome-content">
                    <h1>{currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!</h1>
                    <p>{currentLanguage === 'en' 
                      ? 'Your job search journey starts here' 
                      : 'Safari yako ya kutafuta kazi inaanza hapa'}</p>
                    
                    {/* Profile Completeness */}
                    <div className="profile-completeness">
                      <div className="completeness-header">
                        <span>{currentLanguage === 'en' ? 'Profile Completeness' : 'Ukamilifu wa Wasifu'}</span>
                        <span>{profileCompleteness}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${profileCompleteness}%` }}
                        ></div>
                      </div>
                      {profileCompleteness < 100 && (
                        <button 
                          onClick={() => setActiveSection('profile')}
                          className="btn-link"
                        >
                          {currentLanguage === 'en' ? 'Complete your profile' : 'Kamilisha wasifu wako'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 17: Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{jobs.length}</h3>
                    <p>{currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}</p>
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

              {/* Feature 18: Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3>{currentLanguage === 'en' ? 'Recent Activity' : 'Shughuli za Hivi Karibuni'}</h3>
                </div>
                <div className="card-body">
                  {recentActivities.length > 0 ? (
                    <div className="activity-list">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon">
                            <i className={`fas ${
                              activity.type === 'application' ? 'fa-paper-plane' : 'fa-heart'
                            }`}></i>
                          </div>
                          <div className="activity-content">
                            <p>{activity.message}</p>
                            <small>{new Date(activity.date).toLocaleDateString()}</small>
                          </div>
                          {activity.status && (
                            <span className={`activity-status ${activity.status}`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">
                      {currentLanguage === 'en' 
                        ? 'No recent activity' 
                        : 'Hakuna shughuli za hivi karibuni'}
                    </p>
                  )}
                </div>
              </div>

              {/* Feature 19: Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3>{currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}</h3>
                </div>
                <div className="card-body">
                  <div className="quick-actions">
                    <button onClick={() => setActiveSection('jobs')} className="quick-action-btn">
                      <i className="fas fa-search"></i>
                      <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
                    </button>
                    <button onClick={() => setActiveSection('profile')} className="quick-action-btn">
                      <i className="fas fa-user-edit"></i>
                      <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
                    </button>
                    <button onClick={() => exportData('applications')} className="quick-action-btn">
                      <i className="fas fa-download"></i>
                      <span>{currentLanguage === 'en' ? 'Export Data' : 'Pakua Data'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Section with All Features */}
          {activeSection === 'jobs' && (
            <div>
              {/* Feature 20: Advanced Search Header */}
              <div className="card search-header">
                <div className="card-body">
                  <div className="search-container">
                    <div className="search-input-group">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={currentLanguage === 'en' 
                          ? 'Search jobs...' 
                          : 'Tafuta kazi...'}
                        className="search-input"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="clear-search">
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-filter"></i>
                      {currentLanguage === 'en' ? 'Filters' : 'Chuja'}
                    </button>
                  </div>

                  {/* Feature 21: Advanced Filters */}
                  {showFilters && (
                    <div className="filters-panel">
                      <div className="filter-group">
                        <label>{currentLanguage === 'en' ? 'Category' : 'Aina ya Kazi'}</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="all">{currentLanguage === 'en' ? 'All Categories' : 'Aina Zote'}</option>
                          <option value="kilimo">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                          <option value="ujenzi">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                          <option value="nyumbani">{currentLanguage === 'en' ? 'Domestic' : 'Nyumbani'}</option>
                          <option value="usafiri">{currentLanguage === 'en' ? 'Transport' : 'Usafiri'}</option>
                          <option value="huduma">{currentLanguage === 'en' ? 'Services' : 'Huduma'}</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label>{currentLanguage === 'en' ? 'Location' : 'Eneo'}</label>
                        <input
                          type="text"
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          placeholder={currentLanguage === 'en' ? 'Enter location...' : 'Weka eneo...'}
                        />
                      </div>

                      <div className="filter-actions">
                        <button onClick={clearFilters} className="btn btn-outline">
                          {currentLanguage === 'en' ? 'Clear' : 'Futa'}
                        </button>
                        <button onClick={() => setShowFilters(false)} className="btn btn-primary">
                          {currentLanguage === 'en' ? 'Apply' : 'Tumia'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feature 22: Search Results Info */}
                  <div className="search-results-info">
                    <p>
                      {currentLanguage === 'en' 
                        ? `Showing ${filteredJobs.length} of ${jobs.length} jobs` 
                        : `Inaonyesha ${filteredJobs.length} kati ya ${jobs.length} kazi`}
                      
                      {(searchQuery || selectedCategory !== 'all' || selectedLocation) && (
                        <button onClick={clearFilters} className="btn-link">
                          {currentLanguage === 'en' ? 'Clear all filters' : 'Futa vyochujio vyote'}
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 23: Smart Job Matching Banner */}
              {matchingJobs.length > 0 && matchingJobs.length < filteredJobs.length && (
                <div className="card matching-banner">
                  <div className="card-body">
                    <div className="banner-content">
                      <i className="fas fa-lightbulb"></i>
                      <div>
                        <h4>{currentLanguage === 'en' ? 'Jobs Matching Your Skills' : 'Kazi Zinalingana na Ujuzi Wako'}</h4>
                        <p>
                          {currentLanguage === 'en' 
                            ? `We found ${matchingJobs.length} jobs that match your skills` 
                            : `Tumepata ${matchingJobs.length} kazi zinazolingana na ujuzi wako`}
                        </p>
                      </div>
                      <button 
                        onClick={() => setFilteredJobs(matchingJobs)}
                        className="btn btn-primary"
                      >
                        {currentLanguage === 'en' ? 'Show Matching Jobs' : 'Onyesha Kazi Zinalingana'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Jobs List */}
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
                            {job.urgent && <span className="urgent-badge">
                              {currentLanguage === 'en' ? 'Urgent' : 'Ya Haraka'}
                            </span>}
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

                        {job.skills && (
                          <div className="job-skills">
                            {job.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="job-footer">
                        <div className="job-contact">
                          <a href={`tel:${job.phone}`} className="btn btn-primary">
                            <i className="fas fa-phone"></i>
                            {currentLanguage === 'en' ? 'Call Now' : 'Piga Sasa'}
                          </a>
                          
                          {/* Feature 24: Smart Apply Button */}
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
                              ? (currentLanguage === 'en' ? 'Quick Apply' : 'Omba Haraka')
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

          {/* Other sections (Applications, Profile, Notifications) would continue here... */}
          
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
