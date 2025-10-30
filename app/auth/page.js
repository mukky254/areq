'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { AppUtils } from '../../lib/utils'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    location: '',
    role: 'employee',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'sw'
    setCurrentLanguage(savedLanguage)
  }, [])

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
    AppUtils.addNotification(
      newLanguage === 'en' ? 'Language changed to English' : 'Lugha imebadilishwa kuwa Kiswahili',
      'info'
    )
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (activeTab === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = currentLanguage === 'en' ? 'Name is required' : 'Jina linahitajika'
      }
      if (!formData.location.trim()) {
        newErrors.location = currentLanguage === 'en' ? 'Location is required' : 'Eneo linahitajika'
      }
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = currentLanguage === 'en' ? 'Phone number is required' : 'Nambari ya simu inahitajika'
    } else if (!/^[0-9+-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = currentLanguage === 'en' ? 'Invalid phone number' : 'Nambari ya simu si sahihi'
    }
    
    if (!formData.password) {
      newErrors.password = currentLanguage === 'en' ? 'Password is required' : 'Nenosiri linahitajika'
    } else if (formData.password.length < 6) {
      newErrors.password = currentLanguage === 'en' ? 'Password must be at least 6 characters' : 'Nenosiri lazima liwe na herufi 6 au zaidi'
    }
    
    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = currentLanguage === 'en' ? 'Passwords do not match' : 'Nenosiri halifanani'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setErrors({})

    try {
      let response
      
      if (activeTab === 'login') {
        response = await ApiService.login(formData.phone, formData.password)
      } else {
        const userData = {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          location: formData.location,
          role: formData.role
        }
        response = await ApiService.register(userData)
      }

      if (response.success) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('userRole', response.user.role)
        
        AppUtils.addNotification(
          currentLanguage === 'en' ? 'Welcome to Kazi Mashinani!' : 'Karibu kwenye Kazi Mashinani!',
          'success'
        )
        
        if (response.user.role === 'employer') {
          router.push('/employer')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ 
        submit: currentLanguage === 'en' 
          ? 'Authentication failed. Please try again.' 
          : 'Imeshindwa kuthibitisha. Tafadhali jaribu tena.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="auth-container">
      {/* Feature: Language Switcher */}
      <div className="language-switcher">
        <button onClick={toggleLanguage} className="language-btn">
          {currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-hands-helping"></i>
            <h1>Kazi Mashinani</h1>
          </div>
          <p>
            {currentLanguage === 'en' 
              ? 'Connecting Rural Talent with Opportunities' 
              : 'Kuunganisha Talanta za Vijijini na Fursa'}
          </p>
        </div>

        {/* Feature: Tab Navigation */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            {currentLanguage === 'en' ? 'Login' : 'Ingia'}
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {currentLanguage === 'en' ? 'Register' : 'Jisajili'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Feature: Role Selection for Registration */}
          {activeTab === 'register' && (
            <>
              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={currentLanguage === 'en' ? 'Enter your name' : 'Weka jina lako'}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'I am a' : 'Mimi ni'}</label>
                <div className="role-selection">
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'employee' ? 'active' : ''}`}
                    onClick={() => handleInputChange('role', 'employee')}
                  >
                    <i className="fas fa-user"></i>
                    {currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi'}
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'employer' ? 'active' : ''}`}
                    onClick={() => handleInputChange('role', 'employer')}
                  >
                    <i className="fas fa-briefcase"></i>
                    {currentLanguage === 'en' ? 'Employer' : 'Mwajiri'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{currentLanguage === 'en' ? 'Location' : 'Eneo'}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label>{currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="07XXXXXXXX"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>{currentLanguage === 'en' ? 'Password' : 'Nenosiri'}</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={currentLanguage === 'en' ? 'Enter password' : 'Weka nenosiri'}
                className={errors.password ? 'error' : ''}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label>{currentLanguage === 'en' ? 'Confirm Password' : 'Thibitisha Nenosiri'}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={currentLanguage === 'en' ? 'Confirm your password' : 'Thibitisha nenosiri lako'}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                {currentLanguage === 'en' ? 'Processing...' : 'Inachakata...'}
              </>
            ) : (
              currentLanguage === 'en' 
                ? (activeTab === 'login' ? 'Sign In' : 'Create Account')
                : (activeTab === 'login' ? 'Ingia' : 'Undi Akaunti')
            )}
          </button>
        </form>

        {/* Feature: Quick Help */}
        <div className="auth-help">
          <p>
            {currentLanguage === 'en' 
              ? 'Need help? Contact support: +254790528837' 
              : 'Unahitaji usaidizi? Wasiliana na: +254790528837'}
          </p>
        </div>
      </div>
    </div>
  )
}
