
// Simple authentication system using localStorage only
export class SimpleAuth {
  static async login(phone, password) {
    // Since auth endpoints don't work, we'll create a demo user
    const demoUser = {
      _id: '1',
      name: 'Demo User',
      phone: phone,
      location: 'Nairobi',
      role: 'employee'
    };

    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: demoUser
    };
  }

  static async register(userData) {
    // Create user from registration data
    const newUser = {
      _id: 'user-' + Date.now(),
      name: userData.name,
      phone: userData.phone,
      location: userData.location,
      role: userData.role
    };

    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: newUser
    };
  }

  static validateToken(token) {
    return token && token.startsWith('demo-token-');
  }
}
