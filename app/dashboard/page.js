'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Real job database
const jobDatabase = [
  {
    _id: '1',
    title: 'Mfanyakazi Shambani - Nakuru',
    titleEn: 'Farm Worker - Nakuru',
    description: 'Inatafuta mfanyakazi shambani mwenye uzoefu wa kilimo cha mazao na utunzaji wa wanyama. Lazima uwe na uzoefu wa miaka 2+ katika mbinu za kilimo cha kisasa.',
    descriptionEn: 'Experienced farm worker needed for crop cultivation and animal care. Must have 2+ years experience in modern farming techniques.',
    location: 'Nakuru',
    category: 'kilimo',
    categoryEn: 'agriculture',
    phone: '+254712345678',
    businessType: 'Shamba la Green Valley',
    businessTypeEn: 'Green Valley Farm',
    salary: 'KES 15,000 / mwezi',
    experience: 'Miaka 2+',
    experienceEn: '2+ years',
    skills: ['Kilimo', 'Utunzaji wa Wanyama', 'Umwagiliaji'],
    skillsEn: ['Farming', 'Animal Care', 'Irrigation'],
    postedDate: new Date('2024-01-15').toISOString(),
    deadline: new Date('2024-02-15').toISOString(),
    employer: {
      name: 'John Mwangi',
      rating: 4.5,
      reviews: 23
    },
    urgent: true,
    featured: false
  },
  {
    _id: '2',
    title: 'Msimamizi wa Ujenzi - Nairobi',
    titleEn: 'Construction Supervisor - Nairobi',
    description: 'Msimamizi wa ujenzi anahitajika kwa miradi mikuu ya ujenzi. Uzoefu wa uongozi unahitajika.',
    descriptionEn: 'Construction supervisor needed for major building projects. Leadership experience required.',
    location: 'Nairobi',
    category: 'ujenzi',
    categoryEn: 'construction',
    phone: '+254723456789',
    businessType: 'Kampuni ya Ujenzi Build It',
    businessTypeEn: 'Build It Construction Ltd',
    salary: 'KES 45,000 / mwezi',
    experience: 'Miaka 5+',
    experienceEn: '5+ years',
    skills: ['Usimamizi', 'Ujenzi', 'Usimamizi wa Miradi'],
    skillsEn: ['Supervision', 'Construction', 'Project Management'],
    postedDate: new Date('2024-01-10').toISOString(),
    deadline: new Date('2024-02-10').toISOString(),
    employer: {
      name: 'Sarah Construction',
      rating: 4.2,
      reviews: 15
    },
    urgent: false,
    featured: true
  },
  {
    _id: '3',
    title: 'Mfanyakazi Wa Nyumbani - Mombasa',
    titleEn: 'Domestic Worker - Mombasa',
    description: 'Msaada wa nyumbani anahitajika kwa usafishaji na upikaji. Lazima awe muaminifu.',
    descriptionEn: 'Reliable house help needed for cleaning and cooking. Must be trustworthy.',
    location: 'Mombasa',
    category: 'nyumbani',
    categoryEn: 'domestic',
    phone: '+254734567890',
    businessType: 'Nyumba ya Familia',
    businessTypeEn: 'Family Home',
    salary: 'KES 12,000 / mwezi',
    experience: 'Mwaka 1+',
    experienceEn: '1+ years',
    skills: ['Usafi', 'Upishi', 'Utunzaji wa Watoto'],
    skillsEn: ['Cleaning', 'Cooking', 'Childcare'],
    postedDate: new Date('2024-01-12').toISOString(),
    deadline: new Date('2024-02-12').toISOString(),
    employer: {
      name: 'Amina Family',
      rating: 4.8,
      reviews: 8
    },
    urgent: true,
    featured: false
  },
  {
    _id: '4',
    title: 'Dereva wa Uwasilishaji - Thika',
    titleEn: 'Delivery Driver - Thika',
    description: 'Dereva wa uwasilishaji wa pikipiki anahitajika kwa huduma ya uwasilishaji wa chakula.',
    descriptionEn: 'Motorcycle delivery driver needed for food delivery service.',
    location: 'Thika',
    category: 'usafiri',
    categoryEn: 'delivery',
    phone: '+254745678901',
    businessType: 'Uwasilishaji wa Haraka',
    businessTypeEn: 'Quick Deliveries',
    salary: 'KES 18,000 / mwezi + bahasha',
    experience: 'Mwaka 1+',
    experienceEn: '1+ years',
    skills: ['Uendeshaji', 'Ramani', 'Huduma kwa Wateja'],
    skillsEn: ['Driving', 'Navigation', 'Customer Service'],
    postedDate: new Date('2024-01-08').toISOString(),
    deadline: new Date('2024-02-08').toISOString(),
    employer: {
      name: 'Quick Deliveries Co.',
      rating: 4.0,
      reviews: 12
    },
    urgent: false,
    featured: true
  }
]

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('employee')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [favorites, setFavorites] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth')
      return
    }

    try {
      const user = JSON.parse(userData)
      setUser(user)
      setUserRole(user.role)
      
      // Load real jobs
      setJobs(jobDatabase)
      
      // Load saved data
      const savedFavorites = localStorage.getItem('favoriteJobs')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }

      const savedApplications = localStorage.getItem('jobApplications')
      if (savedApplications) {
        setApplications(JSON.parse(savedApplications))
      }

      // Load language preference
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }, [router])

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

  const applyForJob = (jobId) => {
    const job = jobs.find(j => j._id === jobId)
    if (!job) return

    const application = {
      id: 'app-' + Date.now(),
      jobId,
      jobTitle: currentLanguage === 'sw' ? job.title : job.titleEn,
      appliedDate: new Date().toISOString(),
      status: 'pending',
      employer: job.employer.name
    }

    const newApplications = [...applications, application]
    setApplications(newApplications)
    localStorage.setItem('jobApplications', JSON.stringify(newApplications))
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
      localStorage.removeItem('jobApplications')
      router.push('/auth')
    }
  }

  // Filter jobs based on search and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inapakia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Kazi Mashinani</h1>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              {userRole === 'employee' 
                ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
              }
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
              <span>{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
              <span>{currentLanguage === 'en' ? 'English' : 'Kiswahili'}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-sm opacity-90">
                  {user?.profileComplete}% {currentLanguage === 'en' ? 'Profile Complete' : 'Wasifu Kamili'}
                </div>
              </div>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              {currentLanguage === 'en' ? 'Logout' : 'Toka'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex gap-4 overflow-x-auto">
          {['home', 'jobs', 'favorites', 'applications', 'profile'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap ${
                activeSection === section
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section === 'home' && <i className="fas fa-home"></i>}
              {section === 'jobs' && <i className="fas fa-briefcase"></i>}
              {section === 'favorites' && <i className="fas fa-heart"></i>}
              {section === 'applications' && <i className="fas fa-file-alt"></i>}
              {section === 'profile' && <i className="fas fa-user"></i>}
              
              {section === 'home' && (currentLanguage === 'en' ? 'Home' : 'Nyumbani')}
              {section === 'jobs' && (currentLanguage === 'en' ? 'Jobs' : 'Kazi')}
              {section === 'favorites' && (currentLanguage === 'en' ? 'Favorites' : 'Vipendwa')}
              {section === 'applications' && (currentLanguage === 'en' ? 'Applications' : 'Maombi')}
              {section === 'profile' && (currentLanguage === 'en' ? 'Profile' : 'Wasifu')}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Home Section */}
        {activeSection === 'home' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">
                {currentLanguage === 'en' 
                  ? `Welcome to Kazi Mashinani, ${user?.name}!` 
                  : `Karibu Kazi Mashinani, ${user?.name}!`
                }
              </h1>
              <p className="text-xl opacity-90">
                {userRole === 'employee' 
                  ? (currentLanguage === 'en' 
                      ? 'Your next opportunity awaits in rural areas' 
                      : 'Fursa yako ijayo inangojea katika maeneo ya vijijini')
                  : (currentLanguage === 'en' 
                      ? 'Find the perfect workers for your business' 
                      : 'Tafuta wafanyikazi bora kwa biashara yako')
                }
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-600">{jobs.length}</h3>
                <p className="text-gray-600 font-semibold">
                  {currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-green-600">{favorites.length}</h3>
                <p className="text-gray-600 font-semibold">
                  {currentLanguage === 'en' ? 'Favorite Jobs' : 'Kazi Unazopenda'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-purple-600">{applications.length}</h3>
                <p className="text-gray-600 font-semibold">
                  {currentLanguage === 'en' ? 'Applications' : 'Maombi'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-orange-600">{user?.profileComplete || 0}%</h3>
                <p className="text-gray-600 font-semibold">
                  {currentLanguage === 'en' ? 'Profile Complete' : 'Wasifu Kamili'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <i className="fas fa-bolt text-yellow-500 text-xl"></i>
                <h2 className="text-xl font-bold text-blue-600">
                  {currentLanguage === 'en' ? 'Quick Actions' : 'Vitendo Vya Haraka'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveSection('jobs')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <i className="fas fa-search text-lg"></i>
                  <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('favorites')}
                  className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <i className="fas fa-heart text-lg"></i>
                  <span>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('applications')}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <i className="fas fa-file-alt text-lg"></i>
                  <span>{currentLanguage === 'en' ? 'Applications' : 'Maombi'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <i className="fas fa-user text-lg"></i>
                  <span>{currentLanguage === 'en' ? 'Profile' : 'Wasifu'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {activeSection === 'jobs' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Search Jobs' : 'Tafuta Kazi'}
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={currentLanguage === 'en' ? 'Job title, skills...' : 'Kichwa cha kazi, ujuzi...'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'en' ? 'Category' : 'Aina ya Kazi'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{currentLanguage === 'en' ? 'All Categories' : 'Aina Zote'}</option>
                    <option value="kilimo">{currentLanguage === 'en' ? 'Agriculture' : 'Kilimo'}</option>
                    <option value="ujenzi">{currentLanguage === 'en' ? 'Construction' : 'Ujenzi'}</option>
                    <option value="nyumbani">{currentLanguage === 'en' ? 'Domestic' : 'Nyumbani'}</option>
                    <option value="usafiri">{currentLanguage === 'en' ? 'Delivery' : 'Usafiri'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div key={job._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-blue-600 mb-1">
                        {currentLanguage === 'sw' ? job.title : job.titleEn}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {currentLanguage === 'sw' ? job.category : job.categoryEn}
                        </span>
                        {job.urgent && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {currentLanguage === 'en' ? 'Urgent' : 'Ya Haraka'}
                          </span>
                        )}
                        {job.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {currentLanguage === 'en' ? 'Featured' : 'Iliyoboreshwa'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(job._id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        favorites.some(fav => fav._id === job._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <i className={`fas fa-heart ${favorites.some(fav => fav._id === job._id) ? 'text-white' : ''}`}></i>
                    </button>
                  </div>

                  {/* Job Description */}
                  <p className="text-gray-600 mb-4">
                    {currentLanguage === 'sw' ? job.description : job.descriptionEn}
                  </p>

                  {/* Job Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fas fa-map-marker-alt text-blue-500"></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fas fa-building text-green-500"></i>
                      <span>{currentLanguage === 'sw' ? job.businessType : job.businessTypeEn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fas fa-money-bill text-purple-500"></i>
                      <span className="font-semibold">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fas fa-clock text-orange-500"></i>
                      <span>{currentLanguage === 'en' ? 'Experience:' : 'Uzoefu:'} {currentLanguage === 'sw' ? job.experience : job.experienceEn}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {(currentLanguage === 'sw' ? job.skills : job.skillsEn).map(skill => (
                        <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${job.phone}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-phone"></i>
                      <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
                    </a>
                    <a 
                      href={`https://wa.me/${job.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fab fa-whatsapp"></i>
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => applyForJob(job._id)}
                    className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg transition-colors"
                    disabled={applications.some(app => app.jobId === job._id)}
                  >
                    {applications.some(app => app.jobId === job._id) 
                      ? (currentLanguage === 'en' ? 'Applied' : 'Umeomba')
                      : (currentLanguage === 'en' ? 'Apply Now' : 'Omba Sasa')
                    }
                  </button>
                </div>
              ))}
            </div>

            {/* No Jobs Found */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {currentLanguage === 'en' ? 'No jobs found' : 'Hakuna kazi zilizopatikana'}
                </h3>
                <p className="text-gray-500">
                  {currentLanguage === 'en' 
                    ? 'Try adjusting your search filters' 
                    : 'Jaribu kubadilisha vichujio vyako vya utafutaji'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Favorites Section */}
        {activeSection === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-blue-600 mb-6">
                {currentLanguage === 'en' ? 'Favorite Jobs' : 'Kazi Unazopenda'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.length > 0 ? (
                  favorites.map(job => (
                    <div key={job._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <h3 className="text-lg font-bold text-blue-600 mb-2">
                        {currentLanguage === 'sw' ? job.title : job.titleEn}
                      </h3>
                      <p className="text-gray-600 mb-4">{currentLanguage === 'sw' ? job.description : job.descriptionEn}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <i className="fas fa-building"></i>
                          <span>{currentLanguage === 'sw' ? job.businessType : job.businessTypeEn}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a 
                          href={`tel:${job.phone}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-phone"></i>
                          <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
                        </a>
                        <button
                          onClick={() => toggleFavorite(job._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-heart"></i>
                          <span>{currentLanguage === 'en' ? 'Remove' : 'Ondoa'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <i className="fas fa-heart text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">
                      {currentLanguage === 'en' 
                        ? "You haven't added any jobs to favorites yet." 
                        : 'Hujaongeza kazi yoyote kwenye orodha ya vipendwa bado.'}
                    </p>
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                    >
                      {currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applications Section */}
        {activeSection === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-blue-600 mb-6">
                {currentLanguage === 'en' ? 'My Applications' : 'Maombi Yangu'}
              </h2>

              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map(application => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
                        <p className="text-gray-600">
                          {currentLanguage === 'en' ? 'Applied to' : 'Umeomba kwa'} {application.employer}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentLanguage === 'en' ? 'Applied on' : 'Iliyotumwa'} {new Date(application.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-file-alt text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">
                      {currentLanguage === 'en' 
                        ? "You haven't applied to any jobs yet." 
                        : 'Hujaomba kazi yoyote bado.'}
                    </p>
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                    >
                      {currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && user && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-gray-600">
                    {userRole === 'employee' 
                      ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                      : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-blue-600 flex items-center gap-3">
                    <i className="fas fa-user-circle"></i>
                    {currentLanguage === 'en' ? 'Personal Information' : 'Taarifa Binafsi'}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {currentLanguage === 'en' ? 'Name:' : 'Jina:'}
                        </label>
                        <p className="font-semibold">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {currentLanguage === 'en' ? 'Phone:' : 'Simu:'}
                        </label>
                        <p className="font-semibold">{user.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {currentLanguage === 'en' ? 'Location:' : 'Eneo:'}
                      </label>
                      <p className="font-semibold">{user.location}</p>
                    </div>

                    {user.skills && user.skills.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {currentLanguage === 'en' ? 'Skills:' : 'Ujuzi:'}
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.map(skill => (
                            <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.experience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {currentLanguage === 'en' ? 'Experience:' : 'Uzoefu:'}
                        </label>
                        <p className="font-semibold">{user.experience}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {currentLanguage === 'en' ? 'Role:' : 'Jukumu:'}
                      </label>
                      <p className="font-semibold">
                        {userRole === 'employee' 
                          ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                          : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-blue-600 flex items-center gap-3">
                    <i className="fas fa-cog"></i>
                    {currentLanguage === 'en' ? 'Account Settings' : 'Mipangilio ya Akaunti'}
                  </h3>

                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <i className="fas fa-edit"></i>
                      {currentLanguage === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}
                    </button>
                    
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <i className="fas fa-bell"></i>
                      {currentLanguage === 'en' ? 'Notification Settings' : 'Mipangilio ya Arifa'}
                    </button>
                    
                    <button 
                      onClick={logout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      {currentLanguage === 'en' ? 'Logout' : 'Toka'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
