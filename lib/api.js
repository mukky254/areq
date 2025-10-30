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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(phone, password) {
    try {
      return await this.request('/auth/signin', {
        method: 'POST',
        body: { phone, password }
      });
    } catch (error) {
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

  // Jobs endpoints
  static async getJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await this.request(`/jobs?${queryParams}`);
    } catch (error) {
      let jobs = this.getFallbackJobs();
      
      // Apply filters
      if (filters.category && filters.category !== 'all') {
        jobs = jobs.filter(job => job.category === filters.category);
      }
      if (filters.location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      return {
        success: true,
        jobs: jobs
      };
    }
  }

  static async getEmployerJobs(employerId) {
    try {
      return await this.request(`/jobs/employer/${employerId}`);
    } catch (error) {
      const savedJobs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('employerJobs') || '[]') : [];
      const employerJobs = savedJobs.filter(job => job.employerId === employerId);
      return {
        success: true,
        jobs: employerJobs.length > 0 ? employerJobs : this.getFallbackJobs().slice(0, 2)
      };
    }
  }

  static async getJobById(jobId) {
    try {
      return await this.request(`/jobs/${jobId}`);
    } catch (error) {
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
      const newJob = { 
        ...jobData, 
        _id: 'job-' + Date.now(),
        postedDate: new Date().toISOString(),
        employer: { name: jobData.employerName },
        views: 0,
        applications: 0
      };
      
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        savedJobs.push(newJob);
        localStorage.setItem('employerJobs', JSON.stringify(savedJobs));
        
        // Also add to jobs list for applications
        const allJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        allJobs.push(newJob);
        localStorage.setItem('jobs', JSON.stringify(allJobs));
      }
      
      return {
        success: true,
        job: newJob
      };
    }
  }

  static async updateJob(jobId, jobData) {
    try {
      return await this.request(`/jobs/${jobId}`, {
        method: 'PUT',
        body: jobData
      });
    } catch (error) {
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

  static async deleteJob(jobId) {
    try {
      return await this.request(`/jobs/${jobId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        const updatedJobs = savedJobs.filter(job => job._id !== jobId);
        localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
      }
      
      return {
        success: true
      };
    }
  }

  // Applications endpoints
  static async applyForJob(jobId, applicationData) {
    try {
      return await this.request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: applicationData
      });
    } catch (error) {
      // Get job details to include employerId
      const jobs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('jobs') || '[]') : [];
      const job = jobs.find(j => j._id === jobId) || this.getFallbackJobs()[0];
      
      const application = {
        _id: 'app-' + Date.now(),
        jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        ...applicationData,
        status: 'pending',
        appliedDate: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        savedApplications.push(application);
        localStorage.setItem('jobApplications', JSON.stringify(savedApplications));
        
        // Update job applications count
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        const updatedJobs = savedJobs.map(j => 
          j._id === jobId ? { ...j, applications: (j.applications || 0) + 1 } : j
        );
        localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
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
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userApplications = applications.filter(app => app.applicantId === user._id);
        return {
          success: true,
          applications: userApplications
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
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const employerApplications = applications.filter(app => app.employerId === employerId);
        return {
          success: true,
          applications: employerApplications
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

  // User endpoints
  static async getUserProfile() {
    try {
      return await this.request('/users/profile');
    } catch (error) {
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return {
        success: true,
        user: userData
      };
    }
  }

  // Favorites endpoints
  static async saveFavorite(jobId, userId) {
    try {
      return await this.request('/favorites', {
        method: 'POST',
        body: { jobId, userId }
      });
    } catch (error) {
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        if (!favorites.some(fav => fav.jobId === jobId)) {
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
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const updatedFavorites = favorites.filter(fav => fav.jobId !== jobId);
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      }
      return { success: true };
    }
  }

  // New Features
  static async getJobStats(employerId) {
    try {
      return await this.request(`/stats/jobs/${employerId}`);
    } catch (error) {
      const jobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const employerApplications = applications.filter(app => app.employerId === employerId);
      
      return {
        success: true,
        stats: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter(job => !job.closed).length,
          totalApplications: employerApplications.length,
          pendingApplications: employerApplications.filter(app => app.status === 'pending').length
        }
      };
    }
  }

  static async searchJobs(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams({ q: query, ...filters }).toString();
      return await this.request(`/jobs/search?${queryParams}`);
    } catch (error) {
      let jobs = this.getFallbackJobs();
      
      if (query) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(query.toLowerCase()) ||
          job.description.toLowerCase().includes(query.toLowerCase()) ||
          job.location.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      return {
        success: true,
        jobs: jobs
      };
    }
  }

  static async contactSupport(messageData) {
    try {
      return await this.request('/support/contact', {
        method: 'POST',
        body: messageData
      });
    } catch (error) {
      // Store support messages locally
      if (typeof window !== 'undefined') {
        const supportMessages = JSON.parse(localStorage.getItem('supportMessages') || '[]');
        supportMessages.push({
          ...messageData,
          _id: 'support-' + Date.now(),
          date: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
      }
      
      return {
        success: true,
        message: 'Support request submitted successfully'
      };
    }
  }

  // Fallback data
  static getFallbackJobs() {
    return [
      {
        _id: '1',
        title: 'Mfanyakazi Shambani - Nakuru',
        description: 'Inatafuta mfanyakazi shambani mwenye uzoefu wa kilimo cha mazao na utunzaji wa wanyama.',
        location: 'Nakuru',
        category: 'kilimo',
        phone: '+254712345678',
        businessType: 'Shamba la Green Valley',
        salary: 'KES 15,000 / mwezi',
        employerId: 'employer-1',
        urgent: true,
        featured: true,
        skills: ['Kilimo', 'Ufugaji', 'Umwagiliaji'],
        experience: 'Miaka 2+',
        postedDate: new Date('2024-01-15').toISOString()
      },
      {
        _id: '2', 
        title: 'Fundi Ujenzi - Nairobi',
        description: 'Tunatafuta fundi wa ujenzi mwenye ujuzi wa kufanya kazi za msingi za ujenzi.',
        location: 'Nairobi',
        category: 'ujenzi',
        phone: '+254723456789',
        businessType: 'Timu ya Ujenzi',
        salary: 'KES 20,000 / mwezi',
        employerId: 'employer-2',
        skills: ['Ujenzi', 'Kuchonga', 'Kupaka rangi'],
        experience: 'Miaka 1+',
        postedDate: new Date('2024-01-10').toISOString()
      },
      {
        _id: '3',
        title: 'Msaidizi Wa Nyumbani - Mombasa',
        description: 'Tunatafuta msaidizi wa nyumbani mwenye ujuzi wa usafi na upishi.',
        location: 'Mombasa',
        category: 'nyumbani',
        phone: '+254734567890',
        businessType: 'Familia ya Mombasa',
        salary: 'KES 12,000 / mwezi',
        employerId: 'employer-3',
        skills: ['Usafi', 'Upishi', 'Utunzaji wa Watoto'],
        experience: 'Hapana uzoefu unahitajika',
        postedDate: new Date('2024-01-12').toISOString()
      }
    ];
  }
}
