export interface User {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
    ageGroup?: 'BABIES_TODDLERS' | 'PRESCHOOL' | 'EARLY_READERS' | 'MIDDLE_GRADE' | 'YOUNG_ADULT';
    additionalImages?: string[];
}

export interface Review {
    id: number;
    rating: number;
    comment: string;
    userName: string;
    bookId: number;
    createdAt: string;
}

export interface LoginResponse {
    token: string;
    name: string;
    email: string;
    role: string;
}

export interface Address {
    id?: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Wishlist {
    id: number;
    book: Book;
}
