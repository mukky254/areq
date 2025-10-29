'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { translateToSwahili } from '../lib/utils'

export default function JobCard({ job, onToggleFavorite, isFavorite }) {
  const { currentLanguage } = useApp()
  const [showShareModal, setShowShareModal] = useState(false)

  const title = currentLanguage === 'sw' && job.titleTranslated ? job.titleTranslated : job.title
  const description = currentLanguage === 'sw' && job.descriptionTranslated ? job.descriptionTranslated : job.description
  const location = currentLanguage === 'sw' && job.locationTranslated ? job.locationTranslated : job.location
  const businessType = currentLanguage === 'sw' && job.businessTypeTranslated ? job.businessTypeTranslated : (job.businessType || 'Individual')

  const shareJob = (platform) => {
    const shareText = currentLanguage === 'en' 
      ? `Job Opportunity: ${title} in ${location}. Contact: ${job.phone}`
      : `Fursa ya Kazi: ${title} katika ${location}. Wasiliana: ${job.phone}`
    
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
    setShowShareModal(false)
  }

  return (
    <>
      <div className="job-card bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover-lift relative group">
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(job._id)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFavorite 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <i className={`fas fa-heart ${isFavorite ? 'fa-solid' : 'fa-regular'}`}></i>
        </button>

        {/* Job Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="job-title text-lg font-bold text-blue-600 flex-1 pr-4">
            {title}
          </h3>
          <span className="job-category bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {job.category}
          </span>
        </div>

        {/* Job Description */}
        <p className="job-description text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Job Meta */}
        <div className="job-meta flex flex-wrap gap-3 mb-4">
          <div className="meta-item flex items-center gap-2 text-sm text-gray-500">
            <i className="fas fa-map-marker-alt text-blue-500"></i>
            <span>{location}</span>
          </div>
          <div className="meta-item flex items-center gap-2 text-sm text-gray-500">
            <i className="fas fa-building text-green-500"></i>
            <span>{businessType}</span>
          </div>
          <div className="meta-item flex items-center gap-2 text-sm text-gray-500">
            <i className="fas fa-calendar text-purple-500"></i>
            <span>{new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Communication Buttons */}
        <div className="communication flex gap-2 mb-4">
          <a 
            href={`tel:${job.phone}`}
            className="btn-call flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-phone"></i>
            <span>{currentLanguage === 'en' ? 'Call' : 'Piga Simu'}</span>
          </a>
          <a 
            href={`https://wa.me/${job.phone}?text=Hi, I am interested in the ${encodeURIComponent(job.title)} position`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
          >
            <i className="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-share-alt"></i>
          <span>{currentLanguage === 'en' ? 'Share' : 'Sambaza'}</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {currentLanguage === 'en' ? 'Share to...' : 'Sambaza kwa...'}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['facebook', 'twitter', 'whatsapp', 'linkedin'].map(platform => (
                <button
                  key={platform}
                  onClick={() => shareJob(platform)}
                  className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    platform === 'facebook' ? 'bg-blue-600 text-white' :
                    platform === 'twitter' ? 'bg-blue-400 text-white' :
                    platform === 'whatsapp' ? 'bg-green-600 text-white' :
                    'bg-blue-700 text-white'
                  }`}
                >
                  <i className={`fab fa-${platform} text-lg mb-2`}></i>
                  <div className="text-sm font-medium capitalize">{platform}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
