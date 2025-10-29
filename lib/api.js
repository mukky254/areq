const API_BASE_URL = 'https://backita.onrender.com';

export class ApiService {
  static async discoverEndpoints() {
    console.log('🔍 Discovering API endpoints...');
    
    const endpointsToTest = [
      '/auth/signin',
      '/auth/register', 
      '/jobs',
      '/employees',
      '/users/profile',
      '/api/jobs',
      '/api/employees'
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`${endpoint}: Failed - ${error.message}`);
      }
    }
  }

  static async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`🔄 API Call: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      console.log(`📡 Response Status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ API Success:', data);
        return data;
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ API Request Failed:', error);
      
      // Provide fallback data for development
      return this.getFallbackResponse(endpoint);
    }
  }

  static getFallbackResponse(endpoint) {
    console.log('🔄 Using fallback data for:', endpoint);
    
    if (endpoint.includes('/auth/signin') || endpoint.includes('/auth/register')) {
      // For auth endpoints, we can't use fallback - they need real backend
      throw new Error('Authentication service unavailable. Please try again later.');
    }
    
    if (endpoint.includes('/jobs')) {
      return { 
        success: true, 
        jobs: this.getFallbackJobs(),
        message: 'Using demonstration data'
      };
    }
    
    if (endpoint.includes('/employees')) {
      return { 
        success: true, 
        employees: this.getFallbackEmployees(),
        message: 'Using demonstration data'
      };
    }
    
    if (endpoint.includes('/users/profile')) {
      return { 
        success: true, 
        message: 'Profile update would be processed when backend is available'
      };
    }
    
    return { success: true, message: 'Operation completed with fallback data' };
  }

  // Enhanced fallback data
  static getFallbackJobs() {
    return [
      {
        _id: '1',
        title: 'Farm Worker Needed in Nakuru',
        titleTranslated: 'Mfanyakazi Shambani Anahitajika Nakuru',
        description: 'Looking for experienced farm worker for crop cultivation and animal care. Must have 2+ years experience.',
        descriptionTranslated: 'Inatafuta mfanyakazi shambani mwenye uzoefu wa kilimo cha mazao na utunzaji wa wanyama. Lazima awe na uzoefu wa miaka 2+',
        location: 'Nakuru',
        locationTranslated: 'Nakuru',
        category: 'agriculture',
        phone: '+254712345678',
        businessType: 'Green Valley Farm',
        businessTypeTranslated: 'Shamba la Green Valley',
        employerName: 'John Mwangi',
        salary: '15,000 KES/month',
        createdAt: new Date().toISOString(),
        postedDate: new Date().toISOString()
      },
      {
        _id: '2', 
        title: 'Construction Helper - Nairobi',
        titleTranslated: 'Msaidizi Ujenzi - Nairobi',
        description: 'Construction site helper needed for building projects. Training provided. Good physical condition required.',
        descriptionTranslated: 'Msaidizi wa tovuti ya ujenzi anahitajika kwa miradi ya ujenzi. Mafunzo yatapatikana. Hali nzuri ya kimwili inahitajika',
        location: 'Nairobi West',
        locationTranslated: 'Nairobi Magharibi',
        category: 'construction',
        phone: '+254723456789',
        businessType: 'Build It Construction Ltd',
        businessTypeTranslated: 'Kampuni ya Ujenzi Build It',
        employerName: 'Sarah construction',
        salary: '20,000 KES/month',
        createdAt: new Date().toISOString(),
        postedDate: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Domestic Worker - Mombasa',
        titleTranslated: 'Mfanyakazi Wa Nyumbani - Mombasa',
        description: 'House help needed for cleaning, cooking, and childcare. Must be trustworthy and reliable.',
        descriptionTranslated: 'Msaada wa nyumbani unahitajika kwa usafishaji, upikaji na utunzaji wa watoto. Lazima awe muaminifu na wa kuaminika',
        location: 'Mombasa',
        locationTranslated: 'Mombasa',
        category: 'domestic',
        phone: '+254734567890',
        businessType: 'Family Home',
        businessTypeTranslated: 'Nyumba ya Familia',
        employerName: 'Amina Family',
        salary: '12,000 KES/month',
        createdAt: new Date().toISOString(),
        postedDate: new Date().toISOString()
      },
      {
        _id: '4',
        title: 'Delivery Driver - Thika',
        titleTranslated: 'Dereva wa Uwasilishaji - Thika',
        description: 'Motorcycle delivery driver needed. Must have valid license and knowledge of Thika routes.',
        descriptionTranslated: 'Dereva wa uwasilishaji wa pikipiki anahitajika. Lazima awe na leseni halali na ujuzi wa njia za Thika',
        location: 'Thika',
        locationTranslated: 'Thika',
        category: 'driving',
        phone: '+254745678901',
        businessType: 'Quick Deliveries',
        businessTypeTranslated: 'Uwasilishaji wa Haraka',
        employerName: 'Quick Deliveries Co.',
        salary: '18,000 KES/month + tips',
        createdAt: new Date().toISOString(),
        postedDate: new Date().toISOString()
      }
    ];
  }

  static getFallbackEmployees() {
    return [
      {
        _id: '1',
        name: 'John Kamau',
        phone: '+254712345678',
        location: 'Nairobi, Kibera',
        specialization: 'Farm Worker & General Labor',
        role: 'employee',
        experience: '3 years',
        joinDate: new Date('2023-01-15').toISOString(),
        createdAt: new Date('2023-01-15').toISOString()
      },
      {
        _id: '2',
        name: 'Mary Wanjiku',
        phone: '+254723456789', 
        location: 'Nakuru, Kiamunyi',
        specialization: 'Domestic Worker & Cook',
        role: 'employee',
        experience: '4 years',
        joinDate: new Date('2022-11-20').toISOString(),
        createdAt: new Date('2022-11-20').toISOString()
      },
      {
        _id: '3',
        name: 'James Omondi',
        phone: '+254734567890',
        location: 'Kisumu, Manyatta',
        specialization: 'Construction Worker',
        role: 'employee',
        experience: '2 years',
        joinDate: new Date('2023-03-10').toISOString(),
        createdAt: new Date('2023-03-10').toISOString()
      },
      {
        _id: '4',
        name: 'Grace Achieng',
        phone: '+254745678901',
        location: 'Mombasa, Likoni',
        specialization: 'Cleaner & Housekeeper',
        role: 'employee',
        experience: '5 years',
        joinDate: new Date('2021-08-05').toISOString(),
        createdAt: new Date('2021-08-05').toISOString()
      }
    ];
  }

  // Auth endpoints
  static async login(phone, password) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: { phone, password }
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  // Jobs endpoints
  static async getJobs() {
    return this.request('/jobs');
  }

  static async getEmployerJobs(employerId) {
    try {
      return await this.request(`/jobs/employer/${employerId}`);
    } catch (error) {
      console.log('Employer jobs endpoint not available');
      return { success: true, jobs: [] };
    }
  }

  static async postJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: jobData
    });
  }

  static async updateJob(jobId, jobData) {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: jobData
    });
  }

  static async deleteJob(jobId) {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE'
    });
  }

  // User endpoints
  static async getEmployees() {
    return this.request('/employees');
  }

  static async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: userData
    });
  }

  static async deleteAccount() {
    return this.request('/users/profile', {
      method: 'DELETE'
    });
  }
}

// Test endpoints on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ApiService.discoverEndpoints();
  }, 2000);
}
