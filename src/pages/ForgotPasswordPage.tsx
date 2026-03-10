import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Paper, Typography, TextField, Button, Box, Link, Stack, Alert
} from '@mui/material';
import { LockReset } from '@mui/icons-material';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Implement actual forgot password logic
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 60, height: 60, bgcolor: 'warning.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
                        <LockReset fontSize="large" />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Reset Password</Typography>

                    {!isSubmitted ? (
                        <>
                            <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Email Address"
                                        type="email"
                                        fullWidth
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={isLoading}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                    </Button>
                                </Stack>
                            </form>
                        </>
                    ) : (
                        <Box>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                If an account exists with that email, we've sent a password reset link.
                            </Alert>
                            <Button component={RouterLink} to="/login" variant="outlined" fullWidth>
                                Back to Login
                            </Button>
                        </Box>
                    )}

                    <Typography variant="body2" sx={{ mt: 4 }}>
                        Remember your password? <Link component={RouterLink} to="/login" fontWeight="bold">Sign In</Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
