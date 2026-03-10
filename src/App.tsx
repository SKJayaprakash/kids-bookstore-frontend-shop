import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ShopProvider } from './context/ShopContext';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <ShopProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen font-sans">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

                      {/* Shop-specific routes with slug */}
                      <Route path="/shop/:slug" element={<HomePage />} />
                      <Route path="/shop/:slug/product/:id" element={<ProductPage />} />
                      <Route path="/shop/:slug/cart" element={<CartPage />} />
                      <Route path="/shop/:slug/login" element={<LoginPage />} />
                      <Route path="/shop/:slug/register" element={<RegisterPage />} />
                      <Route path="/shop/:slug/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/shop/:slug/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/shop/:slug/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/shop/:slug/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </CartProvider>
          </ShopProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
