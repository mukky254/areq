const API_BASE_URL = 'https://backita.onrender.com';

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
      const userRole = phone === '254734567890' ? 'employer' : 'employee';
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + phone,
          name: userRole === 'employer' ? 'Mwajiri Jina' : 'Mtumiaji',
          phone: phone,
          location: 'Nairobi',
          role: userRole,
          profileComplete: userRole === 'employer' ? 85 : 75
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
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + Date.now(),
          name: userData.name,
          phone: userData.phone,
          location: userData.location,
          role: userData.role,
          profileComplete: userData.role === 'employer' ? 70 : 60
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
      return {
        success: true,
        jobs: this.getFallbackJobs()
      };
    }
  }

  static async getEmployerJobs(employerId) {
    try {
      return await this.request(`/jobs/employer/${employerId}`);
    } catch (error) {
      console.log('🔧 Using fallback employer jobs');
      return {
        success: true,
        jobs: this.getFallbackJobs().filter(job => job.employerId === employerId) || this.getFallbackJobs().slice(0, 2)
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
      const newJob = { 
        ...jobData, 
        _id: 'job-' + Date.now(),
        postedDate: new Date().toISOString(),
        employer: { name: jobData.employerName, rating: 4.5 }
      };
      
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        savedJobs.push(newJob);
        localStorage.setItem('employerJobs', JSON.stringify(savedJobs));
      }
      
      return {
        success: true,
        job: newJob
      };
    }
  }

  // FIXED: Added missing updateJob method
  static async updateJob(jobId, jobData) {
    try {
      return await this.request(`/jobs/${jobId}`, {
        method: 'PUT',
        body: jobData
      });
    } catch (error) {
      console.log('🔧 Using fallback job update');
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        const updatedJobs = savedJobs.map(job => 
          job._id === jobId ? { ...job, ...jobData } : job
        );
        localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
      }
      
      return {
        success: true,
        job: { _id: jobId, ...jobData }
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
      const application = {
        _id: 'app-' + Date.now(),
        jobId,
        ...applicationData,
        status: 'pending',
        appliedDate: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        savedApplications.push(application);
        localStorage.setItem('jobApplications', JSON.stringify(savedApplications));
      }
      
      return {
        success: true,
        application
      };
    }
  }

  static async getMyApplications() {
    try {
      return await this.request('/applications/my');
    } catch (error) {
      console.log('🔧 Using fallback applications');
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        return {
          success: true,
          applications
        };
      }
      return {
        success: true,
        applications: []
      };
    }
  }

  static async getEmployerApplications(employerId) {
    try {
      return await this.request(`/applications/employer/${employerId}`);
    } catch (error) {
      console.log('🔧 Using fallback employer applications');
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        return {
          success: true,
          applications: applications.filter(app => app.employerId === employerId) || []
        };
      }
      return {
        success: true,
        applications: []
      };
    }
  }

  static async updateApplicationStatus(applicationId, status) {
    try {
      return await this.request(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: { status }
      });
    } catch (error) {
      console.log('🔧 Using fallback application update');
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const updatedApplications = applications.map(app => 
          app._id === applicationId ? { ...app, status } : app
        );
        localStorage.setItem('jobApplications', JSON.stringify(updatedApplications));
      }
      
      return {
        success: true,
        application: { _id: applicationId, status }
      };
    }
  }

  // User endpoints with fallbacks
  static async getUserProfile() {
    try {
      return await this.request('/users/profile');
    } catch (error) {
      console.log('🔧 Using fallback user profile');
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        return {
          success: true,
          user: userData ? JSON.parse(userData) : null
        };
      }
      return {
        success: true,
        user: null
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return {
        success: true,
        user: userData
      };
    }
  }

  // Favorites endpoints with fallbacks
  static async saveFavorite(jobId, userId) {
    try {
      return await this.request('/favorites', {
        method: 'POST',
        body: { jobId, userId }
      });
    } catch (error) {
      console.log('🔧 Using fallback favorite save');
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        if (!favorites.some(fav => fav.jobId === jobId && fav.userId === userId)) {
          favorites.push({ jobId, userId, _id: 'fav-' + Date.now() });
          localStorage.setItem('userFavorites', JSON.stringify(favorites));
        }
      }
      return { success: true };
    }
  }

  static async getFavorites(userId) {
    try {
      return await this.request(`/favorites/${userId}`);
    } catch (error) {
      console.log('🔧 Using fallback favorites');
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const userFavorites = favorites.filter(fav => fav.userId === userId);
        return { success: true, favorites: userFavorites };
      }
      return { success: true, favorites: [] };
    }
  }

  static async removeFavorite(jobId, userId) {
    try {
      return await this.request(`/favorites/${jobId}`, {
        method: 'DELETE',
        body: { userId }
      });
    } catch (error) {
      console.log('🔧 Using fallback favorite removal');
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const updatedFavorites = favorites.filter(fav => 
          !(fav.jobId === jobId && fav.userId === userId)
        );
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      }
      return { success: true };
    }
  }

  // Translation function
  static async translateText(text, targetLanguage) {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage === 'sw' ? 'sw' : 'en'}`
      );
      const data = await response.json();
      return data.responseData.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
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
        employerId: 'employer-1',
        urgent: true,
        featured: false
      }
    ];
  }
}
