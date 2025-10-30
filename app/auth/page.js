'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService, formatPhoneToStandard } from '../../lib/api'

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
    registerRole: 'employee'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')
      
      if (token && userRole) {
        if (userRole === 'employer') {
          router.push('/employer')
        } else {
          router.push('/dashboard')
        }
        return
      }

      const savedLanguage = localStorage.getItem('preferredLanguage') || 'sw'
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

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!formData.loginPhone || !formData.loginPassword) {
      showMessage(
        currentLanguage === 'en' 
          ? 'Please enter phone number and password' 
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
        
        setTimeout(() => {
          if (response.user.role === 'employer') {
            router.push('/employer')
          } else {
            router.push('/dashboard')
          }
        }, 1000)
      } else {
        showMessage(
          currentLanguage === 'en' 
            ? 'Invalid phone number or password' 
            : 'Nambari ya simu au nenosiri si sahihi',
          'error'
        )
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(
        currentLanguage === 'en' 
          ? 'Login failed. Please try again.' 
          : 'Imeshindwa kuingia. Tafadhali jaribu tena.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async (e) => {
    e.preventDefault()
    const { registerName, registerPhone, registerLocation, registerPassword, registerRole } = formData
    
    if (!registerName || !registerPhone || !registerLocation || !registerPassword) {
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
        localStorage.setItem('userRole', registerRole)
        
        showMessage(
          currentLanguage === 'en' ? 'Account created successfully!' : 'Akaunti imeundwa kikamilifu!',
          'success'
        )
        
        setTimeout(() => {
          if (registerRole === 'employer') {
            router.push('/employer')
          } else {
            router.push('/dashboard')
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Registration error:', error);
      showMessage(
        currentLanguage === 'en' 
          ? 'Registration failed. Please try again.' 
          : 'Usajili umeshindwa. Tafadhali jaribu tena.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="auth-container">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'white' }}>
            {currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="language-switcher" onClick={toggleLanguage}>
        <span>{currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Kazi Mashinani</h1>
          <p>
            {currentLanguage === 'en' 
              ? 'Connecting Rural Talent with Opportunities' 
              : 'Kuunganisha Watalanta Vijijini na Fursa'
            }
          </p>
        </div>
        
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            {currentLanguage === 'en' ? 'Login' : 'Ingia'}
          </div>
          <div 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {currentLanguage === 'en' ? 'Register' : 'Jisajili'}
          </div>
        </div>
        
        <div className="auth-content">
          {message.text && (
            <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.loginPhone}
                  onChange={(e) => handleInputChange('loginPhone', e.target.value)}
                  className="form-control"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.loginPassword}
                  onChange={(e) => handleInputChange('loginPassword', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Enter your password' : 'Weka nenosiri lako'}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? (
                  <span className="loading-button">
                    <div className="spinner-small"></div>
                    {currentLanguage === 'en' ? 'Logging in...' : 'Inaingia...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Login' : 'Ingia'
                )}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegistration}>
              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'} *
                </label>
                <input
                  type="text"
                  value={formData.registerName}
                  onChange={(e) => handleInputChange('registerName', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Enter your full name' : 'Weka jina lako kamili'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'} *
                </label>
                <input
                  type="tel"
                  value={formData.registerPhone}
                  onChange={(e) => handleInputChange('registerPhone', e.target.value)}
                  className="form-control"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Location' : 'Mahali Unapoishi'} *
                </label>
                <input
                  type="text"
                  value={formData.registerLocation}
                  onChange={(e) => handleInputChange('registerLocation', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'} *
                </label>
                <input
                  type="password"
                  value={formData.registerPassword}
                  onChange={(e) => handleInputChange('registerPassword', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Create a password' : 'Tengeneza nenosiri'}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'I am a' : 'Mimi ni'} *
                </label>
                <select
                  value={formData.registerRole}
                  onChange={(e) => handleInputChange('registerRole', e.target.value)}
                  className="form-control"
                  required
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
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? (
                  <span className="loading-button">
                    <div className="spinner-small"></div>
                    {currentLanguage === 'en' ? 'Creating account...' : 'Inaunda akaunti...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Register' : 'Jisajili'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
