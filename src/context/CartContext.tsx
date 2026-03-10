import React, { createContext, useContext, useState } from 'react';
import type { Book } from '../types';

interface CartItem {
    book: Book;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (book: Book) => void;
    removeFromCart: (bookId: number) => void;
    clearCart: () => void;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            import('../services/api').then(({ getCart }) => {
                getCart().then(res => {
                    const mappedItems = res.data.map((item: any) => ({
                        book: item.book,
                        quantity: item.quantity
                    }));
                    setItems(mappedItems);
                }).catch(err => console.error('Failed to fetch cart', err));
            });
        }
    }, []);

    const addToCart = async (book: Book) => {
        setItems(prev => {
            const existing = prev.find(item => item.book.id === book.id);
            if (existing) {
                return prev.map(item =>
                    item.book.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { book, quantity: 1 }];
        });

        const token = localStorage.getItem('token');
        if (token) {
            const { addToCart } = await import('../services/api');
            await addToCart(book.id);
        }
    };

    const removeFromCart = async (bookId: number) => {
        setItems(prev => prev.filter(item => item.book.id !== bookId));
        const token = localStorage.getItem('token');
        if (token) {
            const { removeFromCart } = await import('../services/api');
            await removeFromCart(bookId);
        }
    };

    const clearCart = async () => {
        setItems([]);
        const token = localStorage.getItem('token');
        if (token) {
            const { clearCart } = await import('../services/api');
            await clearCart();
        }
    };

    const totalPrice = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
