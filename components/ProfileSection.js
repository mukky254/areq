
'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ApiService } from '../lib/api'

export default function ProfileSection() {
  const { user, userRole, currentLanguage, userJobs, dispatch } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    specialization: '',
    jobType: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        specialization: user.specialization || '',
        jobType: user.jobType || ''
      })
    }
  }, [user])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location) {
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
      const response = await ApiService.updateProfile(formData)

      if (response.success) {
        const updatedUser = { ...user, ...formData }
        dispatch({ type: 'SET_USER', payload: { user: updatedUser, token: localStorage.getItem('token'), userRole } })
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        showMessage(
          currentLanguage === 'en' ? 'Profile updated successfully!' : 'Wasifu umesasishwa kikamilifu!',
          'success'
        )
        setIsEditing(false)
      }
    } catch (error) {
      showMessage(
        error.message || (currentLanguage === 'en' 
          ? 'Failed to update profile.' 
          : 'Imeshindwa kusasisha wasifu.'),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (confirm(
      currentLanguage === 'en' 
        ? 'Are you sure you want to delete your account? This action cannot be undone.' 
        : 'Una uhakika unataka kufuta akaunti yako? Hatua hii haiwezi kubatilishwa.'
    )) {
      try {
        await ApiService.deleteAccount()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        dispatch({ type: 'LOGOUT' })
        window.location.href = '/auth'
      } catch (error) {
        showMessage(
          error.message || (currentLanguage === 'en' 
            ? 'Failed to delete account.' 
            : 'Imeshindwa kufuta akaunti.'),
          'error'
        )
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-600">
              {userRole === 'employee' 
                ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                : (currentLanguage === 'en' ? 'Employer' : 'Mwajiri')
              }
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type} p-3 rounded-lg mb-4 text-center`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-3">
            <i className="fas fa-user-circle"></i>
            {currentLanguage === 'en' ? 'Personal Information' : 'Taarifa Binafsi'}
          </h2>

          {!isEditing ? (
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

              {userRole === 'employee' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {currentLanguage === 'en' ? 'Specialization:' : 'Utaalamu:'}
                  </label>
                  <p className="font-semibold">{user?.specialization || 'Not specified'}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {currentLanguage === 'en' ? 'Job Types:' : 'Aina za Kazi:'}
                  </label>
                  <p className="font-semibold">{user?.jobType || 'Not specified'}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  {currentLanguage === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}
                </button>
                <button
                  onClick={deleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash"></i>
                  {currentLanguage === 'en' ? 'Delete Account' : 'Futa Akaunti'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {currentLanguage === 'en' ? 'Full Name' : 'Jina Kamili'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {currentLanguage === 'en' ? 'Location' : 'Eneo'} *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {userRole === 'employee' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {currentLanguage === 'en' ? 'Specialization' : 'Utaalamu'}
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {currentLanguage === 'en' ? 'Job Types' : 'Aina za Kazi'}
                  </label>
                  <input
                    type="text"
                    value={formData.jobType}
                    onChange={(e) => handleInputChange('jobType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {currentLanguage === 'en' ? 'Updating...' : 'Inasasisha...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {currentLanguage === 'en' ? 'Update Profile' : 'Sasisha Wasifu'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times"></i>
                  {currentLanguage === 'en' ? 'Cancel' : 'Ghairi'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Employer Jobs Section */}
        {userRole === 'employer' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-3">
              <i className="fas fa-list"></i>
              {currentLanguage === 'en' ? 'My Posted Jobs' : 'Kazi Nilizotangaza'}
            </h2>

            {userJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-briefcase text-4xl mb-3 opacity-50"></i>
                <p>
                  {currentLanguage === 'en' 
                    ? "You haven't posted any jobs yet." 
                    : 'Hujatangaza kazi yoyote bado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userJobs.map(job => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {job.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
