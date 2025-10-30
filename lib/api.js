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

// Simple utility functions that work on both client and server
export const AppUtils = {
  filterJobs: (jobs, filters) => {
    let filtered = [...jobs];
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.businessType?.toLowerCase().includes(query)
      );
    }
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(job => job.category === filters.category);
    }
    
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    return filtered;
  },

  calculateProfileCompleteness: (user) => {
    if (!user) return 0;
    const fields = ['name', 'phone', 'location'];
    const completed = fields.filter(field => user[field]?.trim());
    return Math.round((completed.length / fields.length) * 100);
  },

  exportData: (data, filename) => {
    // This will only work on client side
    if (typeof window === 'undefined') return;
    
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export class ApiService {
  static async request(endpoint, options = {}) {
    // Safe token access for SSR
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
      // Fallback for demo
      const userRole = phone.includes('254734567890') ? 'employer' : 'employee';
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + phone,
          name: userRole === 'employer' ? 'Employer User' : 'Employee User',
          phone: phone,
          location: 'Nairobi',
          role: userRole
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
      // Fallback for demo
      return {
        success: true,
        token: 'fallback-token-' + Date.now(),
        user: {
          _id: 'user-' + Date.now(),
          name: userData.name,
          phone: userData.phone,
          location: userData.location,
          role: userData.role
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
      // Fallback data
      return {
        success: true,
        jobs: [
          {
            _id: '1',
            title: 'Farm Worker Needed',
            description: 'Looking for experienced farm worker',
            location: 'Nakuru',
            category: 'kilimo',
            phone: '+254712345678',
            businessType: 'Green Valley Farm',
            salary: 'KES 15,000',
            employerId: 'employer-1'
          },
          {
            _id: '2',
            title: 'Construction Helper',
            description: 'Construction site helper needed',
            location: 'Nairobi',
            category: 'ujenzi', 
            phone: '+254723456789',
            businessType: 'Builders Co',
            salary: 'KES 18,000',
            employerId: 'employer-2'
          }
        ]
      };
    }
  }

  static async getEmployerJobs(employerId) {
    try {
      return await this.request(`/jobs/employer/${employerId}`);
    } catch (error) {
      // Fallback - get from localStorage if available
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        return {
          success: true,
          jobs: savedJobs.filter(job => job.employerId === employerId)
        };
      }
      return { success: true, jobs: [] };
    }
  }

  static async createJob(jobData) {
    try {
      return await this.request('/jobs', {
        method: 'POST',
        body: jobData
      });
    } catch (error) {
      // Fallback - store locally
      const newJob = {
        ...jobData,
        _id: 'job-' + Date.now(),
        postedDate: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        savedJobs.push(newJob);
        localStorage.setItem('employerJobs', JSON.stringify(savedJobs));
      }
      
      return { success: true, job: newJob };
    }
  }

  static async updateJob(jobId, jobData) {
    try {
      return await this.request(`/jobs/${jobId}`, {
        method: 'PUT',
        body: jobData
      });
    } catch (error) {
      // Fallback - update locally
      if (typeof window !== 'undefined') {
        const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        const updatedJobs = savedJobs.map(job => 
          job._id === jobId ? { ...job, ...jobData } : job
        );
        localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
      }
      return { success: true, job: { _id: jobId, ...jobData } };
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
      // Fallback - store locally
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
      
      return { success: true, application };
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
        return { success: true, applications: userApplications };
      }
      return { success: true, applications: [] };
    }
  }

  static async getEmployerApplications(employerId) {
    try {
      return await this.request(`/applications/employer/${employerId}`);
    } catch (error) {
      if (typeof window !== 'undefined') {
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const employerApplications = applications.filter(app => app.employerId === employerId);
        return { success: true, applications: employerApplications };
      }
      return { success: true, applications: [] };
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
      return { success: true, application: { _id: applicationId, status } };
    }
  }

  // User endpoints
  static async getUserProfile() {
    try {
      return await this.request('/users/profile');
    } catch (error) {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        return { success: true, user: userData ? JSON.parse(userData) : null };
      }
      return { success: true, user: null };
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
      return { success: true, user: userData };
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
}
