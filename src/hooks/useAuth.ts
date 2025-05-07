import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session from localStorage
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`, // Generate a unique ID
      email
    };
    localStorage.setItem('current_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout
  };
} 