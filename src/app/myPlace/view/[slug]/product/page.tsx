'use client'

import React, { useEffect, useState } from "react";
import API from '@/api'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    Stack,
    CardMedia,
    IconButton
} from "@mui/material";
import { useRouter } from "next/navigation";

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProtectedRoute from "@/utils/protector";

const ViewProducts = ({ params }) => {
    const router = useRouter()

    const { slug } = React.use(params);
    const api = API();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0); // 0-based
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async (pageNumber = 0) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/product/getProductByPlaceAndUser', {
                page: pageNumber,
                size: 10,
                id: slug
            })

            const productWithPhotos = await Promise.all(
                res?.content?.map(async (p) => {
                    if (p.photo) {
                        try {
                            const res = await api.get(`/files/view/${p.photo}`, null, {
                                responseType: 'blob',
                            });
                            const imageObjectURL = URL.createObjectURL(res);

                            return { ...p, photoDataUrl: imageObjectURL };
                        } catch (err) {
                            console.error('Photo load error:', err);
                            return { ...p, photoDataUrl: null };
                        }
                    }
                    return { ...p, photoDataUrl: null };
                })
            );

            setProducts(productWithPhotos || []);
            setTotalPages(res.totalPages || 1);
            setPage(res.number || 0);
        } catch (err) {
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handlePageChange = (_, value) => {
        fetchProducts(value - 1); // MUI uses 1-based, backend likely 0-based
    };

    const statusColors = {
        APPROVED: 'green',
        UNAPPROVED: '#ffc300',
        DECLINED: 'red',
        VERIFIED: 'green',
    };

    return (
        <ProtectedRoute>
            <Box padding={3}>
                <Typography variant="h5" gutterBottom>
                    Products for {products?.[0]?.place?.name}
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <Alert severity="info">No products found.</Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {products.map((product) => (
                                    <Grid sx={{ width: { xs: '100%', sm: "100%", md: '50%' } }} key={product.id} onClick={() => router.push(`/product/view/${product.id}`)}>
                                        <Card sx={{ height: '100%' }}>
                                            {product.photoDataUrl && (
                                                <CardMedia
                                                    component="img"
                                                    style={{ height: 180 }}
                                                    image={product.photoDataUrl}
                                                    alt={product.title}
                                                />
                                            )}
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="h5" gutterBottom>
                                                        {product.title}
                                                    </Typography>

                                                    <Typography sx={{ borderRadius: 2, backgroundColor: statusColors[product.status], color: 'white', p: 1 }} fontWeight={700} gutterBottom>
                                                        {product.status}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.description}
                                                </Typography>
                                                <Typography variant="caption" display="block" mt={1}>
                                                    Type: {product.type}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        mb: 2,
                                                        boxShadow: 2,
                                                        p: 1,
                                                        borderRadius: 5
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <IconButton>
                                                            <FavoriteBorderIcon color="error" />
                                                        </IconButton>
                                                        <Typography variant="body2">{product.like || 0}</Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <IconButton>
                                                            <ChatBubbleOutlineIcon color="primary" />
                                                        </IconButton>
                                                        <Typography variant="body2">{product.comment || 0}</Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <IconButton>
                                                            <VisibilityIcon sx={{ color: 'grey' }} />
                                                        </IconButton>
                                                        <Typography variant="body2">{product.view || 0}</Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            // <TrendingProduct {...products}/>
                        )}

                        <Stack alignItems="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={page + 1}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Stack>
                    </>
                )}
            </Box>
        </ProtectedRoute>

    );
};

export default ViewProducts;
