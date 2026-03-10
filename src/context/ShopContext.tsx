import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface Shop {
    id: number;
    shopNumber: string;
    slug: string;
    customDomain?: string;
    name: string;
    description: string;
    active: boolean;
}

interface ShopContextType {
    shop: Shop | null;
    isLoading: boolean;
    error: string | null;
    detectShop: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shop, setShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const detectShop = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Extract slug from URL path (e.g., /shop/johns-books/...)
            const pathParts = window.location.pathname.split('/');
            const shopIndex = pathParts.indexOf('shop');

            if (shopIndex !== -1 && pathParts[shopIndex + 1]) {
                const slug = pathParts[shopIndex + 1];

                // Fetch shop by slug
                const response = await api.get(`/shops/by-slug/${slug}`);
                setShop(response.data);
            } else {
                // Could also check for custom domain here
                // For now, if no slug in path, set error
                setError('Unable to detect shop from URL. Please use a valid shop URL.');
            }
        } catch (err: any) {
            console.error('Failed to detect shop:', err);
            setError(err.response?.data || 'Failed to load shop information');
            setShop(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        detectShop();
    }, [window.location.pathname]);

    return (
        <ShopContext.Provider value={{ shop, isLoading, error, detectShop }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
