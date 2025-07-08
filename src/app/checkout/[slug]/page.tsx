'use client';
import { useCart } from "@/contexts/CartContext";
import React, { useEffect, useState } from "react";
import API from '@/api';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Typography,
    Divider,
    Paper
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/utils/protector";

const DELIVERY_FEE = 35;

const Checkout = ({ params }) => {
    const { slug } = React.use(params);
    const { cartItemsByPlace, getTotalPrice } = useCart();
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const api = API();

    const fetch = async () => {
        try {
            const cartItems = cartItemsByPlace[slug] || [];
            const parsed = await Promise.all(
                cartItems.map(async (x) => {
                    const data = await api.get(`/product/${x.id}`);
                    return { ...data, quantity: x?.quantity ?? 0 };
                })
            );
            setProducts(parsed);
        } catch (err) {
            console.error('Failed to fetch cart products:', err);
        }
    };

    const fetchTotal = async () => {
        const subtotal = await getTotalPrice(slug);
        setTotal(subtotal);
    };

    useEffect(() => {
        fetch();
        fetchTotal();
    }, []);

    const tax = (total + DELIVERY_FEE) * 0.15;
    const grandTotal = (total + DELIVERY_FEE + tax).toFixed(2);
    const router = useRouter()

    return (
        <ProtectedRoute>
            <Box sx={{ p: 2 }}>

                <Typography variant="h5" fontWeight="bold" mb={2}>
                    <ArrowBack sx={{ fontSize: 40, color: '#ffa600', p: 1 }} onClick={() => router.back()} />
                    Checkout Summary
                </Typography>

                <Stack spacing={2} mb={3}>
                    {products.map(x => (
                        <Card
                            key={x?.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: 3,
                                boxShadow: 2,
                                px: 2,
                                py: 1
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight="bold">{x?.title}</Typography>
                                <Typography fontSize={14}>Price: {x?.price} ETB</Typography>
                                <Typography fontSize={14}>Qty: {x?.quantity}</Typography>
                            </Box>
                            <Typography fontWeight="bold" color="orange">
                                {x?.price * x?.quantity} ETB
                            </Typography>
                        </Card>
                    ))}
                </Stack>

                <Paper elevation={3} sx={{ borderRadius: 4, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Payment Details
                    </Typography>

                    <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                            <Typography>Subtotal</Typography>
                            <Typography>{total.toFixed(2)} ETB</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                            <Typography>Delivery Fee</Typography>
                            <Typography>{DELIVERY_FEE} ETB</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                            <Typography>Tax (15%)</Typography>
                            <Typography>{tax.toFixed(2)} ETB</Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box display="flex" justifyContent="space-between">
                            <Typography fontWeight="bold">Total</Typography>
                            <Typography fontWeight="bold" color="primary">
                                {grandTotal} ETB
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="warning"
                            sx={{ mt: 2, borderRadius: 2, py: 1 }}
                            fullWidth
                        >
                            Confirm Order
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </ProtectedRoute>

    );
};

export default Checkout;
