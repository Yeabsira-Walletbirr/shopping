'use client';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { messaging, initializeMessaging } from '@/utils/firebase';

import { getToken, onMessage } from "firebase/messaging";
import API from '@/api';

interface User {
  id: number;
  fullName: string;
  username: string | null;
  email: string | null;
  phoneNumber: string;
  token: string;
  fcmToken: string,
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateProfile: (updatedData: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const api = API()
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()

  const requestPermission = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const permission = await Notification.requestPermission();

        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        if (permission === "granted") {
          await initializeMessaging(); // Ensure messaging is available

          if (messaging) {
            const token = await getToken(messaging, {
              vapidKey: "BM71MSQ3H6NRxuMvvPdtWPMtoz_allOynbIWDZeyikouwpmpAVdi29aRpyEYzIHP2KLRp0ttXi7EO3Cj08D-Lz0",
              serviceWorkerRegistration: swReg,
            });

            console.log("FCM Token:", token);
            const u = JSON.parse(storedUser);
            u['fcmToken'] = token;
            setUser(u);
            await api.put(`/dispatcher/updateFcm/${u?.id}`, { token });
          } else {
            console.warn("Firebase messaging not supported");
          }
        }
      }
    } catch (err) {
      console.error("Permission denied or error", err);
    }
  };


  // Load user from localStorage on first render
  useEffect(() => {
    requestPermission()
  }, []);

  const login = (userData: User) => {
    console.log(userData)
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/')

  };

  const updateProfile = (updatedData: User) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      setUser(updatedData)
      localStorage.setItem('user', JSON.stringify(updatedData));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
