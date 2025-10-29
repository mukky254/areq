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
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        router.push('/dashboard')
      }

      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
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
      
      // REAL API CALL to your backend
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
      
      // REAL API CALL to your backend
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
          currentLanguage === 'en' ? 'Account created successfully!' : 'Akaunti imeundwa kikamilifu!',
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

  return (
    <div className="auth-container">
      {/* Language Switcher */}
      <div 
        className="language-switcher"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          zIndex: 100
        }}
        onClick={toggleLanguage}
      >
        <span style={{ fontWeight: '600' }}>
          {currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}
        </span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Kazi Mashinani</h1>
          <p>Kuunganisha Watalanta Vijijini na Fursa</p>
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
            <div>
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
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }}></div>
                    {currentLanguage === 'en' ? 'Logging in...' : 'Inaingia...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Login' : 'Ingia'
                )}
              </button>
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}
                </label>
                <input
                  type="text"
                  value={formData.registerName}
                  onChange={(e) => handleInputChange('registerName', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Enter your full name' : 'Weka jina lako kamili'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.registerPhone}
                  onChange={(e) => handleInputChange('registerPhone', e.target.value)}
                  className="form-control"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Location' : 'Mahali Unapoishi'}
                </label>
                <input
                  type="text"
                  value={formData.registerLocation}
                  onChange={(e) => handleInputChange('registerLocation', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.registerPassword}
                  onChange={(e) => handleInputChange('registerPassword', e.target.value)}
                  className="form-control"
                  placeholder={currentLanguage === 'en' ? 'Create a password' : 'Tengeneza nenosiri'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {currentLanguage === 'en' ? 'I am a' : 'Mimi ni'}
                </label>
                <select
                  value={formData.registerRole}
                  onChange={(e) => handleInputChange('registerRole', e.target.value)}
                  className="form-control"
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
                className="btn btn-primary btn-block"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }}></div>
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
