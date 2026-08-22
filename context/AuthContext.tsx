'use client';

import { createContext, useContext, useState, useEffect, ReactNode, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '@/lib/types';
import { getUser, setAuthData, clearAuth } from '@/lib/auth-helper';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        startTransition(() => {
            setUser(currentUser);
            setIsLoading(false);
        });
    }, []);

    const login = (data: AuthResponse) => {
        setAuthData(data);
        setUser(data.user);
        const rolePath = data.user.role.toLowerCase();
        router.push(`/dashboard/${rolePath}`);
    };

    const logout = () => {
        clearAuth();
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};