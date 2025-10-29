'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('employee')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [employees, setEmployees] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Sample data - will work immediately
  const sampleJobs = [
    {
      _id: '1',
      title: 'Farm Worker - Nakuru',
      description: 'Experienced farm worker needed for crop cultivation',
      location: 'Nakuru',
      category: 'agriculture',
      phone: '+254712345678',
      businessType: 'Green Valley Farm',
      salary: '15,000 KES/month',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Construction Helper - Nairobi',
      description: 'Construction site helper for building projects',
      location: 'Nairobi',
      category: 'construction', 
      phone: '+254723456789',
      businessType: 'Build It Ltd',
      salary: '20,000 KES/month',
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Domestic Worker - Mombasa',
      description: 'House help for cleaning and cooking',
      location: 'Mombasa',
      category: 'domestic',
      phone: '+254734567890',
      businessType: 'Family Home',
      salary: '12,000 KES/month',
      createdAt: new Date().toISOString()
    }
  ]

  const sampleEmployees = [
    {
      _id: '1',
      name: 'John Kamau',
      phone: '+254712345678',
      location: 'Nairobi',
      specialization: 'Farm Worker',
      experience: '3 years'
    },
    {
      _id: '2',
      name: 'Mary Wanjiku',
      phone: '+254723456789',
      location: 'Nakuru', 
      specialization: 'Domestic Worker',
      experience: '4 years'
    }
  ]

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth')
      return
    }

    try {
      const user = JSON.parse(userData)
      setUser(user)
      setUserRole(localStorage.getItem('userRole') || 'employee')
      
      // Load sample data
      setJobs(sampleJobs)
      setEmployees(sampleEmployees)
      
      // Load favorites
      const savedFavorites = localStorage.getItem('favoriteJobs')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
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

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  const toggleDarkMode = () => {
    const current = document.body.classList.contains('dark-mode')
    if (current) {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'false')
    } else {
      document.body.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
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
      router.push('/auth')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <button className="text-white text-xl">
              <i className="fas fa-bars"></i>
            </button>
            <div className="logo flex items-center gap-2">
              <i className="fas fa-hands-helping"></i>
              <h1 className="text-xl font-bold">Kazi Mashinani</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-moon"></i>
            </button>
            
            <button onClick={toggleLanguage} className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
              <span>{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
              <span>{currentLanguage === 'en' ? 'English' : 'Kiswahili'}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-sm opacity-90">
                  {userRole === 'employee' 
                    ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                    : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
                  }
                </div>
              </div>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-user"></i>
              </div>
            </div>
            
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-sign-out-alt"></i>
              {currentLanguage === 'en' ? 'Logout' : 'Toka'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex gap-4 overflow-x-auto">
          {['home', 'jobs', 'favorites', 'profile'].map(section => (
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
              {section === 'profile' && <i className="fas fa-user"></i>}
              
              {section === 'home' && (currentLanguage === 'en' ? 'Home' : 'Nyumbani')}
              {section === 'jobs' && (currentLanguage === 'en' ? 'Jobs' : 'Kazi')}
              {section === 'favorites' && (currentLanguage === 'en' ? 'Favorites' : 'Vipendwa')}
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
                      ? 'Find your perfect job opportunity in rural areas' 
                      : 'Tafuta fursa bora za kazi katika maeneo ya vijijini')
                  : (currentLanguage === 'en' 
                      ? 'Find qualified workers for your business needs' 
                      : 'Tafuta wafanyikazi waliohitimu kwa mahitaji ya biashara yako')
                }
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <i className="fas fa-briefcase text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600">{jobs.length}</h3>
                    <p className="text-gray-600 font-semibold">
                      {currentLanguage === 'en' ? 'Available Jobs' : 'Kazi Zilizopo'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <i className="fas fa-users text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-600">{employees.length}</h3>
                    <p className="text-gray-600 font-semibold">
                      {currentLanguage === 'en' ? 'Active Workers' : 'Wafanyikazi Walioajiriwa'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <i className="fas fa-building text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600">50+</h3>
                    <p className="text-gray-600 font-semibold">
                      {currentLanguage === 'en' ? 'Business Partners' : 'Washirika Wa Biashara'}
                    </p>
                  </div>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveSection('jobs')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                >
                  <i className="fas fa-search text-lg group-hover:scale-110 transition-transform"></i>
                  <span>{currentLanguage === 'en' ? 'Browse Jobs' : 'Tafuta Kazi'}</span>
                </button>
                <button 
                  onClick={() => setActiveSection('favorites')}
                  className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                >
                  <i className="fas fa-heart text-lg group-hover:scale-110 transition-transform"></i>
                  <span>{currentLanguage === 'en' ? 'Favorites' : 'Vipendwa'}</span>
                </button>
                <button 
                  onClick={() => setActiveSection('profile')}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                >
                  <i className="fas fa-user-edit text-lg group-hover:scale-110 transition-transform"></i>
                  <span>{currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {activeSection === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <i className="fas fa-briefcase text-blue-500 text-xl"></i>
                <h2 className="text-xl font-bold text-blue-600">
                  {currentLanguage === 'en' ? 'Available Job Opportunities' : 'Fursa Za Kazi Zilizopo'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                  <div key={job._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-blue-600 flex-1 pr-4">
                        {job.title}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        {job.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="fas fa-map-marker-alt text-blue-500"></i>
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="fas fa-building text-green-500"></i>
                        <span>{job.businessType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="fas fa-money-bill text-purple-500"></i>
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <a 
                        href={`tel:${job.phone}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-phone"></i>
                        <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
                      </a>
                      <a 
                        href={`https://wa.me/${job.phone}?text=Hi, I am interested in the ${encodeURIComponent(job.title)} position`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fab fa-whatsapp"></i>
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <button
                      onClick={() => toggleFavorite(job._id)}
                      className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        favorites.some(fav => fav._id === job._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`fas fa-heart ${favorites.some(fav => fav._id === job._id) ? 'text-white' : 'text-gray-400'}`}></i>
                      <span>
                        {favorites.some(fav => fav._id === job._id)
                          ? (currentLanguage === 'en' ? 'Remove Favorite' : 'Ondoa Kipendwa')
                          : (currentLanguage === 'en' ? 'Add to Favorites' : 'Ongeza Kipendwa')
                        }
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {activeSection === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <i className="fas fa-heart text-pink-500 text-xl"></i>
                <h2 className="text-xl font-bold text-blue-600">
                  {currentLanguage === 'en' ? 'Favorite Jobs' : 'Kazi Unazopenda'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.length > 0 ? (
                  favorites.map(job => (
                    <div key={job._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-blue-600 flex-1 pr-4">
                          {job.title}
                        </h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {job.category}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{job.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <i className="fas fa-building"></i>
                          <span>{job.businessType}</span>
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

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
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
                        <p className="font-semibold">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {currentLanguage === 'en' ? 'Phone:' : 'Simu:'}
                        </label>
                        <p className="font-semibold">{user?.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {currentLanguage === 'en' ? 'Location:' : 'Eneo:'}
                      </label>
                      <p className="font-semibold">{user?.location}</p>
                    </div>

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
