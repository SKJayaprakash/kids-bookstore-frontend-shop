import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Container, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import { ShoppingCart, Person, Search as SearchIcon, Menu as MenuIcon, Logout, FavoriteBorder } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

export default function Navbar() {
    const { items } = useCart();
    const { user, logout, isAuthenticated, shopName } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [categoryAnchorEl, setCategoryAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const categoryOpen = Boolean(categoryAnchorEl);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCategoryMenu = (event: React.MouseEvent<HTMLElement>) => {
        setCategoryAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo - Desktop */}
                    <Typography
                        variant="h5"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 800,
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontFamily: 'Nunito',
                        }}
                    >
                        KidsBooks
                    </Typography>

                    {/* Mobile Menu Icon */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton size="large" aria-label="menu" color="inherit">
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Logo - Mobile */}
                    <Typography
                        variant="h6"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontWeight: 800,
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        KidsBooks
                    </Typography>

                    {/* Desktop Menu Items */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button component={RouterLink} to="/" sx={{ my: 2, color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                            Home
                        </Button>
                        <Button
                            onClick={handleCategoryMenu}
                            sx={{ my: 2, color: 'text.secondary', display: 'block', fontWeight: 'bold' }}
                        >
                            Categories
                        </Button>
                        <Menu
                            anchorEl={categoryAnchorEl}
                            open={categoryOpen}
                            onClose={() => setCategoryAnchorEl(null)}
                            onClick={() => setCategoryAnchorEl(null)}
                        >
                            <MenuItem onClick={() => navigate('/')}>Adventure</MenuItem>
                            <MenuItem onClick={() => navigate('/')}>Fantasy</MenuItem>
                            <MenuItem onClick={() => navigate('/')}>Education</MenuItem>
                            <MenuItem onClick={() => navigate('/')}>Bestsellers</MenuItem>
                        </Menu>
                    </Box>

                    {/* Search */}
                    <Search sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary', bgcolor: 'grey.100 !important' }}>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </Search>

                    {/* Shop Info Display */}
                    {isAuthenticated && shopName && (
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2, mr: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                <strong>{shopName}</strong>
                            </Typography>
                        </Box>
                    )}

                    {/* Icons */}
                    <Box sx={{ flexGrow: 0, ml: 2, display: 'flex', alignItems: 'center' }}>
                        {isAuthenticated && (
                            <>
                                <IconButton component={RouterLink} to="/wishlist" size="large" color="inherit" sx={{ mr: 1 }}>
                                    <FavoriteBorder />
                                </IconButton>
                                <IconButton component={RouterLink} to="/cart" size="large" color="inherit" sx={{ mr: 1 }}>
                                    <Badge badgeContent={items.length} color="secondary">
                                        <ShoppingCart />
                                    </Badge>
                                </IconButton>
                            </>
                        )}

                        {isAuthenticated ? (
                            <>
                                <Tooltip title="Account settings">
                                    <IconButton
                                        onClick={handleMenu}
                                        size="small"
                                        sx={{ ml: 0 }}
                                        aria-controls={open ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? 'true' : undefined}
                                    >
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                            {user?.firstName?.charAt(0) || <Person />}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={() => navigate('/profile')}>
                                        My Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/wishlist')}>
                                        My Wishlist
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/orders')}>
                                        My Orders
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout fontSize="small" sx={{ mr: 1 }} />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button component={RouterLink} to="/login" variant="outlined" color="primary" size="small">
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
