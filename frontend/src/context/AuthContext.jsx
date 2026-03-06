import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await authApi.getMe();
            if (res.success) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password, role) => {
        try {
            const res = await authApi.login(email, password, role);
            if (res.success) {
                setUser(res.data);
                return res;
            }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (ngoData) => {
        try {
            const res = await authApi.registerNgo(ngoData);
            if (res.success) {
                // We don't auto-login NGO because they need verification
                return res;
            }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const registerDonor = async (donorData) => {
        try {
            const res = await authApi.registerDonor(donorData);
            if (res.success) {
                // Auto-login happens in the onboarding component
                return res;
            }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const verifyPan = async (panCard, name) => {
        try {
            return await authApi.verifyPan(panCard, name);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'PAN Verification failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, registerDonor, verifyPan, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
