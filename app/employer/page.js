'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { AppUtils } from '../../lib/utils'

export default function EmployerPage() {
  const [user, setUser] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: '',
    businessName: ''
  })
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'kilimo',
    skills: '',
    phone: ''
  })
  const [editJob, setEditJob] = useState(null)
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  })

  const router = useRouter()

  useEffect(() => {
    loadEmployerData()
  }, [])

  const loadEmployerData = async () => {
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
        businessName: user.businessName || ''
      })

      if (user.role !== 'employer') {
        router.push('/dashboard')
        return
      }

      // Load employer data
      const [jobsResponse, applicationsResponse, statsResponse] = await Promise.all([
        ApiService.getEmployerJobs(user._id),
        ApiService.getEmployerApplications(user._id),
        ApiService.getJobStats(user._id)
      ])

      if (jobsResponse.success) setJobs(jobsResponse.jobs || [])
      if (applicationsResponse.success) setApplications(applicationsResponse.applications || [])
      if (statsResponse.success) setStats(statsResponse.stats)

      // Load notifications
      const savedNotifications = AppUtils.getNotifications()
      setNotifications(savedNotifications)
      setUnreadNotifications(savedNotifications.filter(n => !n.read).length)

    } catch (error) {
      console.error('Error loading employer data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Feature: Job Management
  const handleJobSubmit = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...jobForm,
        employerId: user._id,
        employerName: user.name,
        businessType: user.businessName || user.name,
        skills: jobForm.skills ? jobForm.skills.split(',').map(skill => skill.trim()) : [],
        postedDate: new Date().toISOString()
      }

      let response
      if (editJob) {
        response = await ApiService.updateJob(editJob._id, jobData)
      } else {
        response = await ApiService.createJob(jobData)
      }

      if (response.success) {
        setJobs(prev => editJob 
          ? prev.map(job => job._id === editJob._id ? response.job : job)
          : [...prev, response.job]
        )
        
        setJobForm({
          title: '',
          description: '',
          location: '',
          category: 'kilimo',
          skills: '',
          phone: user.phone || ''
        })
        setEditJob(null)
        
        AppUtils.addNotification(
          currentLanguage === 'en' 
            ? `Job ${editJob ? 'updated' : 'posted'} successfully!` 
            : `Kazi ime${editJob ? 'sasishwa' : 'tangazwa'} kikamilifu!`,
          'success'
        )
        
        loadEmployerData() // Refresh data
      }
    } catch (error) {
      console.error('Error creating job:', error)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Failed to post job' : 'Imeshindwa kutangaza kazi',
        'error'
      )
    }
  }

  // Feature: Application Management
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await ApiService.updateApplicationStatus(applicationId, status)
      if (response.success) {
        setApplications(prev => 
          prev.map(app => app._id === applicationId ? { ...app, status } : app)
        )
        
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Application updated!' : 'Ombi limebadilishwa!',
          'success'
        )
        
        loadEmployerData() // Refresh stats
      }
    } catch (error) {
      console.error('Error updating application:', error)
      AppUtils.addNotification(
        currentLanguage === 'en' ? 'Failed to update application' : 'Imeshindwa kusasisha ombi',
        'error'
      )
    }
  }

  // Feature: Enhanced Job Editing
  const handleEditJob = (job) => {
    setEditJob(job)
    setJobForm({
      title: job.title,
      description: job.description,
      location: job.location,
      category: job.category,
      skills: job.skills?.join(', ') || '',
      phone: job.phone || user.phone
    })
    setActiveSection('post-job')
  }

  // Feature: Job Sharing for Employers
  const shareJob = (job) => {
    const jobText = `Hiring: ${job.title}\nLocation: ${job.location}\nDescription: ${job.description}\nContact: ${job.phone}`
    
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

  // Feature: Language Persistence
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
    AppUtils.addNotification(
      newLanguage === 'en' ? 'Language changed to English' : 'Lugha imebadilishwa kuwa Kiswahili',
      'info'
    )
  }

  // Feature: Data Export for Employers
  const exportData = (type) => {
    let data, filename
    
    if (type === 'jobs') {
      data = jobs
      filename = 'my-job-posts.json'
    } else if (type === 'applications') {
      data = applications
      filename = 'job-applications.json'
    } else {
      data = { user, jobs, applications, stats }
      filename = 'employer-data.json'
    }
    
    AppUtils.exportData(data, filename)
    AppUtils.addNotification(
      currentLanguage === 'en' ? 'Data exported successfully' : 'Data imepakuliwa',
      'success'
    )
  }

  // Feature: Support System
  const [supportMessage, setSupportMessage] = useState('')
  const [showSupport, setShowSupport] = useState(false)

  const submitSupportRequest = async () => {
    if (!supportMessage.trim()) return

    try {
      const response = await ApiService.contactSupport({
        userId: user._id,
        userName: user.name,
        message: supportMessage,
        type: 'employer'
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await ApiService.updateProfile(editProfile)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Profile updated successfully!' : 'Wasifu umehakikishwa!',
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
      {/* Header with All Features */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hands-helping"></i>
              <span>Kazi Mashinani</span>
              <span className="role-badge">
                {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
              </span>
            </div>
            
            <div className="user-menu">
              {/* Notification Bell */}
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
              
              {/* Quick Support Access */}
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

      {/* Enhanced Side Navigation with Logout */}
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

          {/* Data Export for Employers */}
          <div className="side-nav-section">
            <h4>{currentLanguage === 'en' ? 'Export Data' : 'Pakua Data'}</h4>
            <button onClick={() => exportData('jobs')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'My Job Posts' : 'Kazi Niliyotangaza'}</span>
            </button>
            <button onClick={() => exportData('applications')} className="side-nav-item">
              <i className="fas fa-download"></i>
              <span>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</span>
            </button>
          </div>

          {/* LOGOUT BUTTON ADDED */}
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

      <main className="main-content">
        <div className="container">
          {/* Dashboard Section with Stats */}
          {activeSection === 'dashboard' && (
            <div>
              <div className="card welcome-card">
                <div className="card-header">
                  <h1>{currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!</h1>
                  <p>{currentLanguage === 'en' 
                    ? 'Manage your job posts and applications' 
                    : 'Dhibiti kazi zako na maombi'}</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalJobs}</h3>
                    <p>{currentLanguage === 'en' ? 'Total Jobs' : 'Jumla ya Kazi'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.activeJobs}</h3>
                    <p>{currentLanguage === 'en' ? 'Active Jobs' : 'Kazi Aktivu'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon warning">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalApplications}</h3>
                    <p>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon danger">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.pendingApplications}</h3>
                    <p>{currentLanguage === 'en' ? 'Pending' : 'Inasubiri'}</p>
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
                    <button onClick={() => setActiveSection('post-job')} className="quick-action-btn">
                      <i className="fas fa-plus"></i>
                      <span>{currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi'}</span>
                    </button>
                    <button onClick={() => setActiveSection('my-jobs')} className="quick-action-btn">
                      <i className="fas fa-list"></i>
                      <span>{currentLanguage === 'en' ? 'View My Jobs' : 'Angalia Kazi Zangu'}</span>
                    </button>
                    <button onClick={() => setActiveSection('applications')} className="quick-action-btn">
                      <i className="fas fa-users"></i>
                      <span>{currentLanguage === 'en' ? 'View Applications' : 'Angalia Maombi'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections (Post Job, My Jobs, Applications, Profile) would continue here... */}
          
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
            { id: 'dashboard', icon: 'fa-chart-line', label: { en: 'Dashboard', sw: 'Dashibodi' } },
            { id: 'post-job', icon: 'fa-plus-circle', label: { en: 'Post Job', sw: 'Tanga Kazi' } },
            { id: 'my-jobs', icon: 'fa-briefcase', label: { en: 'My Jobs', sw: 'Kazi Zangu' } },
            { id: 'applications', icon: 'fa-file-alt', label: { en: 'Applications', sw: 'Maombi' } },
            { id: 'profile', icon: 'fa-user-tie', label: { en: 'Profile', sw: 'Wasifu' } }
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
