import type { Book, User } from '../types';

export const mockUser: User = {
    id: 999,
    name: "Demo User",
    email: "demo@kidshop.com",
    role: "CUSTOMER" as any // Bypassing strict UI checking for demo profile viewing
};

export const mockBooks: Book[] = [
    {
        id: 1,
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        description: "A boy discovers he's a wizard and journeys to a magical school.",
        price: 15.99,
        stock: 50,
        category: "Fantasy",
        imageUrl: "/books/harry-potter.jpg",
        ageGroup: "YOUNG_ADULT"
    },
    {
        id: 2,
        title: "Charlotte's Web",
        author: "E.B. White",
        description: "The classic story of a pig named Wilbur and his friend Charlotte the spider.",
        price: 8.99,
        stock: 25,
        category: "Classics",
        imageUrl: "/books/charlotte.jpg",
        ageGroup: "MIDDLE_GRADE"
    },
    {
        id: 3,
        title: "Where the Wild Things Are",
        author: "Maurice Sendak",
        description: "Max, a mischievous boy, is sent to bed without his supper and sails to an island where imagination rules.",
        price: 19.99,
        stock: 100,
        category: "Picture Books",
        imageUrl: "/books/where-wild.jpg",
        ageGroup: "PRESCHOOL"
    },
    {
        id: 4,
        title: "Peter Pan",
        author: "J.M. Barrie",
        description: "The adventures of a mischievous young boy who can fly and never grows up.",
        price: 12.50,
        stock: 40,
        category: "Fantasy",
        imageUrl: "/books/peter-pan.jpg",
        ageGroup: "MIDDLE_GRADE"
    }
];
