import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  password: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ebook_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ebook_current_user', JSON.stringify(user));
      const loggedIn = JSON.parse(localStorage.getItem('ebook_logged_in_users') || '[]');
      if (!loggedIn.includes(user.id)) {
        localStorage.setItem('ebook_logged_in_users', JSON.stringify([...loggedIn, user.id]));
      }
    } else {
      localStorage.removeItem('ebook_current_user');
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('ebook_users') || '[]');
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const register = (email: string, password: string, name: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('ebook_users') || '[]');
    if (users.some((u) => u.email === email)) {
      return false;
    }
    const newUser: StoredUser = { id: Date.now().toString(), email, password, name };
    localStorage.setItem('ebook_users', JSON.stringify([...users, newUser]));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return true;
  };

  const logout = () => {
    if (user) {
      const loggedIn = JSON.parse(localStorage.getItem('ebook_logged_in_users') || '[]');
      localStorage.setItem('ebook_logged_in_users', JSON.stringify(loggedIn.filter((id: string) => id !== user.id)));
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
