
const API_BASE_URL = 'https://backita.onrender.com';

export class SimpleApi {
  static async getJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, jobs: data.jobs || [] };
      }
    } catch (error) {
      console.log('Jobs API failed, using fallback');
    }
    
    // Fallback data
    return {
      success: true,
      jobs: [
        {
          _id: '1',
          title: 'Farm Worker - Nakuru',
          description: 'Experienced farm worker needed for crop cultivation and animal care',
          location: 'Nakuru',
          category: 'agriculture',
          phone: '+254712345678',
          businessType: 'Green Valley Farm',
          salary: '15,000 KES/month',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Construction Helper - Nairobi',
          description: 'Construction site helper needed for building projects',
          location: 'Nairobi',
          category: 'construction',
          phone: '+254723456789',
          businessType: 'Build It Ltd',
          salary: '20,000 KES/month',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Domestic Worker - Mombasa',
          description: 'House help needed for cleaning and cooking',
          location: 'Mombasa',
          category: 'domestic',
          phone: '+254734567890',
          businessType: 'Family Home',
          salary: '12,000 KES/month',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  static async getEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, employees: data.employees || [] };
      }
    } catch (error) {
      console.log('Employees API failed, using fallback');
    }
    
    // Fallback data
    return {
      success: true,
      employees: [
        {
          _id: '1',
          name: 'John Kamau',
          phone: '+254712345678',
          location: 'Nairobi',
          specialization: 'Farm Worker',
          experience: '3 years'
        },
        {
          _id: '2',
          name: 'Mary Wanjiku',
          phone: '+254723456789',
          location: 'Nakuru',
          specialization: 'Domestic Worker',
          experience: '4 years'
        }
      ]
    };
  }
}
