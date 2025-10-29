const API_BASE_URL = 'https://backita.onrender.com';

// Utility function - make sure it's exported
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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

  static async getJobById(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  static async createJob(jobData) {
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
  static async getUsers() {
    return this.request('/users');
  }

  static async getUserProfile() {
    return this.request('/users/profile');
  }

  static async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: userData
    });
  }

  // Applications endpoints
  static async applyForJob(jobId, applicationData) {
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: applicationData
    });
  }

  static async getMyApplications() {
    return this.request('/applications/my');
  }
}
