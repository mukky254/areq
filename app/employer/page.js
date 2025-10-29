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

      // Load language preference first
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }

      // Load employer jobs from localStorage
      const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]')
      setJobs(savedJobs)
      setStats(prev => ({ 
        ...prev, 
        totalJobs: savedJobs.length,
        activeJobs: savedJobs.filter(job => !job.closed)?.length || 0
      }))

      // Load applications from localStorage
      const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]')
      // Filter applications for this employer's jobs
      const employerApplications = savedApplications.filter(app => 
        jobs.some(job => job._id === app.jobId)
      )
      setApplications(employerApplications)
      setStats(prev => ({ 
        ...prev, 
        totalApplications: employerApplications.length,
        hired: employerApplications.filter(app => app.status === 'hired')?.length || 0
      }))

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
        featured: false,
        postedDate: new Date().toISOString()
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
        const updatedApplications = applications.map(app => 
          app._id === applicationId ? { ...app, status } : app
        )
        setApplications(updatedApplications)
        
        // Update localStorage
        const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]')
        const updatedAllApplications = allApplications.map(app =>
          app._id === applicationId ? { ...app, status } : app
        )
        localStorage.setItem('jobApplications', JSON.stringify(updatedAllApplications))
        
        if (status === 'hired') {
          setStats(prev => ({ ...prev, hired: prev.hired + 1 }))
        }
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

  const handleEditProfile = () => {
    alert(currentLanguage === 'en' 
      ? 'Edit profile feature coming soon!' 
      : 'Kipengele cha kuhariri wasifu kinakuja hivi karibuni!'
    )
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-hands-helping text-white"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Kazi Mashinani</h1>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>{currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center space-x-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>{currentLanguage === 'en' ? 'Logout' : 'Toka'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', icon: 'fa-chart-line', en: 'Dashboard', sw: 'Dashibodi' },
              { id: 'post-job', icon: 'fa-plus-circle', en: 'Post Job', sw: 'Tanga Kazi' },
              { id: 'my-jobs', icon: 'fa-briefcase', en: 'My Jobs', sw: 'Kazi Zangu' },
              { id: 'applications', icon: 'fa-file-alt', en: 'Applications', sw: 'Maombi' },
              { id: 'profile', icon: 'fa-user-tie', en: 'Profile', sw: 'Wasifu' }
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`fas ${section.icon}`}></i>
                <span>{currentLanguage === 'en' ? section.en : section.sw}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentLanguage === 'en' ? 'Welcome, ' : 'Karibu, '}{user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                {currentLanguage === 'en' 
                  ? 'Manage your job posts and find qualified workers' 
                  : 'Dhibiti matangazo yako ya kazi na upate wafanyikazi waliohitimu'
                }
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-briefcase text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalJobs}</div>
                    <div className="text-gray-600">{currentLanguage === 'en' ? 'Total Jobs' : 'Jumla ya Kazi'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-play-circle text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.activeJobs}</div>
                    <div className="text-gray-600">{currentLanguage === 'en' ? 'Active Jobs' : 'Kazi Aktivu'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-file-alt text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
                    <div className="text-gray-600">{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-user-check text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.hired}</div>
                    <div className="text-gray-600">{currentLanguage === 'en' ? 'Hired' : 'Waliokwishaajiriwa'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-bolt text-yellow-500 mr-2"></i>
                {currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo Vya Haraka'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveSection('post-job')}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                  <span>{currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('applications')}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-file-alt"></i>
                  <span>{currentLanguage === 'en' ? 'View Applications' : 'Angalia Maombi'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('my-jobs')}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <i className="fas fa-briefcase"></i>
                  <span>{currentLanguage === 'en' ? 'My Jobs' : 'Kazi Zangu'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('profile')}
                  className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <i className="fas fa-cog"></i>
                  <span>{currentLanguage === 'en' ? 'Settings' : 'Mipangilio'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Job Section */}
        {activeSection === 'post-job' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-plus-circle text-green-500 mr-2"></i>
              {currentLanguage === 'en' ? 'Post New Job' : 'Tanga Kazi Mpya'}
            </h2>

            <form onSubmit={handleJobSubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Job Title' : 'Kichwa cha Kazi'}
                </label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentLanguage === 'en' ? 'e.g. Farm Worker' : 'K.m. Mfanyakazi Shambani'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Job Description' : 'Maelezo ya Kazi'}
                </label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder={currentLanguage === 'en' ? 'Describe the job responsibilities...' : 'Eleza majukumu ya kazi...'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Location' : 'Eneo'}
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={currentLanguage === 'en' ? 'e.g. Nairobi' : 'K.m. Nairobi'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Business Type' : 'Aina ya Biashara'}
                  </label>
                  <input
                    type="text"
                    value={jobForm.businessType}
                    onChange={(e) => setJobForm(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={currentLanguage === 'en' ? 'e.g. Farm, Construction Company' : 'K.m. Shamba, Kampuni ya Ujenzi'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Category' : 'Aina ya Kazi'}
                  </label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="kilimo">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                    <option value="ujenzi">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                    <option value="nyumbani">{currentLanguage === 'en' ? 'Domestic' : 'Kazi ya Nyumbani'}</option>
                    <option value="usafiri">{currentLanguage === 'en' ? 'Transport' : 'Usafiri'}</option>
                    <option value="huduma">{currentLanguage === 'en' ? 'Services' : 'Huduma'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Salary' : 'Mshahara'}
                  </label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={currentLanguage === 'en' ? 'e.g. 15,000 KES/month' : 'K.m. 15,000 TZS/mwezi'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Experience Required' : 'Uzoefu Unahitajika'}
                  </label>
                  <input
                    type="text"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={currentLanguage === 'en' ? 'e.g. 2+ years' : 'K.m. Miaka 2+'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Contact Phone' : 'Nambari ya Mawasiliano'}
                  </label>
                  <input
                    type="tel"
                    value={jobForm.phone}
                    onChange={(e) => setJobForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="07XXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Required Skills (comma separated)' : 'Ujuzi Unahitajika (tenganisha kwa koma)'}
                </label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentLanguage === 'en' ? 'e.g. Farming, Driving, Cooking' : 'K.m. Kilimo, Kuendesha Gari, Kupika'}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <i className="fas fa-paper-plane"></i>
                <span>{currentLanguage === 'en' ? 'Post Job' : 'Tanga Kazi'}</span>
              </button>
            </form>
          </div>
        )}

        {/* My Jobs Section */}
        {activeSection === 'my-jobs' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-briefcase text-blue-500 mr-2"></i>
              {currentLanguage === 'en' ? 'My Job Posts' : 'Kazi Niliyotangaza'} ({jobs.length})
            </h2>

            <div className="space-y-4">
              {jobs.length > 0 ? jobs.map(job => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {job.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.closed 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {job.closed 
                          ? (currentLanguage === 'en' ? 'Closed' : 'Imefungwa') 
                          : (currentLanguage === 'en' ? 'Active' : 'Inaendelea')
                        }
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-building mr-2"></i>
                      <span>{job.businessType}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-money-bill mr-2"></i>
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {currentLanguage === 'en' ? 'Posted:' : 'Iliyotangazwa:'} {new Date(job.postedDate).toLocaleDateString('sw-TZ')}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1">
                        <i className="fas fa-eye"></i>
                        <span>{currentLanguage === 'en' ? 'View' : 'Angalia'}</span>
                      </button>
                      <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center space-x-1">
                        <i className="fas fa-edit"></i>
                        <span>{currentLanguage === 'en' ? 'Edit' : 'Hariri'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentLanguage === 'en' ? 'No Jobs Posted' : 'Hakuna Kazi Uliyotangaza'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {currentLanguage === 'en' 
                      ? 'You haven\'t posted any jobs yet. Start by posting your first job!' 
                      : 'Bado hujatangaza kazi yoyote. Anza kwa kutangaza kazi yako ya kwanza!'
                    }
                  </p>
                  <button 
                    onClick={() => setActiveSection('post-job')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentLanguage === 'en' ? 'Post First Job' : 'Tanga Kazi ya Kwanza'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Section */}
        {activeSection === 'applications' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-file-alt text-green-500 mr-2"></i>
              {currentLanguage === 'en' ? 'Job Applications' : 'Maombi ya Kazi'} ({applications.length})
            </h2>

            <div className="space-y-4">
              {applications.length > 0 ? applications.map(application => (
                <div key={application._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                      <p className="text-gray-600">
                        {currentLanguage === 'en' ? 'Applicant:' : 'Mtafuta Kazi:'} {application.applicantName || 'Applicant'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{application.coverLetter}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-calendar mr-2"></i>
                      <span>
                        {currentLanguage === 'en' ? 'Applied:' : 'Iliyotumwa:'} {new Date(application.appliedDate).toLocaleDateString('sw-TZ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-phone mr-2"></i>
                      <span>{application.applicantPhone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => updateApplicationStatus(application._id, 'accepted')}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-300 flex items-center space-x-1"
                      disabled={application.status === 'accepted'}
                    >
                      <i className="fas fa-check"></i>
                      <span>{currentLanguage === 'en' ? 'Accept' : 'Kubali'}</span>
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(application._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:bg-gray-300 flex items-center space-x-1"
                      disabled={application.status === 'rejected'}
                    >
                      <i className="fas fa-times"></i>
                      <span>{currentLanguage === 'en' ? 'Reject' : 'Kataa'}</span>
                    </button>
                    {application.applicantPhone && (
                      <a 
                        href={`tel:${application.applicantPhone}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                      >
                        <i className="fas fa-phone"></i>
                        <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
                      </a>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentLanguage === 'en' ? 'No Applications' : 'Hakuna Maombi'}
                  </h3>
                  <p className="text-gray-500">
                    {currentLanguage === 'en' 
                      ? 'No job applications received yet. Applications will appear here when job seekers apply to your jobs.' 
                      : 'Bado hakuna maombi ya kazi yaliyopokelewa. Maombi yataonekana hapa wakati watafuta kazi wanapotuma maombi kwa kazi zako.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && user && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">
                  {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'} | {user.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-user-circle text-blue-500 mr-2"></i>
                  {currentLanguage === 'en' ? 'Personal Information' : 'Taarifa Binafsi'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}
                    </label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                    </label>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage === 'en' ? 'Location' : 'Eneo'}
                    </label>
                    <p className="text-gray-900">{user.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage === 'en' ? 'Role' : 'Jukumu'}
                    </label>
                    <p className="text-gray-900">{currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-cog text-gray-500 mr-2"></i>
                  {currentLanguage === 'en' ? 'Next Steps' : 'Hatua Zifuatazo'}
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleEditProfile}
                    className="w-full flex items-center space-x-3 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <i className="fas fa-edit text-blue-500"></i>
                    <span>{currentLanguage === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                    <i className="fas fa-bell text-yellow-500"></i>
                    <span>{currentLanguage === 'en' ? 'Notification Settings' : 'Mipangilio ya Arifa'}</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                    <i className="fas fa-shield-alt text-green-500"></i>
                    <span>{currentLanguage === 'en' ? 'Account Security' : 'Usalama wa Akaunti'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
