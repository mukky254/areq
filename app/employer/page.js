
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'

export default function EmployerPage() {
  const [user, setUser] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'kilimo',
    salary: '',
    experience: '',
    skills: '',
    phone: '',
    businessType: ''
  })
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    hired: 0
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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

      if (user.role !== 'employer') {
        router.push('/dashboard')
        return
      }

      // Load employer jobs from localStorage first, then API
      const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]')
      if (savedJobs.length > 0) {
        setJobs(savedJobs)
        setStats(prev => ({ 
          ...prev, 
          totalJobs: savedJobs.length,
          activeJobs: savedJobs.filter(job => !job.closed)?.length || 0
        }))
      }

      // Load applications
      const applicationsResponse = await ApiService.getEmployerApplications(user._id)
      if (applicationsResponse.success) {
        setApplications(applicationsResponse.applications || [])
        setStats(prev => ({ 
          ...prev, 
          totalApplications: applicationsResponse.applications?.length || 0,
          hired: applicationsResponse.applications?.filter(app => app.status === 'hired')?.length || 0
        }))
      }

      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }

    } catch (error) {
      console.error('Error loading employer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSubmit = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...jobForm,
        employerId: user._id,
        employerName: user.name,
        businessType: jobForm.businessType || user.name,
        skills: jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        urgent: false,
        featured: false
      }

      const response = await ApiService.createJob(jobData)
      if (response.success) {
        const newJobs = [...jobs, response.job]
        setJobs(newJobs)
        localStorage.setItem('employerJobs', JSON.stringify(newJobs))
        
        setShowJobForm(false)
        setJobForm({
          title: '',
          description: '',
          location: '',
          category: 'kilimo',
          salary: '',
          experience: '',
          skills: '',
          phone: user.phone || '',
          businessType: ''
        })
        
        alert(currentLanguage === 'en' ? 'Job posted successfully!' : 'Kazi imetangazwa kikamilifu!')
        setStats(prev => ({ 
          ...prev, 
          totalJobs: prev.totalJobs + 1,
          activeJobs: prev.activeJobs + 1
        }))
      }
    } catch (error) {
      console.error('Error creating job:', error)
      alert(currentLanguage === 'en' ? 'Failed to post job' : 'Imeshindwa kutangaza kazi')
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await ApiService.updateApplicationStatus(applicationId, status)
      if (response.success) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status } : app
          )
        )
      }
    } catch (error) {
      console.error('Error updating application:', error)
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
      router.push('/auth')
    }
  }

  if (!mounted || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>
          {currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}
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
              <span className="role-badge">
                {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
              </span>
            </div>
            
            <div className="user-menu">
              <div className="language-switcher" onClick={toggleLanguage}>
                <span>{currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}</span>
              </div>
              
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div>
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role">
                    {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
                  </div>
                </div>
              </div>
              
              <button onClick={logout} className="btn btn-danger">
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
            {[
              { id: 'dashboard', icon: 'fa-chart-line', en: 'Dashboard', sw: 'Dashibodi' },
              { id: 'post-job', icon: 'fa-plus-circle', en: 'Post Job', sw: 'Tanga Kazi' },
              { id: 'my-jobs', icon: 'fa-briefcase', en: 'My Jobs', sw: 'Kazi Zangu' },
              { id: 'applications', icon: 'fa-file-alt', en: 'Applications', sw: 'Maombi' },
              { id: 'profile', icon: 'fa-user-tie', en: 'Profile', sw: 'Wasifu' }
            ].map(section => (
              <div
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={`fas ${section.icon}`}></i>
                <span>{currentLanguage === 'en' ? section.en : section.sw}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h1>
                    {currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!
                  </h1>
                  <p>
                    {currentLanguage === 'en' 
                      ? 'Manage your job posts and find qualified workers' 
                      : 'Dhibiti matangazo yako ya kazi na upate wafanyikazi waliohitimu'
                    }
                  </p>
                </div>
              </div>

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
                  <div className="stat-icon secondary">
                    <i className="fas fa-play-circle"></i>
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
                  <div className="stat-icon success">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.hired}</h3>
                    <p>{currentLanguage === 'en' ? 'Hired' : 'Waliokwishaajiriwa'}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h2>
                    <i className="fas fa-bolt"></i>
                    {currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo Vya Haraka'}
                  </h2>
                  <div className="quick-actions-grid">
                    <button 
                      onClick={() => setActiveSection('post-job')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-plus"></i>
                      <span>{currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('applications')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-file-alt"></i>
                      <span>{currentLanguage === 'en' ? 'View Applications' : 'Angalia Maombi'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('my-jobs')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-briefcase"></i>
                      <span>{currentLanguage === 'en' ? 'My Jobs' : 'Kazi Zangu'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveSection('profile')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-cog"></i>
                      <span>{currentLanguage === 'en' ? 'Settings' : 'Mipangilio'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Job Section */}
          {activeSection === 'post-job' && (
            <div className="card">
              <div className="card-body">
                <h2>
                  <i className="fas fa-plus-circle"></i>
                  {currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}
                </h2>

                <form onSubmit={handleJobSubmit} className="job-form">
                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Job Title' : 'Kichwa cha Kazi'}
                    </label>
                    <input
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                      className="form-control"
                      placeholder={currentLanguage === 'en' ? 'e.g. Farm Worker' : 'K.m. Mfanyakazi Shambani'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Job Description' : 'Maelezo ya Kazi'}
                    </label>
                    <textarea
                      value={jobForm.description}
                      onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      className="form-control"
                      rows="4"
                      placeholder={currentLanguage === 'en' ? 'Describe the job responsibilities...' : 'Eleza majukumu ya kazi...'}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Location' : 'Eneo'}
                      </label>
                      <input
                        type="text"
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                        className="form-control"
                        placeholder={currentLanguage === 'en' ? 'e.g. Nairobi' : 'K.m. Nairobi'}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Business Type' : 'Aina ya Biashara'}
                      </label>
                      <input
                        type="text"
                        value={jobForm.businessType}
                        onChange={(e) => setJobForm(prev => ({ ...prev, businessType: e.target.value }))}
                        className="form-control"
                        placeholder={currentLanguage === 'en' ? 'e.g. Farm, Construction Company' : 'K.m. Shamba, Kampuni ya Ujenzi'}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Category' : 'Aina ya Kazi'}
                      </label>
                      <select
                        value={jobForm.category}
                        onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                        className="form-control"
                        required
                      >
                        <option value="kilimo">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                        <option value="ujenzi">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                        <option value="nyumbani">{currentLanguage === 'en' ? 'Domestic' : 'Kazi ya Nyumbani'}</option>
                        <option value="usafiri">{currentLanguage === 'en' ? 'Transport' : 'Usafiri'}</option>
                        <option value="huduma">{currentLanguage === 'en' ? 'Services' : 'Huduma'}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Salary' : 'Mshahara'}
                      </label>
                      <input
                        type="text"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                        className="form-control"
                        placeholder={currentLanguage === 'en' ? 'e.g. 15,000 KES/month' : 'K.m. 15,000 TZS/mwezi'}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Experience Required' : 'Uzoefu Unahitajika'}
                      </label>
                      <input
                        type="text"
                        value={jobForm.experience}
                        onChange={(e) => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                        className="form-control"
                        placeholder={currentLanguage === 'en' ? 'e.g. 2+ years' : 'K.m. Miaka 2+'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {currentLanguage === 'en' ? 'Contact Phone' : 'Nambari ya Mawasiliano'}
                      </label>
                      <input
                        type="tel"
                        value={jobForm.phone}
                        onChange={(e) => setJobForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="form-control"
                        placeholder="07XXXXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Required Skills (comma separated)' : 'Ujuzi Unahitajika (tenganisha kwa koma)'}
                    </label>
                    <input
                      type="text"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                      className="form-control"
                      placeholder={currentLanguage === 'en' ? 'e.g. Farming, Driving, Cooking' : 'K.m. Kilimo, Kuendesha Gari, Kupika'}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    <i className="fas fa-paper-plane"></i>
                    {currentLanguage === 'en' ? 'Post Job' : 'Tanga Kazi'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* My Jobs Section */}
          {activeSection === 'my-jobs' && (
            <div className="card">
              <div className="card-body">
                <h2>
                  <i className="fas fa-briefcase"></i>
                  {currentLanguage === 'en' ? 'My Job Posts' : 'Kazi Niliyotangaza'} ({jobs.length})
                </h2>

                <div className="jobs-grid">
                  {jobs.length > 0 ? jobs.map(job => (
                    <div key={job._id} className="job-card">
                      <div className="job-card-header">
                        <div className="job-title">{job.title}</div>
                        <div className="job-badges">
                          <span className="badge badge-primary">{job.category}</span>
                          <span className={`badge ${job.closed ? 'badge-warning' : 'badge-success'}`}>
                            {job.closed ? (currentLanguage === 'en' ? 'Closed' : 'Imefungwa') : (currentLanguage === 'en' ? 'Active' : 'Inaendelea')}
                          </span>
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
                            {job.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="job-card-footer">
                        <div className="job-posted-date">
                          {currentLanguage === 'en' ? 'Posted:' : 'Iliyotangazwa:'} {new Date(job.postedDate).toLocaleDateString('sw-TZ')}
                        </div>
                        <div className="job-actions">
                          <button className="btn btn-primary btn-sm">
                            <i className="fas fa-eye"></i>
                            {currentLanguage === 'en' ? 'View' : 'Angalia'}
                          </button>
                          <button className="btn btn-warning btn-sm">
                            <i className="fas fa-edit"></i>
                            {currentLanguage === 'en' ? 'Edit' : 'Hariri'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-briefcase"></i>
                      <h3>{currentLanguage === 'en' ? 'No Jobs Posted' : 'Hakuna Kazi Uliyotangaza'}</h3>
                      <p>
                        {currentLanguage === 'en' 
                          ? 'You haven\'t posted any jobs yet. Start by posting your first job!' 
                          : 'Bado hujatangaza kazi yoyote. Anza kwa kutangaza kazi yako ya kwanza!'
                        }
                      </p>
                      <button 
                        onClick={() => setActiveSection('post-job')}
                        className="btn btn-primary"
                      >
                        {currentLanguage === 'en' ? 'Post First Job' : 'Tanga Kazi ya Kwanza'}
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
                <h2>
                  <i className="fas fa-file-alt"></i>
                  {currentLanguage === 'en' ? 'Job Applications' : 'Maombi ya Kazi'} ({applications.length})
                </h2>

                <div className="applications-list">
                  {applications.length > 0 ? applications.map(application => (
                    <div key={application._id} className="application-card">
                      <div className="application-header">
                        <div className="application-title">
                          <h3>{application.jobTitle}</h3>
                          <p>{currentLanguage === 'en' ? 'Applicant:' : 'Mtafuta Kazi:'} {application.applicantName}</p>
                        </div>
                        <div className="application-status">
                          <span className={`status-badge status-${application.status}`}>
                            {application.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="application-body">
                        <p className="application-message">{application.coverLetter}</p>
                        <div className="application-details">
                          <div className="application-detail">
                            <i className="fas fa-calendar"></i>
                            <span>
                              {currentLanguage === 'en' ? 'Applied:' : 'Iliyotumwa:'} {new Date(application.appliedDate).toLocaleDateString('sw-TZ')}
                            </span>
                          </div>
                          <div className="application-detail">
                            <i className="fas fa-phone"></i>
                            <span>{application.applicantPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="application-actions">
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'accepted')}
                          className="btn btn-success btn-sm"
                          disabled={application.status === 'accepted'}
                        >
                          <i className="fas fa-check"></i>
                          {currentLanguage === 'en' ? 'Accept' : 'Kubali'}
                        </button>
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                          disabled={application.status === 'rejected'}
                        >
                          <i className="fas fa-times"></i>
                          {currentLanguage === 'en' ? 'Reject' : 'Kataa'}
                        </button>
                        <a 
                          href={`tel:${application.applicantPhone}`}
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fas fa-phone"></i>
                          {currentLanguage === 'en' ? 'Call' : 'Piga Simu'}
                        </a>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-file-alt"></i>
                      <h3>{currentLanguage === 'en' ? 'No Applications' : 'Hakuna Maombi'}</h3>
                      <p>
                        {currentLanguage === 'en' 
                          ? 'No job applications received yet. Applications will appear here when job seekers apply to your jobs.' 
                          : 'Bado hakuna maombi ya kazi yaliyopokelewa. Maombi yataonekana hapa wakati watafuta kazi wanapotuma maombi kwa kazi zako.'
                        }
                      </p>
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
                <div className="profile-header">
                  <div className="user-avatar large">
                    {user.name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h2>{user.name}</h2>
                    <p>
                      {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'} | {user.location}
                    </p>
                  </div>
                </div>

                <div className="profile-content">
                  <div className="profile-section">
                    <h3>
                      <i className="fas fa-user-circle"></i>
                      {currentLanguage === 'en' ? 'Personal Information' : 'Taarifa Binafsi'}
                    </h3>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}</label>
                        <p>{user.name}</p>
                      </div>
                      
                      <div className="info-item">
                        <label>{currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}</label>
                        <p>{user.phone}</p>
                      </div>
                      
                      <div className="info-item">
                        <label>{currentLanguage === 'en' ? 'Location' : 'Eneo'}</label>
                        <p>{user.location}</p>
                      </div>
                      
                      <div className="info-item">
                        <label>{currentLanguage === 'en' ? 'Role' : 'Jukumu'}</label>
                        <p>{currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>
                      <i className="fas fa-cog"></i>
                      {currentLanguage === 'en' ? 'Next Steps' : 'Hatua Zifuatazo'}
                    </h3>
                    
                    <div className="action-buttons">
                      <button className="btn btn-primary">
                        <i className="fas fa-edit"></i>
                        <span>{currentLanguage === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}</span>
                      </button>
                      
                      <button className="btn btn-primary">
                        <i className="fas fa-bell"></i>
                        <span>{currentLanguage === 'en' ? 'Notification Settings' : 'Mipangilio ya Arifa'}</span>
                      </button>
                      
                      <button className="btn btn-primary">
                        <i className="fas fa-shield-alt"></i>
                        <span>{currentLanguage === 'en' ? 'Account Security' : 'Usalama wa Akaunti'}</span>
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
