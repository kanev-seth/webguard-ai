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
    login: (role: UserRole) => Promise<void>;
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

    const login = async (role: UserRole) => {
        return new Promise<void>((resolve) => {
            setIsLoading(true);
            setTimeout(() => {
                const newUser: User = {
                    id: crypto.randomUUID(),
                    name: role.charAt(0).toUpperCase() + role.slice(1),
                    role
                };
                setUser(newUser);
                localStorage.setItem('webguard_user', JSON.stringify(newUser));
                setIsLoading(false);
                resolve();
            }, 1000); // Cinematic delay
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
