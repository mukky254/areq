const loadInitialData = async () => {
  setLoading(true);
  try {
    console.log('🚀 Loading initial data...');
    
    // Test which endpoints work
    await ApiService.discoverEndpoints();

    const [jobsResponse, employeesResponse] = await Promise.allSettled([
      ApiService.getJobs(),
      ApiService.getEmployees()
    ]);

    // Handle jobs response
    if (jobsResponse.status === 'fulfilled' && jobsResponse.value.success) {
      dispatch({ type: 'SET_JOBS', payload: jobsResponse.value.jobs || [] });
      console.log('✅ Jobs loaded:', jobsResponse.value.jobs?.length || 0);
    } else {
      console.log('⚠️ Using fallback jobs data');
      dispatch({ type: 'SET_JOBS', payload: ApiService.getFallbackJobs() });
    }

    // Handle employees response  
    if (employeesResponse.status === 'fulfilled' && employeesResponse.value.success) {
      dispatch({ type: 'SET_EMPLOYEES', payload: employeesResponse.value.employees || [] });
      console.log('✅ Employees loaded:', employeesResponse.value.employees?.length || 0);
    } else {
      console.log('⚠️ Using fallback employees data');
      dispatch({ type: 'SET_EMPLOYEES', payload: ApiService.getFallbackEmployees() });
    }

    // Load user jobs if employer
    if (userRole === 'employer' && user?._id) {
      try {
        const userJobsResponse = await ApiService.getEmployerJobs(user._id);
        if (userJobsResponse.success) {
          dispatch({ type: 'SET_USER_JOBS', payload: userJobsResponse.jobs || [] });
        }
      } catch (error) {
        console.log('User jobs endpoint not available');
      }
    }

    // Load favorites
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favoriteJobs');
      if (storedFavorites) {
        try {
          dispatch({ type: 'SET_FAVORITES', payload: JSON.parse(storedFavorites) });
        } catch (error) {
          console.error('Error parsing favorites:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
  } finally {
    setLoading(false);
  }
}
