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
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: ''
  })
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
      setUserRole(user.role)
      setEditProfile({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || ''
      })

      const jobsResponse = await ApiService.getJobs()
      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
      }

      const applicationsResponse = await ApiService.getMyApplications()
      if (applicationsResponse.success) {
        setApplications(applicationsResponse.applications || [])
      }

      const favoritesResponse = await ApiService.getFavorites(user._id)
      if (favoritesResponse.success) {
        setFavorites(favoritesResponse.favorites || [])
      }

      const savedLanguage = localStorage.getItem('preferredLanguage') || 'sw'
      setCurrentLanguage(savedLanguage)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (jobId) => {
    try {
      const job = jobs.find(j => j._id === jobId)
      if (!job) return

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
          ? 'I am interested in this job and believe I have the required skills.' 
          : 'Nina hamu ya kufanya kazi hii na naamini nina ujuzi unaohitajika.'
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
        alert(currentLanguage === 'en' ? 'Application submitted successfully!' : 'Ombi lako limewasilishwa kikamilifu!')
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
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(jobText)
      alert(currentLanguage === 'en' ? 'Job details copied to clipboard!' : 'Maelezo ya kazi yameigwa kwenye clipboard!')
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
        alert(currentLanguage === 'en' ? 'Profile updated successfully!' : 'Wasifu umehakikishwa!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(currentLanguage === 'en' ? 'Failed to update profile' : 'Imeshindwa kusasisha wasifu')
    }
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
        <p style={{ marginTop: '16px', color: 'white' }}>
          {currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'white' }}>
          {currentLanguage === 'en' ? 'Redirecting...' : 'Inaelekeza...'}
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hands-helping"></i>
              <span>Kazi Mashinani</span>
            </div>
            
            <div className="user-menu">
              <button
                onClick={toggleLanguage}
                className="language-switcher-btn"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333'
                }}
              >
                {currentLanguage === 'en' ? '🇺🇸 EN' : '🇰🇪 SW'}
              </button>
              
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {userRole === 'employee' ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi') : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={logout}
                className="btn"
                style={{ 
                  background: '#e74c3c', 
                  color: 'white',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>{currentLanguage === 'en' ? 'Logout' : 'Toka'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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
                  {section === 'home' && (currentLanguage === 'en' ? 'Home' : 'Nyumbani')}
                  {section === 'jobs' && (currentLanguage === 'en' ? 'Jobs' : 'Kazi')}
                  {section === 'favorites' && (currentLanguage === 'en' ? 'Favorites' : 'Vipendwa')}
                  {section === 'applications' && (currentLanguage === 'en' ? 'Applications' : 'Maombi')}
                  {section === 'profile' && (currentLanguage === 'en' ? 'Profile' : 'Wasifu')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {/* Home Section with Blog */}
          {activeSection === 'home' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h1 style={{ margin: 0, fontSize: '2rem' }}>
                    {currentLanguage === 'en' ? 'Welcome back, ' : 'Karibu tena, '}{user?.name}!
                  </h1>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                    {currentLanguage === 'en' 
                      ? 'Your next opportunity awaits in rural areas' 
                      : 'Fursa yako ijayo inangojea katika maeneo ya vijijini'
                    }
                  </p>
                </div>
              </div>

              {/* Blog Section */}
              <div className="card">
                <div className="card-body">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#006600' }}>
                    <i className="fas fa-blog"></i>
                    {currentLanguage === 'en' ? 'Employment Opportunities in Rural Areas' : 'Fursa za Ajira Katika Maeneo ya Vijijini'}
                  </h2>
                  
                  <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#555' }}>
                    <p style={{ marginBottom: '20px' }}>
                      {currentLanguage === 'en' 
                        ? 'Rural areas offer unique employment opportunities that can transform your career and life. From agriculture to construction, domestic work to transportation services, there are numerous ways to build a sustainable livelihood while contributing to local community development.'
                        : 'Maeneo ya vijijini yanatoa fursa za kipekee za ajira ambazo zinaweza kubadilisha kazi yako na maisha. Kuanzia kilimo hadi ujenzi, kazi za nyumbani hadi huduma za usafiri, kuna njia nyingi za kujenga riziki endelevu huku ukichangia maendeleo ya jamii ya ndani.'
                      }
                    </p>

                    <h3 style={{ color: '#0066cc', margin: '25px 0 15px 0' }}>
                      {currentLanguage === 'en' ? 'Why Consider Rural Employment?' : 'Kwa Nini Ufikirie Ajira ya Vijijini?'}
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div style={{ padding: '20px', background: '#f0f8ff', borderRadius: '10px', borderLeft: '4px solid #0066cc' }}>
                        <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
                          <i className="fas fa-seedling" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Growing Opportunities' : 'Fursa Zanazokua'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Agriculture, construction, and service industries are rapidly expanding in rural areas, creating new job opportunities every day.'
                            : 'Kilimo, ujenzi na viwanda vya huduma vinakua kwa kasi katika maeneo ya vijijini, zikiunda fursa mpya za kazi kila siku.'
                          }
                        </p>
                      </div>

                      <div style={{ padding: '20px', background: '#f0fff0', borderRadius: '10px', borderLeft: '4px solid #009900' }}>
                        <h4 style={{ color: '#009900', margin: '0 0 10px 0' }}>
                          <i className="fas fa-home" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Community Impact' : 'Athari ya Jamii'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Working in rural areas allows you to directly contribute to local economic development and community growth.'
                            : 'Kufanya kazi katika maeneo ya vijijini kunakuruhusu kuchangia moja kwa moja kwa maendeleo ya kiuchumi ya ndani na ukuaji wa jamii.'
                          }
                        </p>
                      </div>

                      <div style={{ padding: '20px', background: '#fff8f0', borderRadius: '10px', borderLeft: '4px solid #ff6600' }}>
                        <h4 style={{ color: '#ff6600', margin: '0 0 10px 0' }}>
                          <i className="fas fa-hand-holding-usd" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Cost of Living' : 'Gharama ya Maisha'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Lower cost of living in rural areas means your income can go further, providing better quality of life.'
                            : 'Gharama ya chini ya maisha katika maeneo ya vijijini inamaanisha mapato yako yanaweza kutumika zaidi, na kutoa ubora bora wa maisha.'
                          }
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '30px', padding: '20px', background: '#e6f7ff', borderRadius: '10px' }}>
                      <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
                        {currentLanguage === 'en' ? 'Ready to Find Your Next Opportunity?' : 'Tayari Kupata Fursa Yako Ijayo?'}
                      </h3>
                      <p style={{ marginBottom: '20px' }}>
                        {currentLanguage === 'en' 
                          ? 'Explore available jobs in various sectors and start your journey toward meaningful employment in rural communities.'
                          : 'Chunguza kazi zilizopo katika sekta mbalimbali na anza safari yako kuelekea ajira yenye maana katika jamii za vijijini.'
                        }
                      </p>
                      <button 
                        onClick={() => setActiveSection('jobs')}
                        className="btn btn-primary"
                        style={{ padding: '12px 30px', fontSize: '16px' }}
                      >
                        <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                        {currentLanguage === 'en' ? 'Browse Jobs' : 'Vinjari Kazi'}
                      </button>
                    </div>
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
                    {currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'} ({jobs.length})
                  </h2>

                  <div className="jobs-grid">
                    {jobs.length > 0 ? jobs.map(job => (
                      <div key={job._id} className="job-card">
                        <div className="job-card-header">
                          <div className="job-title">{job.title}</div>
                          <div className="job-badges">
                            <span className="badge badge-primary">{job.category}</span>
                            {job.urgent && <span className="badge badge-warning">{currentLanguage === 'en' ? 'Urgent' : 'Ya Haraka'}</span>}
                            {job.featured && <span className="badge badge-secondary">{currentLanguage === 'en' ? 'Featured' : 'Iliyoboreshwa'}</span>}
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
                            {job.salary && (
                              <div className="job-detail">
                                <i className="fas fa-money-bill"></i>
                                <span>{job.salary}</span>
                              </div>
                            )}
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
                            <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
                          </a>
                          <button
                            onClick={() => toggleFavorite(job._id)}
                            className="btn"
                            style={{ 
                              background: favorites.some(fav => fav.jobId === job._id) ? '#e74c3c' : '#95a5a6',
                              color: 'white'
                            }}
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                          <button
                            onClick={() => shareJob(job)}
                            className="btn"
                            style={{ 
                              background: '#3498db',
                              color: 'white'
                            }}
                          >
                            <i className="fas fa-share"></i>
                          </button>
                        </div>

                        <div style={{ padding: '0 20px 20px' }}>
                          <button
                            onClick={() => applyForJob(job._id)}
                            className="btn btn-primary btn-block"
                            disabled={applications.some(app => app.jobId === job._id)}
                          >
                            {applications.some(app => app.jobId === job._id) 
                              ? (currentLanguage === 'en' ? 'Applied' : 'Umeomba') 
                              : (currentLanguage === 'en' ? 'Apply Now' : 'Omba Sasa')
                            }
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state">
                        <i className="fas fa-briefcase"></i>
                        <h3>{currentLanguage === 'en' ? 'No Jobs Available' : 'Hakuna Kazi Zilizopatikana'}</h3>
                        <p>{currentLanguage === 'en' ? 'No jobs available at the moment. Please check back later.' : 'Hakuna kazi zilizopo kwa sasa. Tafadhali angalia tena baadaye.'}</p>
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
                  {currentLanguage === 'en' ? 'Favorite Jobs' : 'Kazi Unazopenda'} ({favorites.length})
                </h2>

                <div className="jobs-grid">
                  {favorites.length > 0 ? favorites.map(favorite => {
                    const job = jobs.find(j => j._id === favorite.jobId)
                    if (!job) return null
                    return (
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
                            <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
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
                          <button
                            onClick={() => shareJob(job)}
                            className="btn"
                            style={{ 
                              background: '#3498db',
                              color: 'white'
                            }}
                          >
                            <i className="fas fa-share"></i>
                          </button>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="empty-state">
                      <i className="fas fa-heart"></i>
                      <h3>{currentLanguage === 'en' ? 'No Favorite Jobs' : 'Hakuna Kazi Unazopenda'}</h3>
                      <p>{currentLanguage === 'en' ? 'You haven\'t added any jobs to your favorites yet.' : 'Bado hujaweka kazi yoyote kwenye orodha ya vipendwa.'}</p>
                      <button 
                        onClick={() => setActiveSection('jobs')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                        {currentLanguage === 'en' ? 'Browse Jobs' : 'Vinjari Kazi'}
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
                  {currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'} ({applications.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {applications.length > 0 ? applications.map(application => (
                    <div key={application.id} style={{ 
                      padding: '20px', 
                      background: '#f8f9fa', 
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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
                          {application.status === 'pending' ? (currentLanguage === 'en' ? 'Pending' : 'Inasubiri') :
                           application.status === 'accepted' ? (currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa') :
                           (currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa')}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        {currentLanguage === 'en' ? 'Employer:' : 'Mwajiri:'} {application.employer}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>
                        {currentLanguage === 'en' ? 'Date:' : 'Tarehe:'} {new Date(application.appliedDate).toLocaleDateString('sw-TZ')}
                      </p>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-file-alt"></i>
                      <h3>{currentLanguage === 'en' ? 'No Applications' : 'Hakuna Maombi'}</h3>
                      <p>{currentLanguage === 'en' ? 'You haven\'t applied for any jobs yet.' : 'Bado hujaomba kazi yoyote.'}</p>
                      <button 
                        onClick={() => setActiveSection('jobs')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                        {currentLanguage === 'en' ? 'Browse Jobs' : 'Vinjari Kazi'}
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
                      {userRole === 'employee' ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi') : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')} | {user.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <i className="fas fa-user-edit" style={{ color: '#3498db' }}></i>
                      {currentLanguage === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}
                    </h3>
                    
                    <form onSubmit={handleUpdateProfile}>
                      <div className="form-group">
                        <label className="form-label">
                          {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'} *
                        </label>
                        <input
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="form-control"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">
                          {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'} *
                        </label>
                        <input
                          type="tel"
                          value={editProfile.phone}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="form-control"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">
                          {currentLanguage === 'en' ? 'Location' : 'Eneo'} *
                        </label>
                        <input
                          type="text"
                          value={editProfile.location}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="form-control"
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary btn-block">
                        <i className="fas fa-save"></i>
                        {currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko'}
                      </button>
                    </form>
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
