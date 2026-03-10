import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import {
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Collapse, Box
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, History } from '@mui/icons-material';

interface Order {
    id: number;
    createdAt: string;
    totalPrice: number;
    status: string;
    items: {
        id: number;
        book: {
            title: string;
        };
        quantity: number;
        price: number;
    }[];
}

function Row({ order }: { order: Order }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">#{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                    <Chip
                        label={order.status}
                        color={order.status === 'COMPLETED' ? 'success' : 'warning'}
                        size="small"
                    />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{order.totalPrice.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '0.9rem' }}>
                                Order Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Book Title</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Total Price (₹)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell component="th" scope="row">{item.book?.title || 'Unknown Title'}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell align="right">{item.price}</TableCell>
                                                <TableCell align="right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No items found in this order.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Mock data if API fails or is empty for dev
        getOrders()
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error(err);
                // Fallback mock
                setOrders([
                    {
                        id: 101,
                        createdAt: '2023-10-25',
                        totalPrice: 45.50,
                        status: 'COMPLETED',
                        items: [
                            { id: 1, book: { title: 'Harry Potter' }, quantity: 1, price: 20.50 },
                            { id: 2, book: { title: 'The Hobbit' }, quantity: 1, price: 25.00 }
                        ]
                    },
                    {
                        id: 102,
                        createdAt: '2023-11-02',
                        totalPrice: 12.99,
                        status: 'PENDING',
                        items: [
                            { id: 3, book: { title: 'Green Eggs and Ham' }, quantity: 1, price: 12.99 }
                        ]
                    }
                ]);
            });
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <History color="primary" fontSize="large" /> Order History
            </Typography>

            <TableContainer component={Paper} variant="outlined">
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell />
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <Row key={order.id} order={order} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
