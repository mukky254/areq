// In the applyForJob method, update the fallback:
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
      // Get existing applications
      const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      
      // Add employerId to application for filtering
      const job = JSON.parse(localStorage.getItem('jobs') || '[]').find(j => j._id === jobId);
      if (job) {
        application.employerId = job.employerId;
        application.jobTitle = job.title;
      }
      
      savedApplications.push(application);
      localStorage.setItem('jobApplications', JSON.stringify(savedApplications));
    }
    
    return {
      success: true,
      application
    };
  }
}

// Update getEmployerApplications to properly filter
static async getEmployerApplications(employerId) {
  try {
    return await this.request(`/applications/employer/${employerId}`);
  } catch (error) {
    console.log('🔧 Using fallback employer applications');
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
