'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function EmployeeCard({ employee }) {
  const { currentLanguage } = useApp()
  const [showContactModal, setShowContactModal] = useState(false)

  const handleCall = () => {
    window.open(`tel:${employee.phone}`, '_self')
  }

  const handleWhatsApp = () => {
    const message = currentLanguage === 'en' 
      ? `Hi ${employee.name}, I have a job opportunity for you` 
      : `Habari ${employee.name}, Nina fursa ya kazi kwa ajili yako`
    
    window.open(`https://wa.me/${employee.phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleShare = (platform) => {
    const shareText = currentLanguage === 'en'
      ? `Worker Profile: ${employee.name} - ${employee.specialization || 'General Worker'} in ${employee.location}. Contact: ${employee.phone}`
      : `Wasifu wa Mfanyakazi: ${employee.name} - ${employee.specialization || 'Mfanyakazi wa Jumla'} katika ${employee.location}. Wasiliana: ${employee.phone}`
    
    const encodedText = encodeURIComponent(shareText)
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
    setShowContactModal(false)
  }

  return (
    <>
      <div className="job-card bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover-lift relative group">
        {/* Employee Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {employee.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div>
              <h3 className="job-title text-lg font-bold text-blue-600">
                {employee.name}
              </h3>
              <p className="text-sm text-gray-600">
                {employee.role === 'employee' 
                  ? (currentLanguage === 'en' ? 'Job Seeker' : 'Mtafuta Kazi')
                  : (employee.role || (currentLanguage === 'en' ? 'Worker' : 'Mfanyakazi'))
                }
              </p>
            </div>
          </div>
          <span className="job-category bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {employee.specialization || (currentLanguage === 'en' ? 'General' : 'Jumla')}
          </span>
        </div>

        {/* Employee Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-graduation-cap text-blue-500 w-5"></i>
            <span className="font-medium">
              {currentLanguage === 'en' ? 'Specialization:' : 'Utaalamu:'}
            </span>
            <span>{employee.specialization || (currentLanguage === 'en' ? 'General Worker' : 'Mfanyakazi wa Jumla')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-map-marker-alt text-green-500 w-5"></i>
            <span className="font-medium">
              {currentLanguage === 'en' ? 'Location:' : 'Eneo:'}
            </span>
            <span>{employee.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-calendar text-purple-500 w-5"></i>
            <span className="font-medium">
              {currentLanguage === 'en' ? 'Member since:' : 'Mwanachama tangu:'}
            </span>
            <span>{new Date(employee.joinDate || employee.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="communication flex gap-2 mb-3">
          <button
            onClick={handleCall}
            className="btn-call flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-phone"></i>
            <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="btn-whatsapp flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
          >
            <i className="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </button>
        </div>

        {/* More Options Button */}
        <button
          onClick={() => setShowContactModal(true)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-ellipsis-h"></i>
          <span>{currentLanguage === 'en' ? 'More Options' : 'Chaguo Zaidi'}</span>
        </button>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {currentLanguage === 'en' ? 'Contact Options' : 'Chaguo za Mawasiliano'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3">
              {/* Direct Contact */}
              <div className="space-y-2">
                <button
                  onClick={handleCall}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <i className="fas fa-phone text-lg"></i>
                  <span className="font-semibold">
                    {currentLanguage === 'en' ? 'Call Directly' : 'Piga Simu Moja kwa Moja'}
                  </span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <i className="fab fa-whatsapp text-lg"></i>
                  <span className="font-semibold">
                    {currentLanguage === 'en' ? 'Message on WhatsApp' : 'Tuma Ujumbe WhatsApp'}
                  </span>
                </button>
              </div>

              {/* Share Profile */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">
                  {currentLanguage === 'en' ? 'Share Profile' : 'Sambaza Wasifu'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['facebook', 'twitter', 'whatsapp', 'linkedin'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                        platform === 'facebook' ? 'bg-blue-600 text-white' :
                        platform === 'twitter' ? 'bg-blue-400 text-white' :
                        platform === 'whatsapp' ? 'bg-green-600 text-white' :
                        'bg-blue-700 text-white'
                      }`}
                    >
                      <i className={`fab fa-${platform} text-lg mb-1`}></i>
                      <div className="text-xs font-medium capitalize">{platform}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  {currentLanguage === 'en' ? 'Contact Information' : 'Taarifa za Mawasiliano'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentLanguage === 'en' ? 'Phone:' : 'Simu:'}</span>
                    <span className="font-semibold">{employee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentLanguage === 'en' ? 'Location:' : 'Eneo:'}</span>
                    <span className="font-semibold">{employee.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentLanguage === 'en' ? 'Specialization:' : 'Utaalamu:'}</span>
                    <span className="font-semibold">{employee.specialization || (currentLanguage === 'en' ? 'General' : 'Jumla')}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {currentLanguage === 'en' ? 'Close' : 'Funga'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
