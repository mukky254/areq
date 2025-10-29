'use client'
import { useApp } from '../context/AppContext'

export default function Navigation({ activeSection, onSectionChange }) {
  const { user, userRole, currentLanguage, darkMode, dispatch } = useApp()

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' })
    localStorage.setItem('darkMode', !darkMode)
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage })
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
      dispatch({ type: 'LOGOUT' })
      window.location.href = '/auth'
    }
  }

  const employeeTabs = [
    { id: 'home', icon: 'fas fa-home', label: { en: 'Home', sw: 'Nyumbani' } },
    { id: 'jobs', icon: 'fas fa-briefcase', label: { en: 'Jobs', sw: 'Kazi' } },
    { id: 'favorites', icon: 'fas fa-heart', label: { en: 'Favorites', sw: 'Vipendwa' } },
    { id: 'profile', icon: 'fas fa-user', label: { en: 'Profile', sw: 'Wasifu' } }
  ]

  const employerTabs = [
    { id: 'home', icon: 'fas fa-home', label: { en: 'Home', sw: 'Nyumbani' } },
    { id: 'post', icon: 'fas fa-plus-circle', label: { en: 'Post Job', sw: 'Tanga Kazi' } },
    { id: 'employees', icon: 'fas fa-users', label: { en: 'Workers', sw: 'Wafanyikazi' } },
    { id: 'profile', icon: 'fas fa-user', label: { en: 'Profile', sw: 'Wasifu' } }
  ]

  const tabs = userRole === 'employee' ? employeeTabs : employerTabs

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white shadow-lg rounded-2xl p-4 mb-6">
        <div className="flex space-x-4 w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
            >
              <i className={tab.icon}></i>
              <span className="font-semibold">
                {currentLanguage === 'en' ? tab.label.en : tab.label.sw}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            title={currentLanguage === 'en' ? 'Toggle Dark Mode' : 'Badilisha Hali ya Giza'}
          >
            <i className={`fas ${darkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-gray-600'}`}></i>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
          >
            <span className="text-lg">{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
            <span className="font-semibold">
              {currentLanguage === 'en' ? 'English' : 'Kiswahili'}
            </span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-gray-600">
                {userRole === 'employee' 
                  ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                  : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
                }
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>{currentLanguage === 'en' ? 'Logout' : 'Toka'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl md:hidden z-50">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 transition-all duration-300 ${
                activeSection === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <i className={`${tab.icon} text-lg mb-1`}></i>
              <span className="text-xs font-medium">
                {currentLanguage === 'en' ? tab.label.en : tab.label.sw}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
