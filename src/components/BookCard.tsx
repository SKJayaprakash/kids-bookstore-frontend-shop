import type { Book } from '../types';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardMedia, CardContent, Typography, Button, Box, IconButton, Chip, Stack } from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';

interface BookCardProps {
    book: Book;
    viewMode?: 'grid' | 'list';
    showWishlistButton?: boolean;
}

import { useNavigate } from 'react-router-dom';

import { addToWishlist } from '../services/api';

export default function BookCard({ book, viewMode = 'grid', showWishlistButton = true }: BookCardProps) {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Placeholder gradient for missing images
    const placeholderColors = ['#eef2ff', '#fff7ed', '#f0fdf4'];
    const placeholderColor = placeholderColors[book.id % 3];

    const handleCardClick = () => {
        navigate(`/product/${book.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(book);
        showNotification(`Added ${book.title} to cart`);
    };

    const handleAddToWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            showNotification('Please login to add to wishlist', 'error');
            navigate('/login');
            return;
        }
        try {
            await addToWishlist(book.id);
            showNotification(`Added ${book.title} to wishlist`);
        } catch (err: any) {
            console.error('Failed to add to wishlist', err);
            const errorMessage = err.response?.data?.message || 'Failed to add to wishlist';
            showNotification(errorMessage, 'error');
        }
    };

    if (viewMode === 'list') {
        return (
            <Card
                onClick={handleCardClick}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    mb: 2,
                    transition: '0.3s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateX(4px)', boxShadow: 6 },
                    height: { xs: 160, sm: 180 }
                }}
            >
                <Box sx={{ position: 'relative', width: { xs: 100, sm: 120 }, flexShrink: 0, bgcolor: placeholderColor }}>
                    {book.imageUrl ? (
                        <CardMedia
                            component="img"
                            image={book.imageUrl}
                            alt={book.title}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.3, fontWeight: 'bold' }}>
                                {book.title.substring(0, 2)}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Chip label={book.category} size="small" color="primary" variant="outlined" sx={{ mb: 1, height: 20, fontSize: '0.7rem' }} />
                                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}>
                                    {book.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {book.author}
                                </Typography>
                            </Box>
                            {showWishlistButton && (
                                <IconButton
                                    sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100', color: 'error.main' } }}
                                    size="small"
                                    onClick={handleAddToWishlist}
                                >
                                    <FavoriteBorder fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{book.price.toFixed(2)}
                        </Typography>
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<AddShoppingCart />}
                            onClick={handleAddToCart}
                            disableElevation
                            sx={{ px: 3 }}
                        >
                            Add to Cart
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: '0.3s',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}
        >
            <Box sx={{ position: 'relative', paddingTop: '150%', bgcolor: placeholderColor }}>
                {book.imageUrl ? (
                    <CardMedia
                        component="img"
                        image={book.imageUrl}
                        alt={book.title}
                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h3" color="text.secondary" sx={{ opacity: 0.3, fontWeight: 'bold' }}>
                            {book.title.substring(0, 2)}
                        </Typography>
                    </Box>
                )}
                {showWishlistButton && (
                    <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: 'white', color: 'error.main' } }}
                        size="small"
                        onClick={handleAddToWishlist}
                    >
                        <FavoriteBorder fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                <Chip label={book.category} size="small" color="primary" variant="outlined" sx={{ mb: 1, height: 20, fontSize: '0.7rem' }} />
                <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {book.author}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{book.price.toFixed(2)}
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddShoppingCart />}
                        onClick={handleAddToCart}
                        disableElevation
                    >
                        Add
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
