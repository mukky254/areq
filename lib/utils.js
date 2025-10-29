// Add fallback data for when API fails
export const getFallbackJobs = () => {
  return [
    {
      _id: '1',
      title: 'Farm Worker Needed',
      description: 'Looking for experienced farm worker for crop cultivation and animal care',
      location: 'Nakuru',
      category: 'agriculture',
      phone: '+254712345678',
      businessType: 'Farm',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2', 
      title: 'Construction Helper',
      description: 'Construction site helper needed for building projects',
      location: 'Nairobi',
      category: 'construction',
      phone: '+254723456789',
      businessType: 'Construction Company',
      createdAt: new Date().toISOString()
    }
  ]
}

export const getFallbackEmployees = () => {
  return [
    {
      _id: '1',
      name: 'John Kamau',
      phone: '+254712345678',
      location: 'Nairobi',
      specialization: 'Farm Worker',
      role: 'employee',
      joinDate: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Mary Wanjiku',
      phone: '+254723456789', 
      location: 'Nakuru',
      specialization: 'Domestic Worker',
      role: 'employee',
      joinDate: new Date().toISOString()
    }
  ]
}
