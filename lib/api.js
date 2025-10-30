// Utility functions for all features
export class AppUtils {
  // Feature 1: Advanced Search & Filtering
  static filterJobs(jobs, filters) {
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
  }

  // Feature 2: Smart Job Matching
  static getMatchingJobs(jobs, userSkills) {
    if (!userSkills) return jobs;
    
    const skills = userSkills.toLowerCase().split(',').map(s => s.trim());
    return jobs.filter(job => {
      if (!job.skills) return false;
      const jobSkills = job.skills.map(s => s.toLowerCase());
      return skills.some(userSkill => 
        jobSkills.some(jobSkill => jobSkill.includes(userSkill))
      );
    });
  }

  // Feature 3: Profile Completeness Calculator
  static calculateProfileCompleteness(user) {
    const fields = ['name', 'phone', 'location'];
    const completed = fields.filter(field => user?.[field]?.trim());
    return Math.round((completed.length / fields.length) * 100);
  }

  // Feature 4: Data Export
  static exportData(data, filename) {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Feature 5: Notification System
  static addNotification(message, type = 'info') {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = {
      id: 'notif-' + Date.now(),
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return notification;
  }

  static getNotifications() {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  static markAsRead(notificationId) {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    return updated;
  }

  // Feature 6: Recent Activities
  static getRecentActivities(applications, favorites, jobs, language) {
    const activities = [
      ...applications.map(app => ({
        type: 'application',
        message: language === 'en' 
          ? `Applied for ${app.jobTitle}` 
          : `Umeomba ${app.jobTitle}`,
        date: app.appliedDate,
        status: app.status
      })),
      ...favorites.map(fav => {
        const job = jobs.find(j => j._id === fav.jobId);
        return job ? {
          type: 'favorite',
          message: language === 'en' 
            ? `Saved ${job.title}` 
            : `Umehifadhi ${job.title}`,
          date: new Date().toISOString()
        } : null;
      }).filter(Boolean)
    ];
    
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }
}
