import Cookies from 'js-cookie';
import { User, AuthResponse } from './types';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const setAuthData = (data: AuthResponse) => {
    Cookies.set(TOKEN_KEY, data.accessToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set(REFRESH_TOKEN_KEY, data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set(USER_KEY, JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'strict' });
};

export const getAccessToken = (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
};

export const getRefreshToken = (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_KEY);
};

export const getUser = (): User | null => {
    const userStr = Cookies.get(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as User;
    } catch {
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!Cookies.get(TOKEN_KEY);
};

export const clearAuth = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(USER_KEY);
};