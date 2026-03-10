import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Tabs, Tab, TextField, Button, Grid,
    Card, CardContent, CardActions, IconButton, Alert, CircularProgress
} from '@mui/material';
import { Delete, Add, LocationOn, Person, CheckCircle, Error, Edit, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAddresses, addAddress, deleteAddress, updateProfile, getUserProfile, updateAddress } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import type { Address } from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { showNotification } = useNotification();

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', emailVerified: false, phoneVerified: false
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', zipCode: '', country: ''
    });

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await getAddresses();
            setAddresses(response.data);
        } catch (err) {
            setError('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await getUserProfile();
            setProfileData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (tabValue === 1) {
            fetchAddresses();
        }
    }, [tabValue]);

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                const response = await updateAddress(editingAddressId, newAddress);
                setAddresses(addresses.map(addr => addr.id === editingAddressId ? response.data : addr));
                showNotification('Address updated successfully');
            } else {
                const response = await addAddress(newAddress);
                setAddresses([...addresses, response.data]);
                showNotification('Address added successfully');
            }
            setShowAddForm(false);
            setEditingAddressId(null);
            setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
        } catch (err) {
            console.error(err);
            showNotification(editingAddressId ? 'Failed to update address' : 'Failed to add address', 'error');
        }
    };

    const handleEditAddress = (addr: Address) => {
        setNewAddress({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country
        });
        setEditingAddressId(addr.id!);
        setShowAddForm(true);
    };

    const handleDeleteAddress = async (id: number) => {
        try {
            await deleteAddress(id);
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (err) {
            setError('Failed to delete address');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phoneNumber: profileData.phoneNumber,
                email: profileData.email
            });
            setIsEditing(false);
            showNotification("Profile updated successfully");
            fetchUserProfile(); // Refresh data
        } catch (err) {
            console.error(err);
            showNotification("Failed to update profile", 'error');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', mr: 3 }}>
                        <Person sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">{user?.firstName} {user?.lastName}</Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>{user?.email}</Typography>
                    </Box>
                </Box>

                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab label="My Profile" />
                    <Tab label="Manage Addresses" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                        <Button
                            startIcon={isEditing ? <Save /> : <Edit />}
                            onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
                            variant={isEditing ? "contained" : "text"}
                        >
                            {isEditing ? 'Save Changes' : 'Edit'}
                        </Button>
                    </Box>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="First Name"
                                value={profileData.firstName || ''}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="Last Name"
                                value={profileData.lastName || ''}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ position: 'relative' }}>
                                <TextField
                                    fullWidth label="Email Address"
                                    value={profileData.email || ''}
                                    disabled={!isEditing}
                                    variant={isEditing ? "outlined" : "filled"}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    helperText={profileData.emailVerified ? "Verified" : "Not Verified"}
                                    FormHelperTextProps={{ sx: { color: profileData.emailVerified ? 'success.main' : 'warning.main', fontWeight: 'bold' } }}
                                />
                                {profileData.emailVerified ? (
                                    <CheckCircle color="success" sx={{ position: 'absolute', right: 16, top: 16 }} />
                                ) : (
                                    <Error color="warning" sx={{ position: 'absolute', right: 16, top: 16 }} />
                                )}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ position: 'relative' }}>
                                <TextField
                                    fullWidth label="Phone Number"
                                    value={profileData.phoneNumber || ''}
                                    disabled={!isEditing}
                                    variant={isEditing ? "outlined" : "filled"}
                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                    helperText={profileData.phoneVerified ? "Verified" : "Not Verified"}
                                    FormHelperTextProps={{ sx: { color: profileData.phoneVerified ? 'success.main' : 'warning.main', fontWeight: 'bold' } }}
                                />
                                {profileData.phoneVerified ? (
                                    <CheckCircle color="success" sx={{ position: 'absolute', right: 16, top: 16 }} />
                                ) : (
                                    <Error color="warning" sx={{ position: 'absolute', right: 16, top: 16 }} />
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">Saved Addresses</Typography>
                        <Button startIcon={<Add />} variant="outlined" onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingAddressId(null);
                            setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
                        }}>
                            {showAddForm ? 'Cancel' : 'Add New Address'}
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {showAddForm && (
                        <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {editingAddressId ? 'Edit Address' : 'Add New Address'}
                            </Typography>
                            <form onSubmit={handleSaveAddress}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField label="Street Address" fullWidth required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="City" fullWidth required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="State" fullWidth required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="Zip Code" fullWidth required value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="Country" fullWidth required value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Button type="submit" variant="contained" fullWidth>
                                            {editingAddressId ? 'Update Address' : 'Save Address'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    )}

                    {loading ? <CircularProgress /> : (
                        <Grid container spacing={3}>
                            {addresses.map((addr) => (
                                <Grid size={{ xs: 12, md: 6 }} key={addr.id}>
                                    <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                                                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                                <Typography variant="body2">Home</Typography>
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">{addr.street}</Typography>
                                            <Typography variant="body2">{addr.city}, {addr.state} {addr.zipCode}</Typography>
                                            <Typography variant="body2">{addr.country}</Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                                            <IconButton size="small" onClick={() => handleEditAddress(addr)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteAddress(addr.id!)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
}
