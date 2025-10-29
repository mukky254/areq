'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE_URL = 'https://backita.onrender.com'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      const storedRole = localStorage.getItem('userRole')
      
      if (!token || !userData) {
        router.push('/auth')
        return
      }

      try {
        setUser(JSON.parse(userData))
        setUserRole(storedRole)
        
        // Load preferences
        const savedLanguage = localStorage.getItem('preferredLanguage')
        const savedDarkMode = localStorage.getItem('darkMode') === 'true'
        
        if (savedLanguage) setCurrentLanguage(savedLanguage)
        if (savedDarkMode) setDarkMode(savedDarkMode)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
  }, [router])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.body.classList.toggle('dark-mode', newDarkMode)
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
      {/* Simple Header */}
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600">Kazi Mashinani</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {userRole === 'employee' 
                ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
              }
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {currentLanguage === 'en' ? 'Logout' : 'Toka'}
            </button>
          </div>
        </div>
      </header>

      {/* Simple Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex gap-4 overflow-x-auto">
          {['home', 'jobs', 'profile'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-2 rounded-lg whitespace-nowrap ${
                activeSection === section
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section === 'home' && (currentLanguage === 'en' ? 'Home' : 'Nyumbani')}
              {section === 'jobs' && (currentLanguage === 'en' ? 'Jobs' : 'Kazi')}
              {section === 'profile' && (currentLanguage === 'en' ? 'Profile' : 'Wasifu')}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {activeSection === 'home' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              {currentLanguage === 'en' ? 'Welcome to Kazi Mashinani' : 'Karibu Kazi Mashinani'}
            </h2>
            <p className="text-gray-600">
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
        )}

        {activeSection === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              {currentLanguage === 'en' ? 'Profile' : 'Wasifu'}
            </h2>
            <div className="space-y-4">
              <div>
                <strong>{currentLanguage === 'en' ? 'Name:' : 'Jina:'}</strong> {user?.name}
              </div>
              <div>
                <strong>{currentLanguage === 'en' ? 'Phone:' : 'Simu:'}</strong> {user?.phone}
              </div>
              <div>
                <strong>{currentLanguage === 'en' ? 'Location:' : 'Eneo:'}</strong> {user?.location}
              </div>
              <div>
                <strong>{currentLanguage === 'en' ? 'Role:' : 'Jukumu:'}</strong> {userRole}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
