import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../types';
import { getBooks } from '../services/api';
import BookCard from '../components/BookCard';
import { Container, Grid, Typography, Box, Button, CircularProgress, Chip, Stack, ToggleButtonGroup, ToggleButton, Pagination } from '@mui/material';
import { RocketLaunch, AutoAwesome, School, Star, GridView, List as ListIcon, ChildCare, Face } from '@mui/icons-material';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const AGE_GROUPS = [
    { label: '0-2 Years', value: 'BABIES_TODDLERS', icon: <ChildCare /> },
    { label: '3-5 Years', value: 'PRESCHOOL', icon: <AutoAwesome /> },
    { label: '5-8 Years', value: 'EARLY_READERS', icon: <School /> },
    { label: '9-12 Years', value: 'MIDDLE_GRADE', icon: <RocketLaunch /> },
    { label: '13+ Years', value: 'YOUNG_ADULT', icon: <Face /> },
];

const CATEGORIES = [
    { label: 'Adventure', icon: <RocketLaunch />, color: 'primary' },
    { label: 'Fantasy', icon: <AutoAwesome />, color: 'secondary' },
    { label: 'Education', icon: <School />, color: 'success' },
    { label: 'Mystery', icon: <Star />, color: 'warning' },
];

export default function HomePage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();


    const page = parseInt(searchParams.get('page') || '0', 10);
    const category = searchParams.get('category') || '';
    const ageGroup = searchParams.get('ageGroup') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'id-asc';
    const viewMode = (searchParams.get('viewMode') as 'grid' | 'list') || 'grid';

    useEffect(() => {
        const fetchBooksData = async () => {
            setLoading(true);
            try {
                const [sortField, sortDir] = sortBy.split('-');
                const response = await getBooks(page, 12, category, sortField, sortDir, search, ageGroup);
                setBooks(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooksData();
    }, [page, category, ageGroup, search, sortBy]);

    const handleCategoryClick = (newCategory: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (category === newCategory) {
            newParams.delete('category');
        } else {
            newParams.set('category', newCategory);
        }
        newParams.set('page', '0');
        setSearchParams(newParams);
    };

    const handleAgeGroupClick = (newAgeGroup: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (ageGroup === newAgeGroup) {
            newParams.delete('ageGroup');
        } else {
            newParams.set('ageGroup', newAgeGroup);
        }
        newParams.set('page', '0');
        setSearchParams(newParams);
    };

    const handleSortChange = (e: any) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sortBy', e.target.value);
        setSearchParams(newParams);
    };

    const handleViewModeChange = (_e: any, newView: 'grid' | 'list' | null) => {
        if (newView) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('viewMode', newView);
            setSearchParams(newParams);
        }
    };

    const handlePageChange = (_e: any, value: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', (value - 1).toString());
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    return (
        <Box sx={{ pb: 8 }}>
            {!search && (
                <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, mb: 4, borderRadius: { xs: 0, md: 4 }, mx: { xs: 0, md: 2 }, position: 'relative', overflow: 'hidden' }}>
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack spacing={2} maxWidth="sm">
                            <Chip icon={<AutoAwesome sx={{ color: '#ffea00 !important' }} />} label="New Summer Collection" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', width: 'fit-content' }} />
                            <Typography variant="h2" component="h1" fontWeight="900">
                                Discover the Magic of Reading
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Explore thousands of books that spark imagination and creativity in every child.
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                                <Button variant="contained" color="secondary" size="large" sx={{ fontWeight: 'bold', px: 4 }}>
                                    Shop Now
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ position: 'absolute', bottom: -100, left: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                </Box>
            )}

            <Container maxWidth="lg">
                {/* Age Group Filters */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Shop by Age</Typography>
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                        {AGE_GROUPS.map((group) => (
                            <Chip
                                key={group.value}
                                icon={group.icon}
                                label={group.label}
                                clickable
                                color={ageGroup === group.value ? "secondary" : "default"}
                                variant={ageGroup === group.value ? "filled" : "outlined"}
                                onClick={() => handleAgeGroupClick(group.value)}
                                sx={{ px: 1 }}
                            />
                        ))}
                    </Stack>
                </Box>

                {/* Category Filters */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6, flexWrap: 'wrap', gap: 2 }}>
                    {CATEGORIES.map((cat) => (
                        <Chip
                            key={cat.label}
                            icon={cat.icon}
                            label={cat.label}
                            clickable
                            color={category === cat.label ? cat.color as any : "default"}
                            variant={category === cat.label ? "filled" : "outlined"}
                            onClick={() => handleCategoryClick(cat.label)}
                            sx={{ px: 2, py: 2.5 }}
                        />
                    ))}
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {search ? `Search results for "${search}"` : (category ? `${category} Books` : 'All Books')}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="sort-select-label">Sort By</InputLabel>
                            <Select
                                labelId="sort-select-label"
                                value={sortBy}
                                label="Sort By"
                                onChange={handleSortChange}
                            >
                                <MenuItem value="id-asc">Newest</MenuItem>
                                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                            </Select>
                        </FormControl>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            aria-label="view mode"
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <GridView />
                            </ToggleButton>
                            <ToggleButton value="list" aria-label="list view">
                                <ListIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {books.length > 0 ? (
                            <Grid container spacing={3}>
                                {books.map(book => (
                                    <Grid key={book.id} size={viewMode === 'grid' ? { xs: 12, sm: 6, md: 4, lg: 3 } : { xs: 12 }}>
                                        <BookCard book={book} viewMode={viewMode} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">No books found matching your criteria.</Typography>
                                <Button variant="text" onClick={() => { setSearchParams(new URLSearchParams()) }}>Clear all filters</Button>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                            <Pagination
                                count={totalPages}
                                page={page + 1}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
}
