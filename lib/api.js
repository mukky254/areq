// Add these methods to your existing ApiService class

static async updateJob(jobId, jobData) {
  try {
    return await this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: jobData
    });
  } catch (error) {
    console.log('🔧 Using fallback job update');
    // Update in localStorage
    const savedJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    const updatedJobs = savedJobs.map(job => 
      job._id === jobId ? { ...job, ...jobData } : job
    );
    localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
    
    return {
      success: true,
      job: { _id: jobId, ...jobData }
    };
  }
}

static async saveFavorite(jobId, userId) {
  try {
    return await this.request('/favorites', {
      method: 'POST',
      body: { jobId, userId }
    });
  } catch (error) {
    console.log('🔧 Using fallback favorite save');
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    if (!favorites.some(fav => fav.jobId === jobId && fav.userId === userId)) {
      favorites.push({ jobId, userId, _id: 'fav-' + Date.now() });
      localStorage.setItem('userFavorites', JSON.stringify(favorites));
    }
    return { success: true };
  }
}

static async getFavorites(userId) {
  try {
    return await this.request(`/favorites/${userId}`);
  } catch (error) {
    console.log('🔧 Using fallback favorites');
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const userFavorites = favorites.filter(fav => fav.userId === userId);
    return { success: true, favorites: userFavorites };
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
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const updatedFavorites = favorites.filter(fav => 
      !(fav.jobId === jobId && fav.userId === userId)
    );
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
    return { success: true };
  }
}

// Translation function
static async translateText(text, targetLanguage) {
  try {
    // Using a free translation API (MyMemory)
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
