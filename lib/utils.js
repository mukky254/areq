export const formatPhoneToStandard = (phone) => {
  if (!phone) return '';
  
  let cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('254')) {
    cleanPhone = '254' + cleanPhone;
  }
  
  return cleanPhone;
}

export const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const translationDictionary = {
  'farm worker': 'mfanyakazi shambani',
  'construction helper': 'msaidizi ujenzi',
  'domestic worker': 'mfanyakazi wa nyumbani',
  'driver': 'dereva',
  'sales person': 'mwuza bidhaa',
  'cleaner': 'msafishaji',
  // ... keep all your existing translation dictionary
};

export const translateToSwahili = (text, currentLanguage) => {
  if (!text || currentLanguage !== 'sw') return text;
  
  let translated = text;
  Object.keys(translationDictionary).forEach(english => {
    const swahili = translationDictionary[english];
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, swahili);
  });
  
  return translated;
}

// ... rest of your existing utils functions
