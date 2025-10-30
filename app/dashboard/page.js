'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [favorites, setFavorites] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: '',
    skills: '',
    experience: ''
  })
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [stats, setStats] = useState({
    totalJobs: 0,
    applications: 0,
    favorites: 0
  })
  const [supportMessage, setSupportMessage] = useState('')
  const [showSupport, setShowSupport] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
    initializeData()
  }, [])

  const initializeData = () => {
    // Initialize localStorage data if not exists
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('jobs')) {
        localStorage.setItem('jobs', JSON.stringify(ApiService.getFallbackJobs()))
      }
      if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]))
      }
    }
  }

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

      // Load all data in parallel
      const [jobsResponse, applicationsResponse, favoritesResponse, notificationsData] = await Promise.all([
        ApiService.getJobs(),
        ApiService.getMyApplications(),
        ApiService.getFavorites(user._id),
        getNotifications()
      ])

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
        setFilteredJobs(jobsResponse.jobs || [])
      }
      if (applicationsResponse.success) setApplications(applicationsResponse.applications || [])
      if (favoritesResponse.success) setFavorites(favoritesResponse.favorites || [])

      setNotifications(notificationsData)
      setUnreadNotifications(notificationsData.filter(n => !n.read).length)

      // Update stats
      setStats({
        totalJobs: jobsResponse.jobs?.length || 0,
        applications: applicationsResponse.applications?.length || 0,
        favorites: favoritesResponse.favorites?.length || 0
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotifications = async () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('notifications') || '[]')
    }
    return []
  }

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: 'notif-' + Date.now(),
      message,
      type,
      date: new Date().toISOString(),
      read: false
    }
    
    const updatedNotifications = [notification, ...notifications]
    setNotifications(updatedNotifications)
    setUnreadNotifications(prev => prev + 1)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
    }
  }

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    )
    setNotifications(updatedNotifications)
    setUnreadNotifications(updatedNotifications.filter(n => !n.read).length)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
    }
  }

  // Feature 1: Advanced Search and Filtering
  const handleSearch = () => {
    let filtered = jobs
    
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.businessType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory)
    }
    
    if (selectedLocation) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }
    
    setFilteredJobs(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedCategory, selectedLocation, jobs])

  // Feature 2: Smart Job Matching
  const getMatchingJobs = () => {
    if (!user?.skills) return filteredJobs
    
    const userSkills = user.skills.toLowerCase().split(',').map(skill => skill.trim())
    return filteredJobs.filter(job => {
      if (!job.skills) return false
      const jobSkills = job.skills.map(skill => skill.toLowerCase())
      return userSkills.some(userSkill => 
        jobSkills.some(jobSkill => jobSkill.includes(userSkill))
      )
    })
  }

  const matchingJobs = getMatchingJobs()

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
        addNotification(
          currentLanguage === 'en' 
            ? `Application sent for ${job?.title}` 
            : `Ombi limewasilishwa kwa ${job?.title}`,
          'success'
        )
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      addNotification(
        currentLanguage === 'en' ? 'Failed to submit application' : 'Imeshindwa kutuma ombi',
        'error'
      )
    }
  }

  // Feature 4: Enhanced Favorites with Categories
  const toggleFavorite = async (jobId) => {
    try {
      const isFavorite = favorites.some(fav => fav.jobId === jobId)
      const job = jobs.find(j => j._id === jobId)
      
      if (isFavorite) {
        await ApiService.removeFavorite(jobId, user._id)
        setFavorites(prev => prev.filter(fav => fav.jobId !== jobId))
        addNotification(
          currentLanguage === 'en' ? 'Removed from favorites' : 'Imeondolewa kwenye vipendwa',
          'info'
        )
      } else {
        await ApiService.saveFavorite(jobId, user._id)
        setFavorites(prev => [...prev, { jobId, userId: user._id, _id: 'fav-' + Date.now() }])
        addNotification(
          currentLanguage === 'en' ? 'Added to favorites' : 'Imeongezwa kwenye vipendwa',
          'success'
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Feature 5: Job Sharing with Custom Message
  const shareJob = (job) => {
    const jobText = `${job.title}\n${job.location}\n${job.description}\n\nContact: ${job.phone}`
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: jobText,
      }).then(() => {
        addNotification(
          currentLanguage === 'en' ? 'Job shared successfully' : 'Kazi imeshirikiwa',
          'success'
        )
      })
    } else {
      navigator.clipboard.writeText(jobText)
      addNotification(
        currentLanguage === 'en' ? 'Job details copied to clipboard' : 'Maelezo yameigwa',
        'success'
      )
    }
  }

  // Feature 6: Application Status Tracking
  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.jobId === jobId)
    return application ? application.status : 'not_applied'
  }

  // Feature 7: Profile Completeness Calculator
  const calculateProfileCompleteness = () => {
    const fields = ['name', 'phone', 'location', 'skills']
    const completedFields = fields.filter(field => user?.[field])
    return Math.round((completedFields.length / fields.length) * 100)
  }

  // Feature 8: Recent Activity Feed
  const recentActivities = [
    ...applications.map(app => ({
      type: 'application',
      message: currentLanguage === 'en' 
        ? `Applied for ${app.jobTitle}` 
        : `Umeomba ${app.jobTitle}`,
      date: app.appliedDate,
      status: app.status
    })),
    ...favorites.map(fav => {
      const job = jobs.find(j => j._id === fav.jobId)
      return job ? {
        type: 'favorite',
        message: currentLanguage === 'en' 
          ? `Saved ${job.title}` 
          : `Umehifadhi ${job.title}`,
        date: new Date().toISOString()
      } : null
    }).filter(Boolean)
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

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
        addNotification(
          currentLanguage === 'en' ? 'Support request sent' : 'Ombi la usaidizi limetumwa',
          'success'
        )
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      addNotification(
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
    addNotification(
      newLanguage === 'en' ? 'Language changed to English' : 'Lugha imebadilishwa kuwa Kiswahili',
      'info'
    )
  }

  // Feature 11: Data Export
  const exportData = (type) => {
    let data, filename, content
    
    if (type === 'applications') {
      data = applications
      filename = 'my-applications.json'
    } else if (type === 'favorites') {
      data = favorites.map(fav => {
        const job = jobs.find(j => j._id === fav.jobId)
        return job ? { ...job, savedDate: fav._id } : null
      }).filter(Boolean)
      filename = 'my-favorites.json'
    }
    
    content = JSON.stringify(data, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    
    addNotification(
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
        addNotification(
          currentLanguage === 'en' ? 'Profile updated successfully' : 'Wasifu umehakikishwa',
          'success'
        )
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      addNotification(
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

  if (!mounted || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>{currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}</p>
      </div>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
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
                title={currentLanguage === 'en' ? 'Get Help' : 'Pata Usaidizi'}
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
            <button 
              onClick={() => exportData('applications')} 
              className="side-nav-item"
            >
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'}</span>
            </button>
            <button 
              onClick={() => exportData('favorites')} 
              className="side-nav-item"
            >
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
          {/* Home Section with Enhanced Dashboard */}
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
                        <span>{calculateProfileCompleteness()}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${calculateProfileCompleteness()}%` }}
                        ></div>
                      </div>
                      {calculateProfileCompleteness() < 100 && (
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
                    <h3>{stats.totalJobs}</h3>
                    <p>{currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon success">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.applications}</h3>
                    <p>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon warning">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.favorites}</h3>
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
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="quick-action-btn"
                    >
                      <i className="fas fa-search"></i>
                      <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
                    </button>
                    <button 
                      onClick={() => setActiveSection('profile')}
                      className="quick-action-btn"
                    >
                      <i className="fas fa-user-edit"></i>
                      <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
                    </button>
                    <button 
                      onClick={() => exportData('applications')}
                      className="quick-action-btn"
                    >
                      <i className="fas fa-download"></i>
                      <span>{currentLanguage === 'en' ? 'Export Data' : 'Pakua Data'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Jobs Section */}
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
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="clear-search"
                        >
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
                {filteredJobs.length > 0 ? filteredJobs.map(job => {
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
                            {job.featured && <span className="featured-badge">
                              {currentLanguage === 'en' ? 'Featured' : 'Iliyoboreshwa'}
                            </span>}
                          </div>
                        </div>
                        <div className="job-actions">
                          <button
                            onClick={() => toggleFavorite(job._id)}
                            className={`icon-btn ${isFavorite ? 'favorited' : ''}`}
                            title={currentLanguage === 'en' ? 'Add to favorites' : 'Ongeza kwenye vipendwa'}
                          >
                            <i className={`fas ${isFavorite ? 'fa-heart' : 'fa-heart'}`}></i>
                          </button>
                          <button
                            onClick={() => shareJob(job)}
                            className="icon-btn"
                            title={currentLanguage === 'en' ? 'Share job' : 'Shiriki kazi'}
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
                          {job.experience && (
                            <div className="job-detail">
                              <i className="fas fa-briefcase"></i>
                              <span>{job.experience}</span>
                            </div>
                          )}
                        </div>

                        {job.skills && job.skills.length > 0 && (
                          <div className="job-skills">
                            {job.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="job-footer">
                        <div className="job-contact">
                          <a 
                            href={`tel:${job.phone}`}
                            className="btn btn-primary"
                          >
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
                        
                        <div className="job-posted">
                          <small>
                            {currentLanguage === 'en' ? 'Posted' : 'Iliyotangazwa'} {new Date(job.postedDate).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="empty-state">
                    <i className="fas fa-briefcase"></i>
                    <h3>{currentLanguage === 'en' ? 'No Jobs Found' : 'Hakuna Kazi Ilipatikana'}</h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'Try adjusting your search criteria or clear filters' 
                        : 'Badilisha masharti ya utafutaji au futa vyochujio'}
                    </p>
                    <button onClick={clearFilters} className="btn btn-primary">
                      {currentLanguage === 'en' ? 'Clear Filters' : 'Futa Vyochujio'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Applications Section */}
          {activeSection === 'applications' && (
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-file-alt"></i> 
                  {currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'} 
                  <span className="count-badge">{applications.length}</span>
                </h2>
                
                {/* Feature 25: Application Statistics */}
                {applications.length > 0 && (
                  <div className="application-stats">
                    <div className="stat">
                      <span className="stat-number">
                        {applications.filter(app => app.status === 'pending').length}
                      </span>
                      <span className="stat-label">{currentLanguage === 'en' ? 'Pending' : 'Inasubiri'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        {applications.filter(app => app.status === 'accepted').length}
                      </span>
                      <span className="stat-label">{currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        {applications.filter(app => app.status === 'rejected').length}
                      </span>
                      <span className="stat-label">{currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card-body">
                {applications.length > 0 ? (
                  <div className="applications-list">
                    {applications.map(application => (
                      <div key={application._id} className="application-card">
                        <div className="application-header">
                          <div className="application-info">
                            <h4>{application.jobTitle}</h4>
                            <p>{currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}: {application.employer}</p>
                          </div>
                          <div className="application-status">
                            <span className={`status-badge status-${application.status}`}>
                              <i className={`fas ${
                                application.status === 'pending' ? 'fa-clock' :
                                application.status === 'accepted' ? 'fa-check-circle' :
                                'fa-times-circle'
                              }`}></i>
                              {application.status === 'pending' ? (currentLanguage === 'en' ? 'Pending' : 'Inasubiri') :
                               application.status === 'accepted' ? (currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa') :
                               (currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="application-details">
                          <div className="detail">
                            <i className="fas fa-calendar"></i>
                            <span>
                              {currentLanguage === 'en' ? 'Applied' : 'Iliyotumwa'}: {new Date(application.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                          {application.coverLetter && (
                            <div className="detail">
                              <i className="fas fa-envelope"></i>
                              <span>{application.coverLetter}</span>
                            </div>
                          )}
                        </div>

                        {/* Feature 26: Application Actions */}
                        <div className="application-actions">
                          <button 
                            onClick={() => {
                              const job = jobs.find(j => j._id === application.jobId)
                              if (job) {
                                shareJob(job)
                              }
                            }}
                            className="btn btn-outline"
                          >
                            <i className="fas fa-share-alt"></i>
                            {currentLanguage === 'en' ? 'Share' : 'Shiriki'}
                          </button>
                          
                          {application.status === 'accepted' && (
                            <a 
                              href={`tel:${application.applicantPhone}`}
                              className="btn btn-primary"
                            >
                              <i className="fas fa-phone"></i>
                              {currentLanguage === 'en' ? 'Call Employer' : 'Piga Mwajiri'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-file-alt"></i>
                    <h3>{currentLanguage === 'en' ? 'No Applications' : 'Hakuna Maombi'}</h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'You haven\'t applied for any jobs yet. Start browsing available jobs!' 
                        : 'Bado hujaomba kazi yoyote. Anza kuchunguza kazi zilizopo!'}
                    </p>
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="btn btn-primary"
                    >
                      {currentLanguage === 'en' ? 'Browse Jobs' : 'Chunguza Kazi'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-bell"></i> 
                  {currentLanguage === 'en' ? 'Notifications' : 'Arifa'} 
                  {unreadNotifications > 0 && (
                    <span className="count-badge">{unreadNotifications}</span>
                  )}
                </h2>
                
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
                      setNotifications(updatedNotifications)
                      setUnreadNotifications(0)
                      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
                    }}
                    className="btn btn-outline"
                  >
                    {currentLanguage === 'en' ? 'Mark all as read' : 'Weka zote kama zimesomwa'}
                  </button>
                )}
              </div>
              
              <div className="card-body">
                {notifications.length > 0 ? (
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          <i className={`fas ${
                            notification.type === 'success' ? 'fa-check-circle' :
                            notification.type === 'error' ? 'fa-exclamation-circle' :
                            'fa-info-circle'
                          } ${notification.type}`}></i>
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <small>{new Date(notification.date).toLocaleString()}</small>
                        </div>
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-bell-slash"></i>
                    <h3>{currentLanguage === 'en' ? 'No Notifications' : 'Hakuna Arifa'}</h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'You\'re all caught up! New notifications will appear here.' 
                        : 'Umefikia mwisho! Arifa mpya zitaonekana hapa.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Profile Section */}
          {activeSection === 'profile' && user && (
            <div className="card">
              <div className="card-header">
                <h2>{currentLanguage === 'en' ? 'My Profile' : 'Wasifu Wangu'}</h2>
              </div>
              
              <div className="card-body">
                <div className="profile-header">
                  <div className="user-avatar large">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <h2>{user.name}</h2>
                    <p>{user.location}</p>
                    <div className="profile-badges">
                      <span className="badge">
                        <i className="fas fa-briefcase"></i>
                        {currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi'}
                      </span>
                      <span className="badge">
                        <i className="fas fa-calendar"></i>
                        {currentLanguage === 'en' ? 'Member since' : 'Mwanachama tangu'} {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature 27: Profile Completeness */}
                <div className="profile-completeness-card">
                  <h4>{currentLanguage === 'en' ? 'Profile Strength' : 'Ukamilifu wa Wasifu'}</h4>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${calculateProfileCompleteness()}%` }}
                      ></div>
                    </div>
                    <span>{calculateProfileCompleteness()}%</span>
                  </div>
                  {calculateProfileCompleteness() < 100 && (
                    <p className="completeness-hint">
                      {currentLanguage === 'en' 
                        ? 'Complete your profile to get better job matches' 
                        : 'Kamilisha wasifu wako kupata mechi bora za kazi'}
                    </p>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        <i className="fas fa-user"></i>
                        {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'} *
                      </label>
                      <input
                        type="text"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <i className="fas fa-phone"></i>
                        {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'} *
                      </label>
                      <input
                        type="tel"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <i className="fas fa-map-marker-alt"></i>
                        {currentLanguage === 'en' ? 'Location' : 'Eneo'} *
                      </label>
                      <input
                        type="text"
                        value={editProfile.location}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Feature 28: Skills Input with Suggestions */}
                    <div className="form-group">
                      <label>
                        <i className="fas fa-tools"></i>
                        {currentLanguage === 'en' ? 'Skills' : 'Ujuzi'}
                      </label>
                      <input
                        type="text"
                        value={editProfile.skills}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder={currentLanguage === 'en' 
                          ? 'e.g. Farming, Construction, Cooking' 
                          : 'K.m. Kilimo, Ujenzi, Kupika'}
                      />
                      <div className="input-hint">
                        {currentLanguage === 'en' 
                          ? 'Separate skills with commas' 
                          : 'Tenganisha ujuzi kwa vitone'}
                      </div>
                    </div>

                    {/* Feature 29: Experience Level */}
                    <div className="form-group">
                      <label>
                        <i className="fas fa-briefcase"></i>
                        {currentLanguage === 'en' ? 'Experience' : 'Uzoefu'}
                      </label>
                      <select
                        value={editProfile.experience}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, experience: e.target.value }))}
                      >
                        <option value="">{currentLanguage === 'en' ? 'Select experience' : 'Chagua uzoefu'}</option>
                        <option value="none">{currentLanguage === 'en' ? 'No experience' : 'Hakuna uzoefu'}</option>
                        <option value="0-1">{currentLanguage === 'en' ? '0-1 years' : 'Miaka 0-1'}</option>
                        <option value="1-3">{currentLanguage === 'en' ? '1-3 years' : 'Miaka 1-3'}</option>
                        <option value="3-5">{currentLanguage === 'en' ? '3-5 years' : 'Miaka 3-5'}</option>
                        <option value="5+">{currentLanguage === 'en' ? '5+ years' : 'Miaka 5+'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i>
                      {currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko'}
                    </button>
                    
                    {/* Feature 30: Profile Preview */}
                    <button 
                      type="button"
                      onClick={() => {
                        // Show profile preview modal
                        alert(currentLanguage === 'en' 
                          ? 'Profile preview feature coming soon!' 
                          : 'Kikamilishu cha kukagua wasifu kinakuja!')
                      }}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-eye"></i>
                      {currentLanguage === 'en' ? 'Preview Profile' : 'Kagua Wasifu'}
                    </button>
                  </div>
                </form>

                {/* Feature 31: Account Settings */}
                <div className="settings-section">
                  <h4>{currentLanguage === 'en' ? 'Account Settings' : 'Mipangilio ya Akaunti'}</h4>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>{currentLanguage === 'en' ? 'Language' : 'Lugha'}</h5>
                        <p>{currentLanguage === 'en' 
                          ? 'Change app language' 
                          : 'Badilisha lugha ya programu'}</p>
                      </div>
                      <select
                        value={currentLanguage}
                        onChange={(e) => {
                          setCurrentLanguage(e.target.value)
                          localStorage.setItem('preferredLanguage', e.target.value)
                        }}
                      >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>{currentLanguage === 'en' ? 'Data Export' : 'Kupakua Data'}</h5>
                        <p>{currentLanguage === 'en' 
                          ? 'Download your data' 
                          : 'Pakua data yako'}</p>
                      </div>
                      <div className="setting-actions">
                        <button 
                          onClick={() => exportData('applications')}
                          className="btn btn-outline"
                        >
                          {currentLanguage === 'en' ? 'Applications' : 'Maombi'}
                        </button>
                        <button 
                          onClick={() => exportData('favorites')}
                          className="btn btn-outline"
                        >
                          {currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>{currentLanguage === 'en' ? 'Account Actions' : 'Vitendo vya Akaunti'}</h5>
                        <p>{currentLanguage === 'en' 
                          ? 'Manage your account' 
                          : 'Dhibiti akaunti yako'}</p>
                      </div>
                      <button onClick={logout} className="btn btn-danger">
                        <i className="fas fa-sign-out-alt"></i>
                        {currentLanguage === 'en' ? 'Logout' : 'Toka'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Kazi Mashinani</h4>
              <p>{currentLanguage === 'en' 
                ? 'Connecting rural talent with opportunities' 
                : 'Kuunganisha talanta za vijijini na fursa'}</p>
            </div>
            <div className="footer-section">
              <h4>{currentLanguage === 'en' ? 'Contact' : 'Wasiliana'}</h4>
              <p>+254790528837</p>
              <p>myhassan19036@gmail.com</p>
            </div>
            <div className="footer-section">
              <h4>{currentLanguage === 'en' ? 'Quick Links' : 'Viungo vya Haraka'}</h4>
              <a href="/blog">{currentLanguage === 'en' ? 'About' : 'Kuhusu'}</a>
              <button onClick={() => setShowSupport(true)}>
                {currentLanguage === 'en' ? 'Support' : 'Usaidizi'}
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Kazi Mashinani &copy; 2025. {currentLanguage === 'en' 
              ? 'All rights reserved.' 
              : 'Haki zote zimehifadhiwa.'}</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-content">
          {[
            { 
              id: 'home', 
              icon: 'fa-home', 
              label: { en: 'Home', sw: 'Nyumbani' },
              notification: unreadNotifications > 0 ? unreadNotifications : null
            },
            { 
              id: 'jobs', 
              icon: 'fa-briefcase', 
              label: { en: 'Jobs', sw: 'Kazi' },
              badge: filteredJobs.length > 0 ? filteredJobs.length : null
            },
            { 
              id: 'applications', 
              icon: 'fa-file-alt', 
              label: { en: 'Applications', sw: 'Maombi' },
              badge: applications.length > 0 ? applications.length : null
            },
            { 
              id: 'notifications', 
              icon: 'fa-bell', 
              label: { en: 'Alerts', sw: 'Arifa' },
              notification: unreadNotifications > 0 ? unreadNotifications : null
            },
            { 
              id: 'profile', 
              icon: 'fa-user', 
              label: { en: 'Profile', sw: 'Wasifu' }
            }
          ].map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="nav-icon">
                <i className={`fas ${section.icon}`}></i>
                {section.notification && (
                  <span className="nav-badge notification">{section.notification}</span>
                )}
                {section.badge && (
                  <span className="nav-badge count">{section.badge}</span>
                )}
              </div>
              <span>{currentLanguage === 'en' ? section.label.en : section.label.sw}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
