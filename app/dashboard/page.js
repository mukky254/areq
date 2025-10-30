'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [favorites, setFavorites] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: ''
  })
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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
        location: user.location || ''
      })

      // Load initial data
      const [jobsResponse, applicationsResponse, favoritesResponse] = await Promise.all([
        ApiService.getJobs(),
        ApiService.getMyApplications(),
        ApiService.getFavorites(user._id)
      ])

      if (jobsResponse.success) setJobs(jobsResponse.jobs || [])
      if (applicationsResponse.success) setApplications(applicationsResponse.applications || [])
      if (favoritesResponse.success) setFavorites(favoritesResponse.favorites || [])

      // Initialize jobs in localStorage for applications
      if (typeof window !== 'undefined' && jobsResponse.jobs) {
        localStorage.setItem('jobs', JSON.stringify(jobsResponse.jobs))
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (jobId) => {
    try {
      const isFavorite = favorites.some(fav => fav.jobId === jobId)
      
      if (isFavorite) {
        await ApiService.removeFavorite(jobId, user._id)
        setFavorites(prev => prev.filter(fav => fav.jobId !== jobId))
      } else {
        await ApiService.saveFavorite(jobId, user._id)
        setFavorites(prev => [...prev, { jobId, userId: user._id, _id: 'fav-' + Date.now() }])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const applyForJob = async (jobId) => {
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
        const application = {
          ...response.application,
          jobTitle: job?.title,
          employer: job?.employer?.name || 'Mwajiri'
        }

        setApplications(prev => [...prev, application])
        alert(currentLanguage === 'en' ? 'Application submitted!' : 'Ombi limewasilishwa!')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      alert(currentLanguage === 'en' ? 'Failed to submit application' : 'Imeshindwa kutuma ombi')
    }
  }

  const shareJob = (job) => {
    const jobText = `${job.title} - ${job.location}\n${job.description}\n\nContact: ${job.phone}`
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: jobText,
      })
    } else {
      navigator.clipboard.writeText(jobText)
      alert(currentLanguage === 'en' ? 'Job details copied!' : 'Maelezo yameigwa!')
    }
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await ApiService.updateProfile(editProfile)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        alert(currentLanguage === 'en' ? 'Profile updated!' : 'Wasifu umehakikishwa!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(currentLanguage === 'en' ? 'Failed to update profile' : 'Imeshindwa kusasisha wasifu')
    }
  }

  const logout = () => {
    if (confirm(currentLanguage === 'en' ? 'Logout?' : 'Toka?')) {
      localStorage.clear()
      router.push('/auth')
    }
  }

  const openSideNav = () => setSideNavOpen(true)
  const closeSideNav = () => setSideNavOpen(false)

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
              <button className="menu-btn" onClick={openSideNav}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <div className={`overlay ${sideNavOpen ? 'show' : ''}`} onClick={closeSideNav}></div>
      
      <div className={`side-nav ${sideNavOpen ? 'open' : ''}`}>
        <div className="side-nav-header">
          <h3>Quick Links</h3>
          <button className="close-btn" onClick={closeSideNav}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="side-nav-content">
          <a href="/blog" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-info-circle"></i>
            <span>About</span>
          </a>
          
          <a href="tel:+254790528837" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-phone"></i>
            <span>Call Us</span>
          </a>
          
          <a href="mailto:myhassan19036@gmail.com" className="side-nav-item" onClick={closeSideNav}>
            <i className="fas fa-envelope"></i>
            <span>Email</span>
          </a>

          <button onClick={logout} className="side-nav-item logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Home Section */}
          {activeSection === 'home' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h1>{currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!</h1>
                  <p>{currentLanguage === 'en' ? 'Find your next opportunity' : 'Tafuta fursa yako ijayo'}</p>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h2><i className="fas fa-blog"></i> {currentLanguage === 'en' ? 'Job Opportunities' : 'Fursa za Kazi'}</h2>
                  <p>{currentLanguage === 'en' 
                    ? 'Discover various job opportunities in rural areas' 
                    : 'Gundua fursa mbalimbali za kazi katika maeneo ya vijijini'}</p>
                  
                  <div className="stats">
                    <div className="stat">
                      <h3>{jobs.length}</h3>
                      <p>{currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}</p>
                    </div>
                    <div className="stat">
                      <h3>{applications.length}</h3>
                      <p>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div className="card">
              <div className="card-body">
                <h2><i className="fas fa-briefcase"></i> {currentLanguage === 'en' ? 'Jobs' : 'Kazi'} ({jobs.length})</h2>
                
                <div className="jobs-list">
                  {jobs.map(job => (
                    <div key={job._id} className="job-item">
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className="category">{job.category}</span>
                      </div>
                      <p>{job.description}</p>
                      <div className="job-details">
                        <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                        <span><i className="fas fa-building"></i> {job.businessType}</span>
                        {job.salary && <span><i className="fas fa-money-bill"></i> {job.salary}</span>}
                      </div>
                      <div className="job-actions">
                        <a href={`tel:${job.phone}`} className="btn btn-primary">
                          <i className="fas fa-phone"></i> {currentLanguage === 'en' ? 'Call' : 'Piga'}
                        </a>
                        <button 
                          onClick={() => applyForJob(job._id)}
                          className="btn btn-secondary"
                          disabled={applications.some(app => app.jobId === job._id)}
                        >
                          {applications.some(app => app.jobId === job._id) 
                            ? (currentLanguage === 'en' ? 'Applied' : 'Imetuma') 
                            : (currentLanguage === 'en' ? 'Apply' : 'Omba')}
                        </button>
                        <button 
                          onClick={() => toggleFavorite(job._id)}
                          className={`btn ${favorites.some(fav => fav.jobId === job._id) ? 'btn-danger' : 'btn-outline'}`}
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div className="card">
              <div className="card-body">
                <h2><i className="fas fa-file-alt"></i> {currentLanguage === 'en' ? 'Applications' : 'Maombi'} ({applications.length})</h2>
                
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
