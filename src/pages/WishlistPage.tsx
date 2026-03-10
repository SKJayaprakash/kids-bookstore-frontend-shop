import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, IconButton, Box, CircularProgress, Alert } from '@mui/material';
import { Delete } from '@mui/icons-material';
import BookCard from '../components/BookCard';
import { getWishlist, removeFromWishlist } from '../services/api';
import type { Wishlist } from '../types';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await getWishlist();
            setWishlist(response.data);
        } catch (err) {
            setError('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookId: number) => {
        try {
            await removeFromWishlist(bookId);
            setWishlist(wishlist.filter(item => item.book.id !== bookId));
        } catch (err) {
            console.error('Failed to remove from wishlist', err);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                My Wishlist
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {wishlist.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">Your wishlist is empty.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {wishlist.map((item) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                            <Box sx={{ position: 'relative' }}>
                                <BookCard book={item.book} showWishlistButton={false} />
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white', color: 'error.main' }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item.book.id);
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
