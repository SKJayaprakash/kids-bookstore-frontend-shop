import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Paper, Typography, TextField, Button, Box, Link, Stack, Alert
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { register, googleLogin } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setIsLoading(true);
        try {
            const response = await googleLogin(credentialResponse.credential);
            if (response.data.token) {
                login(response.data.token, response.data);
                showNotification('Google sign-up/login successful!');
                navigate('/');
            }
        } catch (err: any) {
            console.error('Google login failed', err);
            const errorMessage = err.response?.data || 'Google login failed.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(formData);
            showNotification('Registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            console.error('Registration failed', err);
            const errorMessage = err.response?.data || 'Registration failed. Please try again.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 60, height: 60, bgcolor: 'secondary.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
                        <PersonAdd fontSize="large" />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Create Account</Typography>
                    <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>Join our community of book lovers</Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2}>
                                <TextField label="First Name" name="firstName" fullWidth required onChange={handleChange} />
                                <TextField label="Last Name" name="lastName" fullWidth required onChange={handleChange} />
                            </Stack>
                            <TextField label="Email Address" name="email" type="email" fullWidth required onChange={handleChange} />
                            <TextField label="Password" name="password" type="password" fullWidth required onChange={handleChange} />
                            <TextField label="Confirm Password" name="confirmPassword" type="password" fullWidth required onChange={handleChange} />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isLoading}
                                sx={{ py: 1.5, fontWeight: 'bold', mt: 1 }}
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
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
                            text="continue_with"
                        />
                    </Box>

                    <Typography variant="body2" sx={{ mt: 4 }}>
                        Already have an account? <Link component={RouterLink} to="/login" fontWeight="bold">Sign In</Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
