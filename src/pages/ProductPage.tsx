import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import type { Book, Review } from '../types';
import { getBookById, addToWishlist, getReviews, addReview, getBooks } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BookCard from '../components/BookCard';
import {
    Container, Grid, Typography, Button, Box, Paper, Rating,
    IconButton, Divider, Chip, Stack, CircularProgress, Breadcrumbs, Link,
    TextField, Avatar, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import {
    AddShoppingCart, FavoriteBorder, Remove, Add,
    LocalShipping, Security, Person, Send
} from '@mui/icons-material';

export default function ProductPage() {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (id) {
            setLoading(true);
            getBookById(Number(id))
                .then(res => {
                    setBook(res.data);
                    setSelectedImage(res.data.imageUrl);
                    // Fetch related books based on category
                    return getBooks(0, 4, res.data.category);
                })
                .then(res => {
                    if (res && res.data) {
                        setRelatedBooks(res.data.content.filter((b: Book) => b.id !== Number(id)));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));

            getReviews(Number(id))
                .then(res => setReviews(res.data))
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleAddToWishlist = async () => {
        if (!book) return;
        if (!isAuthenticated) {
            showNotification('Please login to add to wishlist', 'error');
            // navigate('/login'); // Optional: redirect to login
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

    const handleAddToCart = () => {
        if (!book) return;
        for (let i = 0; i < quantity; i++) {
            addToCart(book);
        }
        showNotification(`${book.title} added to cart!`);
    };

    const handleSubmitReview = async () => {
        if (!book || !newReview.comment) return;
        try {
            await addReview({ bookId: book.id, rating: newReview.rating, comment: newReview.comment });
            showNotification('Review submitted successfully');
            setNewReview({ rating: 5, comment: '' });
            // Refresh reviews
            const res = await getReviews(book.id);
            setReviews(res.data);
        } catch (err) {
            console.error('Failed to submit review', err);
            showNotification('Failed to submit review', 'error');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}><CircularProgress /></Box>;
    if (!book) return <Container><Typography variant="h5" sx={{ mt: 4 }}>Book not found</Typography></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">
                    Home
                </Link>
                <Typography color="text.primary">{book.title}</Typography>
            </Breadcrumbs>

            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', mb: 6 }}>
                <Grid container>
                    {/* Image Section */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ bgcolor: 'grey.50', p: 2 }}>
                        <Box sx={{ position: 'relative', aspectRatio: '3/4', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                            <img src={selectedImage || book.imageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            <IconButton
                                onClick={handleAddToWishlist}
                                sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'white', '&:hover': { bgcolor: 'white', color: 'error.main' } }}
                            >
                                <FavoriteBorder />
                            </IconButton>
                        </Box>
                        {/* Thumbnails / Look Inside */}
                        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', py: 1 }}>
                            {[book.imageUrl, ...(book.additionalImages || [])].filter((img): img is string => !!img).map((img, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    sx={{
                                        width: 60, height: 80, flexShrink: 0, cursor: 'pointer',
                                        border: selectedImage === img ? '2px solid primary.main' : '1px solid #ddd',
                                        borderRadius: 1, overflow: 'hidden'
                                    }}
                                >
                                    <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Content Section */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Chip label={book.category} color="primary" size="small" variant="outlined" />
                                <Chip label={book.ageGroup?.replace('_', ' ')} color="secondary" size="small" variant="outlined" />
                                <Rating value={4.5} precision={0.5} readOnly size="small" />
                                <Typography variant="caption" color="text.secondary">({reviews.length} reviews)</Typography>
                            </Stack>

                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                {book.title}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                by <span style={{ color: '#3f51b5' }}>{book.author}</span>
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                {book.description || "Dive into this amazing adventure! A perfect choice for young readers looking to explore new worlds."}
                            </Typography>

                            <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 4 }}>
                                <Typography variant="h3" fontWeight="bold" color="primary">
                                    ₹{book.price}
                                </Typography>
                            </Stack>

                            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                <Grid>
                                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                            <Remove />
                                        </IconButton>
                                        <Typography sx={{ px: 2, fontWeight: 'bold' }}>{quantity}</Typography>
                                        <IconButton onClick={() => setQuantity(quantity + 1)}>
                                            <Add />
                                        </IconButton>
                                    </Box>
                                </Grid>
                                <Grid size="grow">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={<AddShoppingCart />}
                                        sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart
                                    </Button>
                                </Grid>
                            </Grid>

                            <Stack direction="row" spacing={3} color="text.secondary">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <LocalShipping fontSize="small" />
                                    <Typography variant="caption">Free Shipping</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Security fontSize="small" />
                                    <Typography variant="caption">Secure Payment</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Related Products */}
            {relatedBooks.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>You might also like</Typography>
                    <Grid container spacing={3}>
                        {relatedBooks.map(related => (
                            <Grid key={related.id} size={{ xs: 12, sm: 6, md: 3 }}>
                                <BookCard book={related} viewMode="grid" />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Reviews Section */}
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>Customer Reviews</Typography>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Write a Review</Typography>
                            {isAuthenticated ? (
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography component="legend">Rating</Typography>
                                        <Rating
                                            value={newReview.rating}
                                            onChange={(_event, newValue) => {
                                                setNewReview(prev => ({ ...prev, rating: newValue || 5 }));
                                            }}
                                        />
                                    </Box>
                                    <TextField
                                        multiline
                                        rows={4}
                                        placeholder="Share your thoughts about this book..."
                                        fullWidth
                                        variant="outlined"
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                    />
                                    <Button
                                        variant="contained"
                                        endIcon={<Send />}
                                        onClick={handleSubmitReview}
                                        disabled={!newReview.comment}
                                    >
                                        Submit Review
                                    </Button>
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">
                                    Please <Link component={RouterLink} to="/login">login</Link> to write a review.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <List>
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <Paper key={review.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <Person />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="subtitle1" fontWeight="bold">{review.userName || 'Anonymous'}</Typography>
                                                        <Rating value={review.rating} size="small" readOnly />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.primary">
                                                            {review.comment}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </Paper>
                                ))
                            ) : (
                                <Typography color="text.secondary" fontStyle="italic">No reviews yet. Be the first to review!</Typography>
                            )}
                        </List>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
