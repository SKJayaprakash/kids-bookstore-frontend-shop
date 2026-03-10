import axios from 'axios';
import { mockBooks, mockUser } from '../mocks/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Required for domain-based multi-tenant shop identification
    const host = window.location.hostname;
    if (host === 'localhost') {
        config.headers['X-Shop-Domain'] = 'shop1.localhost'; // Default for local dev without subdomains
    } else {
        config.headers['X-Shop-Domain'] = host;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!isDemoMode && error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Demo Mode Helper for simulated network delay
const simulateNetwork = <T>(data: T): Promise<{ data: T }> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data }), 300);
    });
};

export const getBooks = (page = 0, size = 10, category = '', sortBy = 'id', direction = 'asc', search = '', ageGroup = '') => {
    if (isDemoMode) {
        let filtered = [...mockBooks];
        if (category) filtered = filtered.filter(b => b.category === category);
        if (ageGroup) filtered = filtered.filter(b => b.ageGroup === ageGroup);
        if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

        return simulateNetwork({
            content: filtered.slice(page * size, (page + 1) * size),
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
            size: size,
            number: page
        });
    }

    let url = `/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    if (category) {
        url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    if (ageGroup) {
        url += `&ageGroup=${encodeURIComponent(ageGroup)}`;
    }
    return api.get(url);
};

export const getReviews = (bookId: number) => {
    if (isDemoMode) return simulateNetwork([]);
    return api.get(`/reviews/book/${bookId}`);
};

export const addReview = (reviewData: { bookId: number; rating: number; comment: string }) => {
    if (isDemoMode) return simulateNetwork({ id: Date.now(), ...reviewData });
    return api.post('/reviews', reviewData);
};

export const getBookById = (id: number) => {
    if (isDemoMode) {
        const book = mockBooks.find(b => b.id == id);
        return book ? simulateNetwork(book) : Promise.reject(new Error("Book not found"));
    }
    return api.get(`/products/${id}`);
};

export const login = (credentials: any) => {
    if (isDemoMode) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return simulateNetwork({ token: 'demo-token', user: mockUser });
    }
    return api.post('/auth/login', credentials);
};

export const googleLogin = (token: string) => {
    if (isDemoMode) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return simulateNetwork({ token: 'demo-token', user: mockUser });
    }
    return api.post('/auth/google', { token });
};

export const register = (data: any) => {
    if (isDemoMode) return simulateNetwork({ message: "Registered successfully" });
    return api.post('/auth/register', data);
};

export const getOrders = () => {
    if (isDemoMode) return simulateNetwork([]);
    return api.get('/orders');
};

export const createOrder = (orderData: any) => {
    if (isDemoMode) return simulateNetwork({ id: Date.now(), status: "PENDING", ...orderData });
    return api.post('/orders', orderData);
};

export const deleteBook = (id: number) => {
    return api.delete(`/products/${id}`);
};

export const createBook = (formData: FormData) => {
    return api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const updateBook = (id: number, formData: FormData) => {
    return api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getAddresses = () => {
    if (isDemoMode) return simulateNetwork([]);
    return api.get('/addresses');
};

export const addAddress = (address: any) => {
    if (isDemoMode) return simulateNetwork({ id: Date.now(), ...address });
    return api.post('/addresses', address);
};

export const deleteAddress = (id: number) => {
    if (isDemoMode) return simulateNetwork({ message: "Deleted" });
    return api.delete(`/addresses/${id}`);
};

export const updateAddress = (id: number, address: any) => {
    if (isDemoMode) return simulateNetwork({ id, ...address });
    return api.put(`/addresses/${id}`, address);
};

export const getWishlist = () => {
    if (isDemoMode) return simulateNetwork({ items: [] });
    return api.get('/wishlist');
};

export const addToWishlist = (bookId: number) => {
    if (isDemoMode) return simulateNetwork({ message: "Added" });
    return api.post(`/wishlist/add/${bookId}`);
};

export const removeFromWishlist = (bookId: number) => {
    if (isDemoMode) return simulateNetwork({ message: "Removed" });
    return api.delete(`/wishlist/remove/${bookId}`);
};

let demoCart: any[] = [];

export const getCart = () => {
    if (isDemoMode) return simulateNetwork({ id: 1, items: demoCart, totalAmount: demoCart.reduce((sum, item) => sum + item.price, 0) });
    return api.get('/cart');
};

export const addToCart = (bookId: number, quantity: number = 1) => {
    if (isDemoMode) {
        const book = mockBooks.find(b => b.id == bookId);
        if (book) {
            const existing = demoCart.find(i => i.book.id == bookId);
            if (existing) {
                existing.quantity += quantity;
                existing.price = existing.quantity * book.price;
            } else {
                demoCart.push({ id: Date.now(), book, quantity, price: book.price * quantity });
            }
        }
        return simulateNetwork({ message: "Added" });
    }
    return api.post(`/cart/add/${bookId}?quantity=${quantity}`);
};

export const removeFromCart = (bookId: number) => {
    if (isDemoMode) {
        demoCart = demoCart.filter(i => i.book.id != bookId);
        return simulateNetwork({ message: "Removed" });
    }
    return api.delete(`/cart/remove/${bookId}`);
};

export const clearCart = () => {
    if (isDemoMode) {
        demoCart = [];
        return simulateNetwork({ message: "Cleared" });
    }
    return api.delete('/cart/clear');
};

export const getAllCarts = () => {
    return api.get('/cart/all');
};

export const getAllWishlists = () => {
    return api.get('/wishlist/all');
};

export const getAllOrders = () => {
    return api.get('/orders/all');
};

export const updateProfile = (data: any) => {
    if (isDemoMode) return simulateNetwork(mockUser);
    return api.put('/user/profile', data);
};

export const getUserProfile = () => {
    if (isDemoMode) return simulateNetwork(mockUser);
    return api.get('/user/profile');
};

export default api;
