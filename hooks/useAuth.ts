

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { User, Role, SchoolInfo } from '../types';

const USERS_DB_KEY = 'insight_ed_users_db';
const SESSION_KEY = 'insight_ed_session';
const SCHOOL_INFO_KEY = 'insight_ed_school_info';

interface AuthContextType {
    currentUser: User | null;
    users: User[];
    isAuthReady: boolean;
    schoolInfo: SchoolInfo | null;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    register: (name: string, email: string, password: string, role: Role, assignedClasses?: { classKey: string; subjects: string[] }[]) => Promise<User | null>;
    setupSchool: (info: SchoolInfo) => void;
    clearAllData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (sessionData) setCurrentUser(JSON.parse(sessionData));

            const usersData = localStorage.getItem(USERS_DB_KEY);
            if (usersData) setUsers(JSON.parse(usersData));

            const schoolInfoData = localStorage.getItem(SCHOOL_INFO_KEY);
            if(schoolInfoData) setSchoolInfo(JSON.parse(schoolInfoData));

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        } finally {
            setIsAuthReady(true);
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User | null> => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            setCurrentUser(user);
            return user;
        }
        return null;
    }, [users]);

    const register = useCallback(async (name: string, email: string, password: string, role: Role, assignedClasses?: { classKey: string; subjects: string[] }[]): Promise<User | null> => {
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            password, // Again, should be hashed
            role,
        };
        
        if (role === 'teacher' && assignedClasses) {
            newUser.assignedClasses = assignedClasses;
        }

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
        return newUser;
    }, [users]);

    const setupSchool = useCallback((info: SchoolInfo) => {
        localStorage.setItem(SCHOOL_INFO_KEY, JSON.stringify(info));
        setSchoolInfo(info);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
    }, []);
    
    const clearAllData = useCallback(() => {
        localStorage.removeItem(USERS_DB_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SCHOOL_INFO_KEY);
        window.location.reload();
    }, []);

    const value = useMemo(() => ({ 
        currentUser, 
        users,
        isAuthReady,
        schoolInfo,
        login, 
        logout, 
        register,
        setupSchool,
        clearAllData
    }), [currentUser, users, isAuthReady, schoolInfo, login, logout, register, setupSchool, clearAllData]);

    return React.createElement(AuthContext.Provider, { value: value }, children);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};