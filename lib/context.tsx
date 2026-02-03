'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Project, User, AuditLog, Country, Policy, Announcement, Receipt, SealLevel, ProofPack 
} from './types';
import { 
  PROJECTS as INITIAL_PROJECTS, 
  USERS as INITIAL_USERS, 
  AUDIT_LOGS as INITIAL_LOGS, 
  COUNTRIES as INITIAL_COUNTRIES, 
  POLICIES as INITIAL_POLICIES, 
  ANNOUNCEMENTS as INITIAL_ANNOUNCEMENTS 
} from './store';
import { useRouter } from 'next/navigation';

interface PAMTRContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  auditLogs: AuditLog[];
  setAuditLogs: (logs: AuditLog[]) => void;
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  policies: Policy[];
  setPolicies: (policies: Policy[]) => void;
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  
  // Actions
  addAuditLog: (action: string, details: string) => void;
  updateProject: (project: Project) => void;
  addProject: (project: Project) => void;
  addCountry: (country: Country) => void;
  updateCountry: (country: Country) => void;
  deleteCountry: (code: string) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isInitialized: boolean;
}

const PAMTRContext = createContext<PAMTRContextType | undefined>(undefined);

export const PAMTRProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from store, but allow for updates
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Public User
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [countries, setCountries] = useState<Country[]>(INITIAL_COUNTRIES);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();

  // Load state from localStorage on mount
  useEffect(() => {
    // User
    const storedUser = localStorage.getItem('pamtr_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('pamtr_user');
      }
    }

    // Projects
    const storedProjects = localStorage.getItem('pamtr_projects');
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (e) { console.error("Failed to load projects", e); }
    }

    // Countries
    const storedCountries = localStorage.getItem('pamtr_countries');
    if (storedCountries) {
      try {
        setCountries(JSON.parse(storedCountries));
      } catch (e) { console.error("Failed to load countries", e); }
    }

    // Audit Logs
    const storedLogs = localStorage.getItem('pamtr_logs');
    if (storedLogs) {
      try {
        setAuditLogs(JSON.parse(storedLogs));
      } catch (e) { console.error("Failed to load logs", e); }
    }

    // Policies
    const storedPolicies = localStorage.getItem('pamtr_policies');
    if (storedPolicies) {
      try {
        setPolicies(JSON.parse(storedPolicies));
      } catch (e) { console.error("Failed to load policies", e); }
    }

    // Announcements
    const storedAnnouncements = localStorage.getItem('pamtr_announcements');
    if (storedAnnouncements) {
      try {
        setAnnouncements(JSON.parse(storedAnnouncements));
      } catch (e) { console.error("Failed to load announcements", e); }
    }

    setIsInitialized(true);
  }, []);

  // Save state to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pamtr_projects', JSON.stringify(projects));
    }
  }, [projects, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pamtr_countries', JSON.stringify(countries));
    }
  }, [countries, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pamtr_logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pamtr_policies', JSON.stringify(policies));
    }
  }, [policies, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pamtr_announcements', JSON.stringify(announcements));
    }
  }, [announcements, isInitialized]);


  // Helper actions
  const addAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const addProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const addCountry = (newCountry: Country) => {
    setCountries(prev => [newCountry, ...prev]);
  };

  const updateCountry = (updatedCountry: Country) => {
    setCountries(prev => prev.map(c => c.code === updatedCountry.code ? updatedCountry : c));
  };

  const deleteCountry = (code: string) => {
    setCountries(prev => prev.filter(c => c.code !== code));
  };

  const updateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const login = async (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('pamtr_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(INITIAL_USERS[0]); // Reset to Public User
    localStorage.removeItem('pamtr_user');
    router.push('/login');
  };

  return (
    <PAMTRContext.Provider value={{
      currentUser, setCurrentUser,
      projects, setProjects,
      users, setUsers,
      auditLogs, setAuditLogs,
      countries, setCountries,
      policies, setPolicies,
      announcements, setAnnouncements,
      addAuditLog,
      updateProject,
      addProject,
      addCountry,
      updateCountry,
      deleteCountry,
      updateAnnouncement,
      deleteAnnouncement,
      login,
      logout,
      isInitialized
    }}>
      {children}
    </PAMTRContext.Provider>
  );
};

export const usePAMTR = () => {
  const context = useContext(PAMTRContext);
  if (context === undefined) {
    throw new Error('usePAMTR must be used within a PAMTRProvider');
  }
  return context;
};
