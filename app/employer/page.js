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
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'kilimo',
    skills: '',
    phone: ''
  })
  const [editJob, setEditJob] = useState(null)
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    location: '',
    businessName: ''
  })
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'sw'
    setCurrentLanguage(savedLanguage)
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

      // Load employer jobs
      const jobsResponse = await ApiService.getEmployerJobs(user._id)
      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs || [])
      }

      // Load applications
      const applicationsResponse = await ApiService.getEmployerApplications(user._id)
      if (applicationsResponse.success) {
        setApplications(applicationsResponse.applications || [])
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
        businessType: user.businessName || user.name,
        skills: jobForm.skills ? jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
        postedDate: new Date().toISOString()
      }

      const response = await ApiService.createJob(jobData)
      if (response.success) {
        const newJobs = [...jobs, response.job]
        setJobs(newJobs)
        localStorage.setItem('employerJobs', JSON.stringify(newJobs))
        
        setJobForm({
          title: '',
          description: '',
          location: '',
          category: 'kilimo',
          skills: '',
          phone: user.phone || ''
        })
        
        alert(currentLanguage === 'en' ? 'Job posted successfully!' : 'Kazi imetangazwa kikamilifu!')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      alert(currentLanguage === 'en' ? 'Failed to post job' : 'Imeshindwa kutangaza kazi')
    }
  }

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

  const handleUpdateJob = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...jobForm,
        skills: jobForm.skills ? jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
      }

      const response = await ApiService.updateJob(editJob._id, jobData)
      if (response.success) {
        const updatedJobs = jobs.map(job => 
          job._id === editJob._id ? response.job : job
        )
        setJobs(updatedJobs)
        localStorage.setItem('employerJobs', JSON.stringify(updatedJobs))
        
        setEditJob(null)
        setJobForm({
          title: '',
          description: '',
          location: '',
          category: 'kilimo',
          skills: '',
          phone: user.phone || ''
        })
        
        alert(currentLanguage === 'en' ? 'Job updated successfully!' : 'Kazi imesasishwa kikamilifu!')
        setActiveSection('my-jobs')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      alert(currentLanguage === 'en' ? 'Failed to update job' : 'Imeshindwa kusasisha kazi')
    }
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

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await ApiService.updateApplicationStatus(applicationId, status)
      if (response.success) {
        const updatedApplications = applications.map(app => 
          app._id === applicationId ? { ...app, status } : app
        )
        setApplications(updatedApplications)
        
        const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]')
        const updatedAllApplications = allApplications.map(app =>
          app._id === applicationId ? { ...app, status } : app
        )
        localStorage.setItem('jobApplications', JSON.stringify(updatedAllApplications))
        
        alert(currentLanguage === 'en' ? 'Application updated!' : 'Ombi limebadilishwa!')
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

  const openSideNav = () => {
    setSideNavOpen(true)
  }

  const closeSideNav = () => {
    setSideNavOpen(false)
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

  return (
    <div className="dashboard">
      {/* Header */}
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
              <button
                onClick={toggleLanguage}
                className="google-translate"
              >
                {currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}
              </button>
              
              <button 
                className="menu-button"
                onClick={openSideNav}
              >
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
          <h2 className="side-nav-title">Quick Links</h2>
          <button className="side-nav-close" onClick={closeSideNav}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="side-nav-content">
          <a 
            href="/blog" 
            className="side-nav-item"
            onClick={closeSideNav}
          >
            <i className="fas fa-info-circle"></i>
            <span>About Kazi Mashinani</span>
          </a>
          
          <a 
            href="tel:+254790528837" 
            className="side-nav-item"
            onClick={closeSideNav}
          >
            <i className="fas fa-phone"></i>
            <span>Call Us: +254790528837</span>
          </a>
          
          <a 
            href="mailto:myhassan19036@gmail.com" 
            className="side-nav-item"
            onClick={closeSideNav}
          >
            <i className="fas fa-envelope"></i>
            <span>Email: myhassan19036@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Dashboard Section with Blog */}
          {activeSection === 'dashboard' && (
            <div className="page-transition">
              <div className="card">
                <div className="card-header">
                  <h1 style={{ margin: 0, fontSize: '2rem' }}>
                    {currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!
                  </h1>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                    {currentLanguage === 'en' 
                      ? 'Make a difference in your community by creating employment opportunities' 
                      : 'Fanya tofauti katika jamii yako kwa kuunda fursa za ajira'
                    }
                  </p>
                </div>
              </div>

              {/* Blog Section */}
              <div className="card">
                <div className="card-body">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#006600' }}>
                    <i className="fas fa-handshake"></i>
                    {currentLanguage === 'en' ? 'Employers: Be the Solution to Unemployment' : 'Waajiri: Kuwa Suluhisho la Ukosefu wa Ajira'}
                  </h2>
                  
                  <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#555' }}>
                    <p style={{ marginBottom: '20px' }}>
                      {currentLanguage === 'en' 
                        ? 'As an employer on Kazi Mashinani, you play a crucial role in addressing unemployment in our communities. By posting job opportunities, you\'re not just filling positions - you\'re transforming lives and strengthening local economies.'
                        : 'Kama mwajiri kwenye Kazi Mashinani, unacheza jukumu muhimu katika kushughulikia ukosefu wa ajira katika jamii zetu. Kwa kutangaza fursa za kazi, wewe si tu unajaza nafasi - unabadilisha maisha na kuimarisha uchumi wa ndani.'
                      }
                    </p>

                    <h3 style={{ color: '#0066cc', margin: '25px 0 15px 0' }}>
                      {currentLanguage === 'en' ? 'How You Can Make an Impact:' : 'Jinsi Unaweza Kufanya Mabadiliko:'}
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div style={{ padding: '20px', background: '#f0f8ff', borderRadius: '10px', borderLeft: '4px solid #0066cc' }}>
                        <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
                          <i className="fas fa-users" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Create Local Opportunities' : 'Unda Fursa za Ndani'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Hire from within your community to keep wealth circulating locally and build stronger community ties.'
                            : 'Ajiri kutoka ndani ya jamii yako ili kuweka utajirizunguka ndani na kujenga uhusiano dhabiti wa kijamii.'
                          }
                        </p>
                      </div>

                      <div style={{ padding: '20px', background: '#f0fff0', borderRadius: '10px', borderLeft: '4px solid #009900' }}>
                        <h4 style={{ color: '#009900', margin: '0 0 10px 0' }}>
                          <i className="fas fa-graduation-cap" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Provide Skills Training' : 'Toa Mafunzo ya Ujuzi'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Consider offering on-the-job training for entry-level positions to help develop local talent.'
                            : 'Fikiria kutoa mafunzo ya kazini kwa nafasi za kuanzia ili kusaidia kuendeleza talanta za ndani.'
                          }
                        </p>
                      </div>

                      <div style={{ padding: '20px', background: '#fff8f0', borderRadius: '10px', borderLeft: '4px solid #ff6600' }}>
                        <h4 style={{ color: '#ff6600', margin: '0 0 10px 0' }}>
                          <i className="fas fa-heart" style={{ marginRight: '10px' }}></i>
                          {currentLanguage === 'en' ? 'Support Economic Growth' : 'Tekeleza Ukuaji wa Kiuchumi'}
                        </h4>
                        <p style={{ margin: 0 }}>
                          {currentLanguage === 'en' 
                            ? 'Every job you create supports multiple families and contributes to the overall economic development of rural areas.'
                            : 'Kila kazi unayounda inasaidia familia nyingi na inachangia kukuza kwa uchumi wa maeneo ya vijijini.'
                          }
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '30px', padding: '20px', background: '#e6f7ff', borderRadius: '10px', textAlign: 'center' }}>
                      <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
                        {currentLanguage === 'en' ? 'Ready to Make a Difference?' : 'Tayari Kufanya Mabadiliko?'}
                      </h3>
                      <p style={{ marginBottom: '20px' }}>
                        {currentLanguage === 'en' 
                          ? 'Start by posting your first job opportunity and become part of the solution to unemployment in rural communities.'
                          : 'Anza kwa kutangaza fursa yako ya kwanza ya kazi na kuwa sehemu ya suluhisho la ukosefu wa ajira katika jamii za vijijini.'
                        }
                      </p>
                      <button 
                        onClick={() => setActiveSection('post-job')}
                        className="btn btn-primary"
                        style={{ padding: '12px 30px', fontSize: '16px' }}
                      >
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                        {currentLanguage === 'en' ? 'Post a Job' : 'Tanga Kazi'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post/Edit Job Section */}
          {activeSection === 'post-job' && (
            <div className="card page-transition">
              <div className="card-body">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <i className="fas fa-plus-circle" style={{ color: '#2ecc71' }}></i>
                  {editJob 
                    ? (currentLanguage === 'en' ? 'Edit Job' : 'Hariri Kazi')
                    : (currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya')
                  }
                </h2>

                <form onSubmit={editJob ? handleUpdateJob : handleJobSubmit} className="job-form">
                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Job Title' : 'Kichwa cha Kazi'} *
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
                      {currentLanguage === 'en' ? 'Job Description' : 'Maelezo ya Kazi'} *
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
                        {currentLanguage === 'en' ? 'Location' : 'Eneo'} *
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
                        {currentLanguage === 'en' ? 'Category' : 'Aina ya Kazi'} *
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Required Skills (optional)' : 'Ujuzi Unahitajika (si lazima)'}
                    </label>
                    <input
                      type="text"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                      className="form-control"
                      placeholder={currentLanguage === 'en' ? 'e.g. Farming, Driving, Cooking' : 'K.m. Kilimo, Kuendesha Gari, Kupika'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentLanguage === 'en' ? 'Contact Phone' : 'Nambari ya Mawasiliano'} *
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

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      <i className="fas fa-paper-plane"></i>
                      {editJob 
                        ? (currentLanguage === 'en' ? 'Update Job' : 'Sasisha Kazi')
                        : (currentLanguage === 'en' ? 'Post Job' : 'Tanga Kazi')
                      }
                    </button>
                    {editJob && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditJob(null)
                          setJobForm({
                            title: '',
                            description: '',
                            location: '',
                            category: 'kilimo',
                            skills: '',
                            phone: user.phone || ''
                          })
                        }}
                        className="btn btn-danger"
                      >
                        <i className="fas fa-times"></i>
                        {currentLanguage === 'en' ? 'Cancel' : 'Ghairi'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My Jobs Section */}
          {activeSection === 'my-jobs' && (
            <div className="card page-transition">
              <div className="card-body">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <i className="fas fa-briefcase" style={{ color: '#3498db' }}></i>
                  {currentLanguage === 'en' ? 'My Job Posts' : 'Kazi Niliyotangaza'} ({jobs.length})
                </h2>

                <div className="jobs-grid">
                  {jobs.length > 0 ? jobs.map(job => (
                    <div key={job._id} className="job-card hover-lift">
                      <div className="job-card-header">
                        <div className="job-title">{job.title}</div>
                        <div className="job-badges">
                          <span className="badge badge-primary">{job.category}</span>
                          <span className={`badge ${job.closed ? 'badge-warning' : 'badge-success'}`}>
                            {job.closed 
                              ? (currentLanguage === 'en' ? 'Closed' : 'Imefungwa') 
                              : (currentLanguage === 'en' ? 'Active' : 'Inaendelea')
                            }
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
                            <i className="fas fa-phone"></i>
                            <span>{job.phone}</span>
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
                          <button 
                            onClick={() => shareJob(job)}
                            className="btn btn-primary btn-sm hover-lift"
                          >
                            <i className="fas fa-share"></i>
                            {currentLanguage === 'en' ? 'Share' : 'Shiriki'}
                          </button>
                          <button 
                            onClick={() => handleEditJob(job)}
                            className="btn btn-warning btn-sm hover-lift"
                          >
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
                        className="btn btn-primary hover-lift"
                        style={{ marginTop: '16px' }}
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
            <div className="card page-transition">
              <div className="card-body">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <i className="fas fa-file-alt" style={{ color: '#2ecc71' }}></i>
                  {currentLanguage === 'en' ? 'Job Applications' : 'Maombi ya Kazi'} ({applications.length})
                </h2>

                <div className="applications-list">
                  {applications.length > 0 ? applications.map(application => (
                    <div key={application._id} className="application-card hover-lift">
                      <div className="application-header">
                        <div className="application-title">
                          <h3 style={{ margin: 0 }}>{application.jobTitle}</h3>
                          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            {currentLanguage === 'en' ? 'Applicant:' : 'Mtafuta Kazi:'} {application.applicantName || 'Applicant'}
                          </p>
                        </div>
                        <div className="application-status">
                          <span className={`status-badge status-${application.status}`}>
                            {application.status === 'pending' ? (currentLanguage === 'en' ? 'Pending' : 'Inasubiri') :
                             application.status === 'accepted' ? (currentLanguage === 'en' ? 'Accepted' : 'Imekubaliwa') :
                             (currentLanguage === 'en' ? 'Rejected' : 'Imekataliwa')}
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
                            <span>{application.applicantPhone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="application-actions">
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'accepted')}
                          className="btn btn-success btn-sm hover-lift"
                          disabled={application.status === 'accepted'}
                        >
                          <i className="fas fa-check"></i>
                          {currentLanguage === 'en' ? 'Accept' : 'Kubali'}
                        </button>
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          className="btn btn-danger btn-sm hover-lift"
                          disabled={application.status === 'rejected'}
                        >
                          <i className="fas fa-times"></i>
                          {currentLanguage === 'en' ? 'Reject' : 'Kataa'}
                        </button>
                        {application.applicantPhone && application.applicantPhone !== 'N/A' && (
                          <a 
                            href={`tel:${application.applicantPhone}`}
                            className="btn btn-primary btn-sm hover-lift"
                          >
                            <i className="fas fa-phone"></i>
                            {currentLanguage === 'en' ? 'Call' : 'Piga Simu'}
                          </a>
                        )}
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
            <div className="card page-transition">
              <div className="card-body">
                <div className="profile-header">
                  <div className="user-avatar large">
                    {user.name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>{user.name}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'} | {user.location}
                    </p>
                  </div>
                </div>

                <div className="profile-content">
                  <div className="profile-section">
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

                      <div className="form-group">
                        <label className="form-label">
                          {currentLanguage === 'en' ? 'Business Name' : 'Jina la Biashara'}
                        </label>
                        <input
                          type="text"
                          value={editProfile.businessName}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, businessName: e.target.value }))}
                          className="form-control"
                          placeholder={currentLanguage === 'en' ? 'Your business name' : 'Jina la biashara yako'}
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Kazi Mashinani &copy; 2025. {currentLanguage === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}</p>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          {[
            { id: 'dashboard', icon: 'fa-chart-line', en: 'Dashboard', sw: 'Dashibodi' },
            { id: 'post-job', icon: 'fa-plus-circle', en: 'Post Job', sw: 'Tanga Kazi' },
            { id: 'my-jobs', icon: 'fa-briefcase', en: 'My Jobs', sw: 'Kazi Zangu' },
            { id: 'applications', icon: 'fa-file-alt', en: 'Applications', sw: 'Maombi' },
            { id: 'profile', icon: 'fa-user-tie', en: 'Profile', sw: 'Wasifu' }
          ].map(section => (
            <div
              key={section.id}
              className={`bottom-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={`fas ${section.icon}`}></i>
              <span>{currentLanguage === 'en' ? section.en : section.sw}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
