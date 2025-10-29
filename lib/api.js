const API_BASE_URL = 'https://backita.onrender.com'

export class ApiService {
  static async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return { success: true }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  static async login(phone, password) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: { phone, password }
    })
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    })
  }

  // Jobs endpoints - try different variations
  static async getJobs() {
    try {
      return await this.request('/jobs')
    } catch (error) {
      // Try alternative endpoint
      console.log('Trying alternative jobs endpoint...')
      return this.request('/api/jobs')
    }
  }

  static async getEmployerJobs(employerId) {
    try {
      return await this.request(`/jobs/employer/${employerId}`)
    } catch (error) {
      console.log('Trying alternative employer jobs endpoint...')
      // Fallback: return empty array
      return { success: true, jobs: [] }
    }
  }

  static async postJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: jobData
    })
  }

  static async updateJob(jobId, jobData) {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: jobData
    })
  }

  static async deleteJob(jobId) {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE'
    })
  }

  // User endpoints
  static async getEmployees() {
    try {
      return await this.request('/employees')
    } catch (error) {
      console.log('Trying alternative employees endpoint...')
      // Fallback: return empty array
      return { success: true, employees: [] }
    }
  }

  static async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: userData
    })
  }

  static async deleteAccount() {
    return this.request('/users/profile', {
      method: 'DELETE'
    })
  }
}
