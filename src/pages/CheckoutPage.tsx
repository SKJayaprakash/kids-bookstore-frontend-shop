import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder, getAddresses, createPaymentOrder, verifyPayment } from '../services/api';
import {
    Container, Paper, Typography, Grid, TextField, Button, Box, Stepper, Step, StepLabel,
    Divider, Radio, RadioGroup, FormControlLabel, FormLabel, Stack
} from '@mui/material';
import { CheckCircle, LocalShipping, Payment } from '@mui/icons-material';

const steps = ['Shipping Address', 'Payment Details'];

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
    const [orderId, setOrderId] = useState<number | null>(null);

    useEffect(() => {
        getAddresses().then(res => {
            setSavedAddresses(res.data);
            if (res.data.length > 0) {
                // Do not auto-select, let user choose
            }
        }).catch(err => console.error(err));
    }, []);

    const handleSelectAddress = (id: number) => {
        setSelectedAddressId(id);
        if (id !== 0) {
            const selected = savedAddresses.find(a => a.id === id);
            if (selected) {
                setAddress({
                    street: selected.street,
                    city: selected.city,
                    state: selected.state,
                    zipCode: selected.zipCode,
                    country: selected.country
                });
            }
        } else {
            setAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
        }
    };

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            await placeOrder();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const placeOrder = async () => {
        setLoading(true);
        try {
            const orderItems = items.map(item => ({
                bookId: item.book.id,
                quantity: item.quantity
            }));

            // 1. Create Internal Order
            const orderRes = await createOrder({ items: orderItems, address });
            const internalOrderId = orderRes.data.id;

            // 2. Create Razorpay Order via Backend
            const paymentOrderRes = await createPaymentOrder(internalOrderId);
            const rzpOrder = paymentOrderRes.data;

            // 3. Open Razorpay Modal
            const options = {
                key: rzpOrder.keyId,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Kids Bookstore",
                description: `Order #${internalOrderId}`,
                image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
                order_id: rzpOrder.id,
                handler: async function (response: any) {
                    // 4. Verify Payment on Backend
                    const verifyRes = await verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        internal_order_id: internalOrderId
                    });

                    if (verifyRes.data.status === 'success') {
                        setOrderId(internalOrderId);
                        clearCart();
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366f1"
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            alert('Failed to process order or payment');
        } finally {
            setLoading(false);
        }
    };

    if (orderId) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>Order Placed Successfully!</Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Thank you for your purchase. Your order ID is <strong>#{orderId}</strong>.
                </Typography>
                <Typography color="text.secondary" paragraph>
                    You will receive an email confirmation shortly.
                </Typography>
                <Button variant="contained" href="/" sx={{ mt: 2 }}>
                    Return Home
                </Button>
            </Container>
        );
    }

    if (items.length === 0) {
        return <Container sx={{ py: 10, textAlign: 'center' }}><Typography variant="h5">Your cart is empty</Typography></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4 }}>
                Checkout
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        {activeStep === 0 && (
                            <Box component="form">
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <LocalShipping color="primary" /> Shipping Address
                                </Typography>

                                {savedAddresses.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <FormLabel component="legend">Select Saved Address</FormLabel>
                                        <RadioGroup
                                            value={selectedAddressId}
                                            onChange={(e) => handleSelectAddress(Number(e.target.value))}
                                        >
                                            {savedAddresses.map((addr) => (
                                                <FormControlLabel
                                                    key={addr.id}
                                                    value={addr.id}
                                                    control={<Radio />}
                                                    label={`${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`}
                                                />
                                            ))}
                                            <FormControlLabel value={0} control={<Radio />} label="Use a new address" />
                                        </RadioGroup>
                                    </Box>
                                )}

                                {(savedAddresses.length === 0 || selectedAddressId === 0) && (
                                    <Grid container spacing={3} sx={{ mt: 1 }}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label="Street Address" fullWidth required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="City" fullWidth required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="State / Province" fullWidth value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Zip / Postal Code" fullWidth required value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Country" fullWidth required value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        )}

                        {activeStep === 1 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" justifyContent="center" gap={1}>
                                    <Payment color="primary" /> Secure Payment
                                </Typography>
                                <Box sx={{ my: 4 }}>
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                                        alt="Razorpay" 
                                        style={{ height: 40, marginBottom: 16 }}
                                    />
                                    <Typography variant="body1" color="text.secondary">
                                        You will be redirected to Razorpay's secure payment gateway to complete your transaction.
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.muted' }}>
                                        Supports UPI, Cards, Netbanking, and Wallets.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            {!loading && activeStep !== 0 && (
                                <Button onClick={handleBack} sx={{ mr: 1 }}>
                                    Back
                                </Button>
                            )}
                            <Button variant="contained" onClick={handleNext} disabled={loading}>
                                {loading ? 'Processing...' : (activeStep === steps.length - 1 ? 'Pay Now' : 'Next')}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                        <Typography variant="h6" gutterBottom>Order Summary</Typography>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography color="text.secondary">Items ({items.reduce((a, c) => a + c.quantity, 0)})</Typography>
                            <Typography fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography color="text.secondary">Shipping</Typography>
                            <Typography color="success.main" fontWeight="bold">Free</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6" color="primary">Total</Typography>
                            <Typography variant="h6" fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
