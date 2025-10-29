'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { formatPhoneToStandard } from '../../lib/utils'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [formData, setFormData] = useState({
    loginPhone: '',
    loginPassword: '',
    registerName: '',
    registerPhone: '',
    registerLocation: '',
    registerPassword: '',
    registerRole: 'employee',
    forgotPhone: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }

    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [router])

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async () => {
    if (!formData.loginPhone || !formData.loginPassword) {
      showMessage(
        currentLanguage === 'en' 
          ? 'Please enter both phone number and password' 
          : 'Tafadhali weka nambari ya simu na nenosiri',
        'error'
      )
      return
    }

    setLoading(true)
    try {
      const formattedPhone = formatPhoneToStandard(formData.loginPhone)
      const response = await ApiService.login(formattedPhone, formData.loginPassword)

      if (response.success) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('userRole', response.user.role)
        
        showMessage(
          currentLanguage === 'en' ? 'Login successful!' : 'Umefanikiwa kuingia!',
          'success'
        )
        
        setTimeout(() => router.push('/dashboard'), 1000)
      }
    } catch (error) {
      showMessage(
        error.message || (currentLanguage === 'en' 
          ? 'Login failed. Please check your credentials.' 
          : 'Imeshindwa kuingia. Tafadhali angalia maelezo yako.'),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async () => {
    const { registerName, registerPhone, registerLocation, registerPassword, registerRole } = formData
    
    if (!registerName || !registerPhone || !registerPassword || !registerLocation) {
      showMessage(
        currentLanguage === 'en' 
          ? 'Please fill in all required fields' 
          : 'Tafadhali jaza sehemu zote zinazohitajika',
        'error'
      )
      return
    }

    setLoading(true)
    try {
      const formattedPhone = formatPhoneToStandard(registerPhone)
      const response = await ApiService.register({
        name: registerName,
        phone: formattedPhone,
        password: registerPassword,
        role: registerRole,
        location: registerLocation
      })

      if (response.success) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('userRole', response.user.role)
        
        showMessage(
          currentLanguage === 'en' ? 'Account created!' : 'Akaunti imeundwa!',
          'success'
        )
        
        setTimeout(() => router.push('/dashboard'), 1000)
      }
    } catch (error) {
      showMessage(
        error.message || (currentLanguage === 'en' 
          ? 'Registration failed. Please try again.' 
          : 'Usajili umeshindwa. Tafadhali jaribu tena.'),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const moveToNext = (currentInput, nextIndex) => {
    if (currentInput.value && nextIndex <= 5) {
      document.getElementById(`code-input-${nextIndex}`)?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div 
        className="fixed top-4 right-4 flex items-center gap-2 bg-white p-3 rounded-full shadow-lg cursor-pointer hover-lift"
        onClick={toggleLanguage}
      >
        <span className="text-lg">{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
        <span className="font-semibold">
          {currentLanguage === 'en' ? 'English' : 'Kiswahili'}
        </span>
      </div>

      {/* Auth Container */}
      <div className="auth-container glass-effect rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="auth-header bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">
            {currentLanguage === 'en' ? 'Kazi Mashinani' : 'Kazi Mashinani'}
          </h1>
          <p className="opacity-90">
            {currentLanguage === 'en' 
              ? 'Connecting Rural Talent with Opportunities' 
              : 'Kuunganisha Watalanta Vijijini na Fursa'}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs flex bg-gray-800">
          <div 
            className={`auth-tab flex-1 p-4 text-center cursor-pointer transition-colors ${
              activeTab === 'login' ? 'bg-green-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            <span className="text-white font-medium">
              {currentLanguage === 'en' ? 'Login' : 'Ingia'}
            </span>
          </div>
          <div 
            className={`auth-tab flex-1 p-4 text-center cursor-pointer transition-colors ${
              activeTab === 'register' ? 'bg-green-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            <span className="text-white font-medium">
              {currentLanguage === 'en' ? 'Register' : 'Jisajili'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="auth-content p-6">
          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type} p-3 rounded-lg mb-4 text-center`}>
              {message.text}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="space-y-4 slide-fade-in">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.loginPhone}
                  onChange={(e) => handleInputChange('loginPhone', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.loginPassword}
                  onChange={(e) => handleInputChange('loginPassword', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter your password' : 'Weka nenosiri lako'}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {currentLanguage === 'en' ? 'Logging in...' : 'Inaingia...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Login' : 'Ingia'
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => setActiveTab('forgot')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {currentLanguage === 'en' ? 'Forgot Password?' : 'Umesahau Nenosiri?'}
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {activeTab === 'register' && (
            <div className="space-y-4 slide-fade-in">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}
                </label>
                <input
                  type="text"
                  value={formData.registerName}
                  onChange={(e) => handleInputChange('registerName', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter your full name' : 'Weka jina lako kamili'}
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.registerPhone}
                  onChange={(e) => handleInputChange('registerPhone', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Enter Location' : 'Mahali Unapoishi'}
                </label>
                <input
                  type="text"
                  value={formData.registerLocation}
                  onChange={(e) => handleInputChange('registerLocation', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.registerPassword}
                  onChange={(e) => handleInputChange('registerPassword', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Create a password' : 'Tengeneza nenosiri'}
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'I am a' : 'Mimi ni'}
                </label>
                <select
                  value={formData.registerRole}
                  onChange={(e) => handleInputChange('registerRole', e.target.value)}
                  className="form-control w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">
                    {currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi'}
                  </option>
                  <option value="employer">
                    {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
                  </option>
                </select>
              </div>

              <button
                onClick={handleRegistration}
                disabled={loading}
                className="btn w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {currentLanguage === 'en' ? 'Creating account...' : 'Inaunda akaunti...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Register' : 'Jisajili'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
