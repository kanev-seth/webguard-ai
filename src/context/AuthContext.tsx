import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'contributor' | 'analyst' | 'manager';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (role: UserRole, username?: string, password?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('webguard_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (role: UserRole, username?: string, password?: string) => {
        return new Promise<void>(async (resolve, reject) => {
            setIsLoading(true);
            try {
                // If username/password provided (real login), verify with backend
                if (username && password) {
                    const response = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: username, password })
                    });

                    if (!response.ok) {
                        throw new Error('Login failed');
                    }

                    const data = await response.json();

                    // Map backend role to frontend role
                    let mappedRole: UserRole = 'contributor';
                    if (data.role === 'Security Analyst') mappedRole = 'analyst';
                    if (data.role === 'Security Manager') mappedRole = 'manager';

                    const newUser: User = {
                        id: data.user_id,
                        name: data.name,
                        role: mappedRole
                    };
                    setUser(newUser);
                    localStorage.setItem('webguard_user', JSON.stringify(newUser));
                } else {
                    // Fallback for hardcoded simulation (if needed, though we should prefer real auth now)
                    const newUser: User = {
                        id: crypto.randomUUID(),
                        name: role.charAt(0).toUpperCase() + role.slice(1),
                        role
                    };
                    setUser(newUser);
                    localStorage.setItem('webguard_user', JSON.stringify(newUser));
                }
                resolve();
            } catch (error) {
                console.error("Login error:", error);
                reject(error);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('webguard_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
