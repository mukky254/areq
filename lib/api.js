const API_BASE_URL = 'https://backita.onrender.com';

// Utility function
export const formatPhoneToStandard = (phone) => {
  if (!phone) return '';
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('254')) {
    cleanPhone = '254' + cleanPhone;
  }
  return cleanPhone;
};

export class ApiService {
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
      console.log(`🔄 Calling API: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        console.log(`❌ API Error ${response.status}: ${endpoint}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints with fallbacks
  static async login(phone, password) {
    try {
      return await this.request('/auth/signin', {
        method: 'POST',
        body: { phone, password }
      });
    } catch (error) {
      console.log('🔧 Using fallback login');
      // Fallback: Simulate successful login
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + phone,
          name: 'Mtumiaji',
          phone: phone,
          location: 'Nairobi',
          role: 'employee',
          profileComplete: 75
        }
      };
    }
  }

  static async register(userData) {
    try {
      return await this.request('/auth/register', {
        method: 'POST',
        body: userData
      });
    } catch (error) {
      console.log('🔧 Using fallback registration');
      // Fallback: Simulate successful registration
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + Date.now(),
          name: userData.name,
          phone: userData.phone,
          location: userData.location,
          role: userData.role,
          profileComplete: 60
        }
      };
    }
  }

  // Jobs endpoints with fallbacks
  static async getJobs() {
    try {
      return await this.request('/jobs');
    } catch (error) {
      console.log('🔧 Using fallback jobs data');
      // Fallback: Return sample jobs
      return {
        success: true,
        jobs: this.getFallbackJobs()
      };
    }
  }

  static async getJobById(jobId) {
    try {
      return await this.request(`/jobs/${jobId}`);
    } catch (error) {
      console.log('🔧 Using fallback job data');
      const jobs = this.getFallbackJobs();
      return {
        success: true,
        job: jobs.find(job => job._id === jobId) || jobs[0]
      };
    }
  }

  static async createJob(jobData) {
    try {
      return await this.request('/jobs', {
        method: 'POST',
        body: jobData
      });
    } catch (error) {
      console.log('🔧 Using fallback job creation');
      return {
        success: true,
        job: { ...jobData, _id: 'job-' + Date.now() }
      };
    }
  }

  // Applications endpoints with fallbacks
  static async applyForJob(jobId, applicationData) {
    try {
      return await this.request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: applicationData
      });
    } catch (error) {
      console.log('🔧 Using fallback application');
      return {
        success: true,
        application: {
          _id: 'app-' + Date.now(),
          jobId,
          ...applicationData,
          status: 'pending'
        }
      };
    }
  }

  static async getMyApplications() {
    try {
      return await this.request('/applications/my');
    } catch (error) {
      console.log('🔧 Using fallback applications');
      return {
        success: true,
        applications: []
      };
    }
  }

  // User endpoints with fallbacks
  static async getUserProfile() {
    try {
      return await this.request('/users/profile');
    } catch (error) {
      console.log('🔧 Using fallback user profile');
      const userData = localStorage.getItem('user');
      return {
        success: true,
        user: userData ? JSON.parse(userData) : null
      };
    }
  }

  static async updateProfile(userData) {
    try {
      return await this.request('/users/profile', {
        method: 'PUT',
        body: userData
      });
    } catch (error) {
      console.log('🔧 Using fallback profile update');
      return {
        success: true,
        user: userData
      };
    }
  }

  // Fallback data
  static getFallbackJobs() {
    return [
      {
        _id: '1',
        title: 'Mfanyakazi Shambani - Nakuru',
        description: 'Inatafuta mfanyakazi shambani mwenye uzoefu wa kilimo cha mazao na utunzaji wa wanyama. Lazima uwe na uzoefu wa miaka 2+ katika mbinu za kilimo cha kisasa.',
        location: 'Nakuru',
        category: 'kilimo',
        phone: '+254712345678',
        businessType: 'Shamba la Green Valley',
        salary: 'KES 15,000 / mwezi',
        experience: 'Miaka 2+',
        skills: ['Kilimo', 'Utunzaji wa Wanyama', 'Umwagiliaji'],
        postedDate: new Date('2024-01-15').toISOString(),
        employer: {
          name: 'John Mwangi',
          rating: 4.5
        },
        urgent: true,
        featured: false
      },
      {
        _id: '2',
        title: 'Msimamizi wa Ujenzi - Nairobi',
        description: 'Msimamizi wa ujenzi anahitajika kwa miradi mikuu ya ujenzi. Uzoefu wa uongozi unahitajika.',
        location: 'Nairobi',
        category: 'ujenzi',
        phone: '+254723456789',
        businessType: 'Kampuni ya Ujenzi Build It',
        salary: 'KES 45,000 / mwezi',
        experience: 'Miaka 5+',
        skills: ['Usimamizi', 'Ujenzi', 'Usimamizi wa Miradi'],
        postedDate: new Date('2024-01-10').toISOString(),
        employer: {
          name: 'Sarah Construction',
          rating: 4.2
        },
        urgent: false,
        featured: true
      },
      {
        _id: '3',
        title: 'Mfanyakazi Wa Nyumbani - Mombasa',
        description: 'Msaada wa nyumbani anahitajika kwa usafishaji na upikaji. Lazima awe muaminifu.',
        location: 'Mombasa',
        category: 'nyumbani',
        phone: '+254734567890',
        businessType: 'Nyumba ya Familia',
        salary: 'KES 12,000 / mwezi',
        experience: 'Mwaka 1+',
        skills: ['Usafi', 'Upishi', 'Utunzaji wa Watoto'],
        postedDate: new Date('2024-01-12').toISOString(),
        employer: {
          name: 'Amina Family',
          rating: 4.8
        },
        urgent: true,
        featured: false
      }
    ];
  }
}
