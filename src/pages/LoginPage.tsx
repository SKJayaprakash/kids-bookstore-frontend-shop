import { useState } from 'react';
import { login as apiLogin, googleLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GoogleLogin } from '@react-oauth/google';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, TextField, Button, Box, Link, Stack, Alert
} from '@mui/material';
import { Book } from '@mui/icons-material';

export default function LoginPage() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setIsLoading(true);
        try {
            const response = await googleLogin(credentialResponse.credential);
            if (response.data.token) {
                login(response.data.token, response.data);
                showNotification('Google sign-in successful!');
                navigate('/');
            }
        } catch (err: any) {
            console.error('Google login failed', err);
            setError(err.response?.data || 'Google login failed.');
            showNotification(err.response?.data || 'Google login failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiLogin(credentials);
            if (response.data.token) {
                login(response.data.token, response.data);
                navigate('/');
            }
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 60, height: 60, bgcolor: 'primary.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
                        <Book fontSize="large" />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Welcome Back!</Typography>
                    <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>Sign in to continue your magical journey</Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Email Address"
                                name="email"
                                type="email"
                                fullWidth
                                variant="outlined"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">Forgot Password?</Link>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isLoading}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Stack>
                    </form>

                    <Box sx={{ my: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">OR</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google login failed. Please try again.')}
                            theme="outline"
                            text="signin_with"
                        />
                    </Box>

                    <Typography variant="body2" sx={{ mt: 4 }}>
                        Don't have an account? <Link component={RouterLink} to="/register" fontWeight="bold">Create one</Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
