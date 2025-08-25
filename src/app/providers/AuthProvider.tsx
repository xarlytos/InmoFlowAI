import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType } from '@/features/core/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('inmoflow-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // En producción, simular login sin MSW
      if (import.meta.env.PROD) {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const users = [
          {
            id: 'user-1',
            email: 'admin@inmoflow.com',
            name: 'Ana García',
            role: 'admin',
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
          },
          {
            id: 'user-2', 
            email: 'agent@inmoflow.com',
            name: 'Carlos Ruiz',
            role: 'agent',
            avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
          }
        ];
        
        const user = users.find(u => u.email === email);
        
        if (user && password === 'demo123') {
          setUser(user);
          localStorage.setItem('inmoflow-user', JSON.stringify(user));
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      // En desarrollo, usar MSW
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
      
      if (data.ok) {
        setUser(data.user);
        localStorage.setItem('inmoflow-user', JSON.stringify(data.user));
      } else {
        throw new Error(data.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inmoflow-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}