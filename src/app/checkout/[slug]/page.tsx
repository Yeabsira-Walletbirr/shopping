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
    Paper,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/utils/protector";
import GooglePlacesAutocomplete from "@/components/GoogleAutocomplete";

const DELIVERY_FEE = 35;

const Checkout = ({ params }: { params: { slug: string } }) => {
    // const { slug } = React.use(params);
    // const { slug } = params;
    const { slug } = params;
    const { cartItemsByPlace, getTotalPrice } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
    const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const api = API();
    const router = useRouter();

    const fetchData = async () => {
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
        fetchData();
        fetchTotal();
    }, []);

    const tax = (total + DELIVERY_FEE) * 0.15;
    const grandTotal = (total + DELIVERY_FEE + tax).toFixed(2);

    const getLocationFromDevice = () => {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API}`
                    );
                    const data = await res.json();
                    const address = data?.results?.[0]?.formatted_address || 'Unknown location';

                    setLocation({ address, lat: latitude, lng: longitude });
                } catch (err) {
                    console.error('Reverse geocoding failed', err);
                }
                setLoadingLocation(false);
            },
            (err) => {
                console.error('Geolocation error', err);
                setLoadingLocation(false);
            }
        );
    };

    useEffect(() => {
        if (locationMode === 'gps') {
            getLocationFromDevice();
        }
    }, [locationMode]);

    const handleConfirmOrder = () => {
        // You can build payload and call your order API here
        console.log("Order confirmed with location:", location);
    };

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
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" mb={1}>Select Delivery Location</Typography>
                        <ToggleButtonGroup
                            value={locationMode}
                            exclusive
                            onChange={(_, val) => val && setLocationMode(val)}
                            sx={{ mb: 2 }}
                            fullWidth
                        >
                            <ToggleButton value="gps">Use My Location</ToggleButton>
                            <ToggleButton value="manual">Choose Manually</ToggleButton>
                        </ToggleButtonGroup>

                        {locationMode === 'gps' ? (
                            <Typography fontSize={14} color="text.secondary">
                                📍 {location?.address || "Fetching location..."}
                            </Typography>
                        ) : (
                            <GooglePlacesAutocomplete onSelect={(loc) => setLocation(loc)} />
                        )}

                        <Button
                            onClick={handleConfirmOrder}
                            variant="contained"
                            color="warning"
                            sx={{ mt: 2, borderRadius: 2, py: 1 }}
                            fullWidth
                            disabled={!location}
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





