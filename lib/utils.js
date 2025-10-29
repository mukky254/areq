export const formatPhoneToStandard = (phone) => {
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('254')) {
    cleanPhone = '254' + cleanPhone
  }
  return cleanPhone
}

export const escapeHtml = (unsafe) => {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export const translationDictionary = {
  'farm worker': 'mfanyakazi shambani',
  'construction helper': 'msaidizi ujenzi',
  'domestic worker': 'mfanyakazi wa nyumbani',
  'driver': 'dereva',
  'sales person': 'mwuza bidhaa',
  'cleaner': 'msafishaji',
  'security guard': 'mlinzi',
  'cook': 'mpishi',
  'waiter': 'mtumishi mezani',
  'nanny': 'yaya',
  'gardener': 'mtunza bustani',
  'housekeeper': 'mtunza nyumba',
  'caretaker': 'mtunza',
  'laborer': 'mfanyakazi',
  'assistant': 'msaidizi',
  'supervisor': 'msimamizi',
  'agriculture': 'kilimo',
  'construction': 'ujenzi',
  'domestic': 'kazi ya nyumbani',
  'driving': 'udereva',
  'retail': 'biashara',
  'general': 'jumla',
  'hospitality': 'ukarimu',
  'security': 'usalama',
  'nairobi': 'nairobi',
  'nakuru': 'nakuru',
  'mombasa': 'mombasa',
  'kisumu': 'kisumu',
  'eldoret': 'eldoret',
  'thika': 'thika',
  'kakamega': 'kakamega',
  'kisii': 'kisii',
  'farm': 'shamba',
  'construction company': 'kampuni ya ujenzi',
  'restaurant': 'mgahawa',
  'hotel': 'hoteli',
  'shop': 'duka',
  'home': 'nyumbani',
  'school': 'shule',
  'hospital': 'hospitali',
  'office': 'ofisi',
  'factory': 'kiwanda',
  'experience': 'uzoefu',
  'required': 'inahitajika',
  'preferred': 'inapendekezwa',
  'skills': 'ujuzi',
  'responsibilities': 'majukumu',
  'qualifications': 'sifa',
  'salary': 'mshahara',
  'hours': 'masaa',
  'full-time': 'muda kamili',
  'part-time': 'muda wa nusu',
  'temporary': 'muda',
  'permanent': 'kudumu',
  'immediately': 'haraka',
  'application': 'maombi',
  'interview': 'mahojiano'
}

export const translateToSwahili = (text, currentLanguage) => {
  if (!text || currentLanguage !== 'sw') return text
  
  let translated = text
  Object.keys(translationDictionary).forEach(english => {
    const swahili = translationDictionary[english]
    const regex = new RegExp(`\\b${english}\\b`, 'gi')
    translated = translated.replace(regex, swahili)
  })
  
  return translated
}

export const generatePagination = (currentPage, totalPages, callback) => {
  if (totalPages <= 1) return []
  
  const pages = []
  
  // Previous button
  pages.push({ type: 'prev', page: currentPage - 1, disabled: currentPage === 1 })
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push({ type: 'number', page: i, active: i === currentPage })
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push({ type: 'dots' })
    }
  }
  
  // Next button
  pages.push({ type: 'next', page: currentPage + 1, disabled: currentPage === totalPages })
  
  return pages
}

// New utility functions for enhanced features
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[0-9+\-\s()]{10,}$/
  return re.test(phone)
}
