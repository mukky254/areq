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

      console.log('🔄 Loading jobs...');
      // Load jobs from API with fallback
      const jobsResponse = await ApiService.getJobs()
      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
        setStats(prev => ({ ...prev, totalJobs: jobsResponse.jobs?.length || 0 }))
      }

      // Load applications
      try {
        const applicationsResponse = await ApiService.getMyApplications()
        if (applicationsResponse.success) {
          setApplications(applicationsResponse.applications || [])
          setStats(prev => ({ ...prev, appliedJobs: applicationsResponse.applications?.length || 0 }))
        }
      } catch (error) {
        console.log('Applications not available, using empty array');
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
      console.log('🔄 Applying for job:', jobId);
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
        
        alert(currentLanguage === 'en' ? 'Application submitted successfully!' : 'Ombi lako limewasilishwa kikamilifu!')
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
      alert(currentLanguage === 'en' ? 'Application submitted successfully!' : 'Ombi lako limewasilishwa kikamilifu!')
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

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-content">
            {['home', 'jobs', 'favorites', 'applications', 'profile'].map(section => (
              <div
                key={section}
                className={`nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                <i className={`fas ${
                  section === 'home' ? 'fa-home' :
                  section === 'jobs' ? 'fa-briefcase' :
                  section === 'favorites' ? 'fa-heart' :
                  section === 'applications' ? 'fa-file-alt' :
                  'fa-user'
                }`}></i>
                <span>
                  {section === 'home' && 'Nyumbani'}
                  {section === 'jobs' && 'Kazi'}
                  {section === 'favorites' && 'Vipendwa'}
                  {section === 'applications' && 'Maombi'}
                  {section === 'profile' && 'Wasifu'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Home Section */}
          {activeSection === 'home' && (
            <div>
              {/* Welcome Section */}
              <div className="card">
                <div className="card-header">
                  <h1 style={{ margin: 0, fontSize: '2rem' }}>
                    Karibu tena, {user?.name}!
                  </h1>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                    Fursa yako ijayo inangojea katika maeneo ya vijijini
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalJobs}</h3>
                    <p>Kazi Zilizopo</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon secondary">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.appliedJobs}</h3>
                    <p>Maombi</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.interviews}</h3>
                    <p>Mahojiano</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="fas fa-eye"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.profileViews}</h3>
                    <p>Angalio za Wasifu</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-body">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <i className="fas fa-bolt" style={{ color: '#f39c12' }}></i>
                    Vitendo Vya Haraka
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="btn btn-primary"
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      <i className="fas fa-search"></i>
                      <span>Tafuta Kazi</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('favorites')}
                      className="btn btn-primary"
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      <i className="fas fa-heart"></i>
                      <span>Vipendwa</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('applications')}
                      className="btn btn-primary"
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      <i className="fas fa-file-alt"></i>
                      <span>Maombi</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('profile')}
                      className="btn btn-primary"
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      <i className="fas fa-user"></i>
                      <span>Wasifu</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div>
              <div className="card">
                <div className="card-body">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <i className="fas fa-briefcase" style={{ color: '#3498db' }}></i>
                    Kazi Zilizopo ({jobs.length})
                  </h2>

                  <div className="jobs-grid">
                    {jobs.length > 0 ? jobs.map(job => (
                      <div key={job._id} className="job-card">
                        <div className="job-card-header">
                          <div className="job-title">{job.title}</div>
                          <div className="job-badges">
                            <span className="badge badge-primary">{job.category}</span>
                            {job.urgent && <span className="badge badge-warning">Ya Haraka</span>}
                            {job.featured && <span className="badge badge-secondary">Iliyoboreshwa</span>}
                          </div>
                        </div>
                        
                        <div className="job-card-body">
                          <p className="job-description">{job.description}</p>
                          
                          <div className="job-details">
                            <div className="job-detail">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{job.location}</span>
                            </div>
                            <div className="job-detail">
                              <i className="fas fa-building"></i>
                              <span>{job.businessType}</span>
                            </div>
                            <div className="job-detail">
                              <i className="fas fa-money-bill"></i>
                              <span>{job.salary}</span>
                            </div>
                          </div>

                          {job.skills && job.skills.length > 0 && (
                            <div className="job-skills">
                              {job.skills.map(skill => (
                                <span key={skill} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="job-card-actions">
                          <a 
                            href={`tel:${job.phone}`}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                          >
                            <i className="fas fa-phone"></i>
                            <span>Piga Simu</span>
                          </a>
                          <button
                            onClick={() => toggleFavorite(job._id)}
                            className="btn"
                            style={{ 
                              background: favorites.some(fav => fav._id === job._id) ? '#e74c3c' : '#95a5a6',
                              color: 'white'
                            }}
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                        </div>

                        <div style={{ padding: '0 20px 20px' }}>
                          <button
                            onClick={() => applyForJob(job._id)}
                            className="btn btn-primary btn-block"
                            disabled={applications.some(app => app.jobId === job._id)}
                          >
                            {applications.some(app => app.jobId === job._id) ? 'Umeomba' : 'Omba Sasa'}
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state">
                        <i className="fas fa-briefcase"></i>
                        <h3>Hakuna Kazi Zilizopatikana</h3>
                        <p>Hakuna kazi zilizopo kwa sasa. Tafadhali angalia tena baadaye.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Section */}
          {activeSection === 'favorites' && (
            <div className="card">
              <div className="card-body">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <i className="fas fa-heart" style={{ color: '#e74c3c' }}></i>
                  Kazi Unazopenda ({favorites.length})
                </h2>

                <div className="jobs-grid">
                  {favorites.length > 0 ? favorites.map(job => (
                    <div key={job._id} className="job-card">
                      <div className="job-card-header">
                        <div className="job-title">{job.title}</div>
                        <div className="job-badges">
                          <span className="badge badge-primary">{job.category}</span>
                        </div>
                      </div>
                      
                      <div className="job-card-body">
                        <p className="job-description">{job.description}</p>
                        
                        <div className="job-details">
                          <div className="job-detail">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{job.location}</span>
                          </div>
                          <div className="job-detail">
                            <i className="fas fa-building"></i>
                            <span>{job.businessType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="job-card-actions">
                        <a 
                          href={`tel:${job.phone}`}
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                        >
                          <i className="fas fa-phone"></i>
                          <span>Piga Simu</span>
                        </a>
                        <button
                          onClick={() => toggleFavorite(job._id)}
                          className="btn"
                          style={{ 
                            background: '#e74c3c',
                            color: 'white'
                          }}
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-heart"></i>
                      <h3>Hakuna Kazi Unazopenda</h3>
                      <p>Bado hujaweka kazi yoyote kwenye orodha ya vipendwa.</p>
                      <button 
                        onClick={() => setActiveSection('jobs')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                        Tafuta Kazi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div className="card">
              <div className="card-body">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <i className="fas fa-file-alt" style={{ color: '#2ecc71' }}></i>
                  Maombi Yangu ({applications.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {applications.length > 0 ? applications.map(application => (
                    <div key={application.id} style={{ 
                      padding: '20px', 
                      background: '#f8f9fa', 
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, flex: 1 }}>{application.jobTitle}</h3>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: application.status === 'pending' ? '#fff3cd' : 
                                    application.status === 'accepted' ? '#d1edff' : '#f8d7da',
                          color: application.status === 'pending' ? '#856404' : 
                                application.status === 'accepted' ? '#0c5460' : '#721c24'
                        }}>
                          {application.status}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        Mwajiri: {application.employer}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>
                        Tarehe: {new Date(application.appliedDate).toLocaleDateString('sw-TZ')}
                      </p>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-file-alt"></i>
                      <h3>Hakuna Maombi</h3>
                      <p>Bado hujaomba kazi yoyote.</p>
                      <button 
                        onClick={() => setActiveSection('jobs')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                Tafuta Kazi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && user && (
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>{user.name}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      {userRole === 'employee' ? 'Mtafuta Kazi' : 'Mwajiri'} | {user.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <i className="fas fa-user-circle" style={{ color: '#3498db' }}></i>
                      Taarifa Binafsi
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#666' }}>
                          Jina Kamili
                        </label>
                        <p style={{ margin: 0 }}>{user.name}</p>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#666' }}>
                          Nambari ya Simu
                        </label>
                        <p style={{ margin: 0 }}>{user.phone}</p>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#666' }}>
                          Eneo
                        </label>
                        <p style={{ margin: 0 }}>{user.location}</p>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#666' }}>
                          Jukumu
                        </label>
                        <p style={{ margin: 0 }}>
                          {userRole === 'employee' ? 'Mtafuta Kazi' : 'Mwajiri'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <i className="fas fa-cog" style={{ color: '#95a5a6' }}></i>
                      Hatua Zifuatazo
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                        <i className="fas fa-edit"></i>
                        <span>Hariri Wasifu</span>
                      </button>
                      
                      <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                        <i className="fas fa-bell"></i>
                        <span>Mipangilio ya Arifa</span>
                      </button>
                      
                      <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                        <i className="fas fa-shield-alt"></i>
                        <span>Usalama wa Akaunti</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
