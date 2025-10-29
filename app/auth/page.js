'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Real user database simulation
const userDatabase = {
  '254712345678': {
    password: 'password123',
    name: 'John Kamau',
    phone: '254712345678',
    location: 'Nairobi',
    role: 'employee',
    skills: ['Ujenzi', 'Kilimo', 'Usafiri'],
    experience: '3 years',
    profileComplete: 85
  },
  '254723456789': {
    password: 'password123',
    name: 'Mary Wanjiku',
    phone: '254723456789',
    location: 'Nakuru',
    role: 'employee',
    skills: ['Usafi', 'Upishi', 'Utunzaji wa Watoto'],
    experience: '4 years',
    profileComplete: 90
  },
  '254734567890': {
    password: 'password123',
    name: 'James Omondi',
    phone: '254734567890',
    location: 'Kisumu',
    role: 'employer',
    businessName: 'Green Valley Farm',
    businessType: 'Kilimo',
    profileComplete: 75
  }
}

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
    registerSkills: '',
    registerExperience: ''
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

  const formatPhoneToStandard = (phone) => {
    if (!phone) return '';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }
    return cleanPhone;
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
      
      // Real authentication check
      const user = userDatabase[formattedPhone]
      
      if (user && user.password === formData.loginPassword) {
        // Successful login
        const userData = {
          _id: formattedPhone,
          name: user.name,
          phone: user.phone,
          location: user.location,
          role: user.role,
          skills: user.skills || [],
          experience: user.experience || '',
          businessName: user.businessName || '',
          businessType: user.businessType || '',
          profileComplete: user.profileComplete || 70
        }

        localStorage.setItem('token', 'real-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userRole', user.role)
        
        showMessage(
          currentLanguage === 'en' ? 'Login successful!' : 'Umefanikiwa kuingia!',
          'success'
        )
        
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        showMessage(
          currentLanguage === 'en' 
            ? 'Invalid phone number or password' 
            : 'Nambari ya simu au nenosiri si sahihi',
          'error'
        )
      }
    } catch (error) {
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

  const handleRegistration = async () => {
    const { registerName, registerPhone, registerLocation, registerPassword, registerRole, registerSkills, registerExperience } = formData
    
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
      
      // Check if user already exists
      if (userDatabase[formattedPhone]) {
        showMessage(
          currentLanguage === 'en' 
            ? 'Phone number already registered' 
            : 'Nambari ya simu tayari imesajiliwa',
          'error'
        )
        return
      }

      // Create new user
      const newUser = {
        _id: 'user-' + Date.now(),
        name: registerName,
        phone: formattedPhone,
        location: registerLocation,
        role: registerRole,
        skills: registerSkills ? registerSkills.split(',').map(s => s.trim()) : [],
        experience: registerExperience || '',
        profileComplete: 60
      }

      // Add to database (in real app, this would be API call)
      userDatabase[formattedPhone] = {
        password: registerPassword,
        name: registerName,
        phone: formattedPhone,
        location: registerLocation,
        role: registerRole,
        skills: registerSkills ? registerSkills.split(',').map(s => s.trim()) : [],
        experience: registerExperience || '',
        profileComplete: 60
      }

      localStorage.setItem('token', 'real-token-' + Date.now())
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('userRole', registerRole)
      
      showMessage(
        currentLanguage === 'en' ? 'Account created successfully!' : 'Akaunti imeundwa kikamilifu!',
        'success'
      )
      
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div 
        className="fixed top-4 right-4 flex items-center gap-2 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={toggleLanguage}
      >
        <span className="text-lg">{currentLanguage === 'en' ? '🇺🇸' : '🇰🇪'}</span>
        <span className="font-semibold">
          {currentLanguage === 'en' ? 'English' : 'Kiswahili'}
        </span>
      </div>

      {/* Auth Container */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Kazi Mashinani</h1>
          <p className="opacity-90">
            {currentLanguage === 'en' 
              ? 'Connecting Rural Talent with Opportunities' 
              : 'Kuunganisha Watalanta Vijijini na Fursa'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800">
          <div 
            className={`flex-1 p-4 text-center cursor-pointer transition-colors ${
              activeTab === 'login' ? 'bg-green-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            <span className="text-white font-medium">
              {currentLanguage === 'en' ? 'Login' : 'Ingia'}
            </span>
          </div>
          <div 
            className={`flex-1 p-4 text-center cursor-pointer transition-colors ${
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
        <div className="p-6">
          {/* Message Display */}
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 text-center ${
              message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.loginPhone}
                  onChange={(e) => handleInputChange('loginPhone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07XXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentLanguage === 'en' ? 'Test: 0712345678' : 'Jaribu: 0712345678'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.loginPassword}
                  onChange={(e) => handleInputChange('loginPassword', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter password' : 'Weka nenosiri'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentLanguage === 'en' ? 'Password: password123' : 'Nenosiri: password123'}
                </p>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {currentLanguage === 'en' ? 'Logging in...' : 'Inaingia...'}
                  </span>
                ) : (
                  currentLanguage === 'en' ? 'Login' : 'Ingia'
                )}
              </button>
            </div>
          )}

          {/* Registration Form */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'}
                </label>
                <input
                  type="text"
                  value={formData.registerName}
                  onChange={(e) => handleInputChange('registerName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter your full name' : 'Weka jina lako kamili'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                </label>
                <input
                  type="tel"
                  value={formData.registerPhone}
                  onChange={(e) => handleInputChange('registerPhone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Location' : 'Mahali Unapoishi'}
                </label>
                <input
                  type="text"
                  value={formData.registerLocation}
                  onChange={(e) => handleInputChange('registerLocation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Enter your location' : 'Weka eneo lako'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Skills (comma separated)' : 'Ujuzi (tenganisha kwa koma)'}
                </label>
                <input
                  type="text"
                  value={formData.registerSkills}
                  onChange={(e) => handleInputChange('registerSkills', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'e.g. Farming, Construction' : 'K.m. Kilimo, Ujenzi'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Experience' : 'Uzoefu'}
                </label>
                <input
                  type="text"
                  value={formData.registerExperience}
                  onChange={(e) => handleInputChange('registerExperience', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'e.g. 2 years' : 'K.m. Miaka 2'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'Password' : 'Nenosiri'}
                </label>
                <input
                  type="password"
                  value={formData.registerPassword}
                  onChange={(e) => handleInputChange('registerPassword', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentLanguage === 'en' ? 'Create a password' : 'Tengeneza nenosiri'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en' ? 'I am a' : 'Mimi ni'}
                </label>
                <select
                  value={formData.registerRole}
                  onChange={(e) => handleInputChange('registerRole', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
