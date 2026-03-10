import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getBooks = (page = 0, size = 10, category = '', sortBy = 'id', direction = 'asc', search = '', ageGroup = '') => {
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
    return api.get(`/reviews/book/${bookId}`);
};

export const addReview = (reviewData: { bookId: number; rating: number; comment: string }) => {
    return api.post('/reviews', reviewData);
};

export const getBookById = (id: number) => {
    return api.get(`/products/${id}`);
};

export const login = (credentials: any) => {
    return api.post('/auth/login', credentials);
};

export const googleLogin = (token: string) => {
    return api.post('/auth/google', { token });
};

export const register = (data: any) => {
    return api.post('/auth/register', data);
};

export const getOrders = () => {
    return api.get('/orders');
};

export const createOrder = (orderData: any) => {
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
    return api.get('/addresses');
};

export const addAddress = (address: any) => {
    return api.post('/addresses', address);
};

export const deleteAddress = (id: number) => {
    return api.delete(`/addresses/${id}`);
};

export const updateAddress = (id: number, address: any) => {
    return api.put(`/addresses/${id}`, address);
};

export const getWishlist = () => {
    return api.get('/wishlist');
};

export const addToWishlist = (bookId: number) => {
    return api.post(`/wishlist/add/${bookId}`);
};

export const removeFromWishlist = (bookId: number) => {
    return api.delete(`/wishlist/remove/${bookId}`);
};

export const getCart = () => {
    return api.get('/cart');
};

export const addToCart = (bookId: number, quantity: number = 1) => {
    return api.post(`/cart/add/${bookId}?quantity=${quantity}`);
};

export const removeFromCart = (bookId: number) => {
    return api.delete(`/cart/remove/${bookId}`);
};

export const clearCart = () => {
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
    return api.put('/user/profile', data);
};

export const getUserProfile = () => {
    return api.get('/user/profile');
};

export default api;
