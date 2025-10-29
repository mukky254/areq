'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { formatPhoneToStandard } from '../../lib/utils' // Make sure this import is correct

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
      if (token) {
        router.push('/dashboard')
      }

      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [router])

  // Add the function directly here as a backup
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    let cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }
    
    return cleanPhone;
  }

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
      // Use the local function as backup
      const formattedPhone = formatPhone(formData.loginPhone)
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
      // Use the local function as backup
      const formattedPhone = formatPhone(registerPhone)
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div 
        className="language-switcher"
        onClick={toggleLanguage}
      >
        <span id="currentFlag">{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
        <span id="currentLanguage">{currentLanguage === 'en' ? 'English' : 'Kiswahili'}</span>
      </div>
      
      <div className="auth-container">
        <div className="auth-header">
          <h1 data-en="Kazi Mashinani" data-sw="Kazi Mashinani">Kazi Mashinani</h1>
          <p data-en="Connecting Rural Talent with Opportunities" data-sw="Kuunganisha Watalanta Vijijini na Fursa">Kuunganisha Watalanta Vijijini na Fursa</p>
        </div>
        
        <div className="auth-tabs">
          <div className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
            <span data-en="Login" data-sw="Ingia">Ingia</span>
          </div>
          <div className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            <span data-en="Register" data-sw="Jisajili">Jisajili</span>
          </div>
        </div>
        
        <div className="auth-content">
          {/* Login Form */}
          <div className={`auth-form ${activeTab === 'login' ? 'active' : ''}`} id="loginForm">
            {message.text && (
              <div className={`message ${message.type}`} style={{display: 'block'}}>
                {message.text}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="loginPhone" data-en="Phone Number" data-sw="Nambari ya Simu">Nambari ya Simu</label>
              <input 
                type="tel" 
                id="loginPhone" 
                className="form-control" 
                placeholder="07XXXXXXXX"
                value={formData.loginPhone}
                onChange={(e) => handleInputChange('loginPhone', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="loginPassword" data-en="Password" data-sw="Nenosiri">Nenosiri</label>
              <input 
                type="password" 
                id="loginPassword" 
                className="form-control" 
                placeholder={currentLanguage === 'en' ? 'Enter your password' : 'Weka nenosiri lako'}
                value={formData.loginPassword}
                onChange={(e) => handleInputChange('loginPassword', e.target.value)}
              />
            </div>
            
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> {currentLanguage === 'en' ? 'Logging in...' : 'Inaingia...'}
                </span>
              ) : (
                <span data-en="Login" data-sw="Ingia">Ingia</span>
              )}
            </button>
          </div>
          
          {/* Registration Form */}
          <div className={`auth-form ${activeTab === 'register' ? 'active' : ''}`} id="registerForm">
            {message.text && (
              <div className={`message ${message.type}`} style={{display: 'block'}}>
                {message.text}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="registerName" data-en="Full Name" data-sw="Jina Kamili">Jina Kamili</label>
              <input 
                type="text" 
                id="registerName" 
                className="form-control" 
                placeholder={currentLanguage === 'en' ? 'Enter your full name' : 'Weka jina lako kamili'}
                value={formData.registerName}
                onChange={(e) => handleInputChange('registerName', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerPhone" data-en="Phone Number" data-sw="Nambari ya Simu">Nambari ya Simu</label>
              <input 
                type="tel" 
                id="registerPhone" 
                className="form-control" 
                placeholder="07XXXXXXXX"
                value={formData.registerPhone}
                onChange={(e) => handleInputChange('registerPhone', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerLocation" data-en="Enter Location" data-sw="Mahali Unapoishi">Mahali Unapoishi</label>
              <input 
                type="text" 
                id="registerLocation" 
                className="form-control" 
                placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                value={formData.registerLocation}
                onChange={(e) => handleInputChange('registerLocation', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerPassword" data-en="Password" data-sw="Nenosiri">Nenosiri</label>
              <input 
                type="password" 
                id="registerPassword" 
                className="form-control" 
                placeholder={currentLanguage === 'en' ? 'Create a password' : 'Tengeneza nenosiri'}
                value={formData.registerPassword}
                onChange={(e) => handleInputChange('registerPassword', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerRole" data-en="I am a" data-sw="Mimi ni">Mimi ni</label>
              <select 
                id="registerRole" 
                className="form-control"
                value={formData.registerRole}
                onChange={(e) => handleInputChange('registerRole', e.target.value)}
              >
                <option value="employee" data-en="Job Seeker" data-sw="Mtafuta Kazi">Mtafuta Kazi</option>
                <option value="employer" data-en="Employer" data-sw="Mwajiri">Mwajiri</option>
              </select>
            </div>
            
            <button className="btn" onClick={handleRegistration} disabled={loading}>
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> {currentLanguage === 'en' ? 'Creating account...' : 'Inaunda akaunti...'}
                </span>
              ) : (
                <span data-en="Register" data-sw="Jisajili">Jisajili</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Include ALL your original CSS styles here */
        :root {
          --primary-color: #2ecc71;
          --secondary-color: #3498db;
          --accent-color: #e74c3c;
          --dark-color: #2c3e50;
          --light-color: #ecf0f1;
          --text-color: #333;
          --border-radius: 8px;
          --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .auth-container {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }
        
        .auth-header {
          background-color: var(--primary-color);
          color: white;
          padding: 20px;
          text-align: center;
        }
        
        .auth-header h1 {
          font-size: 1.8rem;
          margin-bottom: 5px;
        }
        
        .auth-header p {
          opacity: 0.9;
        }
        
        .auth-tabs {
          display: flex;
          background-color: var(--dark-color);
        }
        
        .auth-tab {
          flex: 1;
          padding: 15px;
          text-align: center;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .auth-tab.active {
          background-color: var(--primary-color);
        }
        
        .auth-content {
          padding: 30px;
        }
        
        .auth-form {
          display: none;
        }
        
        .auth-form.active {
          display: block;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--dark-color);
        }
        
        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-control:focus {
          border-color: var(--secondary-color);
          outline: none;
        }
        
        .btn {
          display: inline-block;
          width: 100%;
          padding: 14px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          text-align: center;
        }
        
        .btn:hover {
          background-color: #27ae60;
        }
        
        .btn:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .language-switcher {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 8px 15px;
          border-radius: 30px;
          box-shadow: var(--box-shadow);
          cursor: pointer;
        }
        
        .language-switcher span {
          font-weight: 500;
        }
        
        .message {
          padding: 12px;
          border-radius: var(--border-radius);
          margin-bottom: 20px;
          text-align: center;
        }
        
        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        @media (max-width: 480px) {
          .auth-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}
