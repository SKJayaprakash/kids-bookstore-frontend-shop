import { useCart } from '../context/CartContext';
import {
    Container, Typography, Grid, Card, CardContent, Button, Box, IconButton, Divider, Stack
} from '@mui/material';
import { DeleteOutline, ShoppingBag, ArrowForward, Shield } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function CartPage() {
    const { items, removeFromCart, totalPrice } = useCart();

    if (items.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Box sx={{ width: 80, height: 80, bgcolor: 'grey.100', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                    <ShoppingBag sx={{ fontSize: 40, color: 'text.secondary' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Your cart is empty</Typography>
                <Typography color="text.secondary" paragraph>Looks like you haven't added any magical stories yet.</Typography>
                <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 2 }}>
                    Start Shopping
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShoppingBag color="primary" /> Shopping Cart
            </Typography>

            <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={2}>
                        {items.map((item) => (
                            <Card key={item.book.id} variant="outlined" sx={{ display: 'flex', p: 2 }}>
                                <Box sx={{ width: 80, height: 100, bgcolor: 'grey.100', borderRadius: 1, flexShrink: 0 }}>
                                    {item.book.imageUrl ? (
                                        <img src={item.book.imageUrl} alt={item.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Typography variant="caption" fontWeight="bold">{item.book.title.substring(0, 2)}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ ml: 2, flexGrow: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">{item.book.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.book.author}</Typography>
                                        </Box>
                                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.book.id)}>
                                            <DeleteOutline />
                                        </IconButton>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                                        <Typography fontWeight="bold">₹{item.book.price}</Typography>
                                        <Box sx={{ bgcolor: 'grey.100', px: 1, borderRadius: 1 }}>
                                            <Typography variant="caption" fontWeight="bold">Qty: {item.quantity}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Card>
                        ))}
                    </Stack>
                </Grid>

                {/* Summary */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ position: 'sticky', top: 100 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Order Summary</Typography>
                            <Stack spacing={2} sx={{ my: 3 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography color="text.secondary">Subtotal</Typography>
                                    <Typography fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography color="text.secondary">Shipping</Typography>
                                    <Typography color="success.main" fontWeight="bold">Free</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6">Total</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="primary">₹{totalPrice.toFixed(2)}</Typography>
                                </Stack>
                            </Stack>
                            <Button
                                component={RouterLink}
                                to="/checkout"
                                variant="contained"
                                fullWidth
                                size="large"
                                endIcon={<ArrowForward />}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                Checkout
                            </Button>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2, color: 'text.disabled' }}>
                                <Shield fontSize="small" />
                                <Typography variant="caption">Secure Checkout</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
