import { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Box, Snackbar, Alert,
    MenuItem, InputAdornment, Tabs, Tab, Avatar, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, PhotoCamera, LibraryBooks, Favorite, ShoppingCart, Receipt } from '@mui/icons-material';
import { getBooks, deleteBook, createBook, updateBook, getAllWishlists, getAllCarts, getAllOrders } from '../services/api';
import type { Book } from '../types';

export default function AdminPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [tabValue, setTabValue] = useState(0);
    const [wishlists, setWishlists] = useState<any[]>([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [carts, setCarts] = useState<any[]>([]);
    const [cartsLoading, setCartsLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        stock: '',
        category: ''
    });
    const [image, setImage] = useState<File | null>(null);

    const fetchBooks = async () => {
        try {
            // Fetching a larger page size to see more items, or implement pagination later
            const response = await getBooks(0, 100);
            setBooks(response.data.content || []);
        } catch (error) {
            console.error("Failed to fetch books", error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchWishlists = async () => {
        setWishlistLoading(true);
        try {
            const response = await getAllWishlists();
            setWishlists(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlists", error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const fetchCarts = async () => {
        setCartsLoading(true);
        try {
            const response = await getAllCarts();
            setCarts(response.data);
        } catch (error) {
            console.error("Failed to fetch carts", error);
        } finally {
            setCartsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await getAllOrders();
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if (newValue === 1) {
            fetchOrders();
        } else if (newValue === 2) {
            fetchWishlists();
        } else if (newValue === 3) {
            fetchCarts();
        }
    };

    const handleOpen = (book?: Book) => {
        if (book) {
            setEditMode(true);
            setSelectedBookId(book.id);
            setFormData({
                title: book.title,
                author: book.author,
                description: book.description,
                price: book.price.toString(),
                stock: book.stock ? book.stock.toString() : '0',
                category: book.category
            });
        } else {
            setEditMode(false);
            setSelectedBookId(null);
            setFormData({ title: '', author: '', description: '', price: '', stock: '', category: '' });
        }
        setImage(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImage(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (image) data.append('image', image);

        try {
            if (editMode && selectedBookId) {
                await updateBook(selectedBookId, data);
                setSnackbar({ open: true, message: 'Book updated successfully', severity: 'success' });
            } else {
                await createBook(data);
                setSnackbar({ open: true, message: 'Book created successfully', severity: 'success' });
            }
            fetchBooks();
            handleClose();
        } catch (error) {
            setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await deleteBook(id);
                setSnackbar({ open: true, message: 'Book deleted', severity: 'success' });
                fetchBooks();
            } catch (error) {
                setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
            }
        }
    };

    const categories = ['Fiction', 'Adventure', 'Sci-Fi', 'Fantasy', 'Mystery', 'History', 'Science'];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Admin Dashboard
                </Typography>
                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpen()}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        Add Book
                    </Button>
                )}
            </Box>

            <Paper sx={{ mb: 4, borderRadius: 2 }} elevation={0} variant="outlined">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': { py: 2, fontWeight: 'bold' }
                    }}
                >
                    <Tab icon={<LibraryBooks />} iconPosition="start" label="Manage Books" />
                    <Tab icon={<Receipt />} iconPosition="start" label="User Orders" />
                    <Tab icon={<Favorite />} iconPosition="start" label="User Wishlists" />
                    <Tab icon={<ShoppingCart />} iconPosition="start" label="User Carts" />
                </Tabs>
            </Paper>

            {tabValue === 0 && (
                <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {books.map((book) => (
                                <TableRow key={book.id} hover>
                                    <TableCell>
                                        <Box
                                            component="img"
                                            src={book.imageUrl || 'https://via.placeholder.com/50'}
                                            sx={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{book.title}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontSize: '0.75rem' }}>
                                            {book.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>₹{book.price}</TableCell>
                                    <TableCell>{book.stock || 0}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => handleOpen(book)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(book.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {tabValue === 1 && (
                <Box>
                    {ordersLoading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : orders.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant="outlined">
                            <Typography color="text.secondary">No orders found.</Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Order info</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">#{order.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.9rem' }}>
                                                        {order.userEmail ? order.userEmail[0].toUpperCase() : 'U'}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {order.userEmail || 'Unknown User'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {order.items?.length || 0} items
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">₹{order.totalPrice}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ bgcolor: order.status === 'COMPLETED' ? 'success.light' : 'warning.light', color: 'white', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontSize: '0.75rem' }}>
                                                    {order.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {tabValue === 2 && (
                <Box>
                    {wishlistLoading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : wishlists.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant="outlined">
                            <Typography color="text.secondary">No wishlists found.</Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>User Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Book Info</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Added On</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {wishlists.map((wish) => (
                                        <TableRow key={wish.id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.9rem' }}>
                                                        {wish.userEmail ? wish.userEmail[0].toUpperCase() : 'U'}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {wish.userEmail || 'Unknown User'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box
                                                        component="img"
                                                        src={wish.book?.imageUrl || 'https://via.placeholder.com/50'}
                                                        sx={{ width: 30, height: 45, objectFit: 'cover', borderRadius: 0.5 }}
                                                    />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{wish.book?.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{wish.book?.author}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    N/A
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {tabValue === 3 && (
                <Box>
                    {cartsLoading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : carts.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant="outlined">
                            <Typography color="text.secondary">No active carts found.</Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>User Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Book Info</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {carts.map((cart) => (
                                        <TableRow key={cart.id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', fontSize: '0.9rem' }}>
                                                        {cart.userEmail ? cart.userEmail[0].toUpperCase() : (cart.user?.email ? cart.user.email[0].toUpperCase() : 'U')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {cart.userEmail || cart.user?.email || 'Unknown User'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box
                                                        component="img"
                                                        src={cart.book?.imageUrl || 'https://via.placeholder.com/50'}
                                                        sx={{ width: 30, height: 45, objectFit: 'cover', borderRadius: 0.5 }}
                                                    />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{cart.book?.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{cart.book?.author}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {cart.quantity}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                <DialogContent dividers>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Title"
                            name="title"
                            fullWidth
                            value={formData.title}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Author"
                            name="author"
                            fullWidth
                            value={formData.author}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Category"
                            name="category"
                            select
                            fullWidth
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {categories.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Price"
                                name="price"
                                type="number"
                                fullWidth
                                value={formData.price}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Stock"
                                name="stock"
                                type="number"
                                fullWidth
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </Box>
                        <TextField
                            label="Description"
                            name="description"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera />}
                            sx={{ alignSelf: 'start' }}
                        >
                            {image ? image.name : 'Upload Cover Image'}
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disableElevation>
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
