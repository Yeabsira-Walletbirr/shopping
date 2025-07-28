'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    Stack,
    CardMedia,
    Button,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import API from '@/api';
import { useUser } from '@/contexts/UserContext';
import GooglePlacesAutocomplete from './GoogleAutocomplete';

interface Props {
    id: number;
    quantity: number;
    deliveryFee?: number;
    otherFees?: number;
    placeId:number
}

const PriceSummary = ({ id, quantity, deliveryFee = 35, otherFees = 0, placeId }: Props) => {
    const api = API();
    const [product, setProduct] = useState<any>();
    const [image, setImage] = useState<string>();
    const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
    const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
    const user = useUser();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/product/${id}`);
                const img = await api.get(`/files/view/${res.photo}`, null, {
                    responseType: 'blob',
                });
                const imageObjectURL = URL.createObjectURL(img);
                setImage(imageObjectURL);
                setProduct(res);
            } catch (error) {
                console.error('Failed to load product', error);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        console.log(locationMode)
        if (locationMode === 'gps') {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    try {
                        const res = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API}`
                        );
                        const data = await res.json();
                        const address = data?.results?.[0]?.formatted_address || 'Unknown location';
                        setLocation({ address, latitude: coords.latitude, longitude: coords.longitude });
                    } catch (err) {
                        console.error('Reverse geocoding failed', err);
                    }
                },
                (err) => console.error('Geolocation error', err),
                { enableHighAccuracy: true }
            );
        }
    }, [locationMode]);

    const unitPrice = product?.price ?? 0;
    const subtotal = unitPrice * quantity;
    const tax = subtotal * 0.15;
    const total = subtotal + tax + deliveryFee + otherFees;

    const format = (val: number) => val.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const order = async () => {
        try {
            const payload = {
                productId: id,
                quantity,
                userId: user?.user?.id,
                placeId,
                location,
                token : user?.user?.fcmToken
            };
            await api.post(`/product/order`, payload);
        } catch (err) {
            console.error('Order failed', err);
        }
    };

    return (
        <Card elevation={4} sx={{ maxWidth: 400, mx: 'auto', borderRadius: 4, p: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <ReceiptLongIcon sx={{ mr: 1 }} /> Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Card sx={{ display: 'flex', alignItems: 'center', borderRadius: 4, my: 2 }}>
                    <CardMedia
                        component="img"
                        image={image}
                        alt={product?.title}
                        sx={{ width: 130, height: 130, objectFit: 'cover', mr: 2 }}
                    />
                    <Box>
                        <Typography fontWeight="bold">{product?.title}</Typography>
                        <Typography fontSize={12} color="gray">{product?.type}</Typography>
                        <Typography fontSize={12} color="gray">{product?.place?.name}</Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                            <Stat icon={<VisibilityIcon />} value={product?.view} />
                            <Stat icon={<FavoriteBorderIcon />} value={product?.like} />
                            <Stat icon={<ChatBubbleOutlineIcon />} value={product?.comment} />
                        </Stack>
                        <Typography fontWeight="bold" fontSize={13}>{product?.price} ETB</Typography>
                    </Box>
                </Card>

                <Stack spacing={1.5}>
                    <SummaryRow icon={<ShoppingCartIcon color="primary" />} label={`Subtotal (${quantity} x ${format(unitPrice)})`} value={format(subtotal)} />
                    <SummaryRow icon={<AttachMoneyIcon color="secondary" />} label="Tax (15%)" value={format(tax)} />
                    <SummaryRow icon={<LocalShippingIcon color="success" />} label="Delivery Fee" value={format(deliveryFee)} />
                    {otherFees > 0 && <SummaryRow icon={<AttachMoneyIcon color="warning" />} label="Other Fees" value={format(otherFees)} />}
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight="bold">Total</Typography>
                    <Typography fontWeight="bold">{format(total)}</Typography>
                </Stack>
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
                        📍 {location?.address || 'Detecting...'}
                    </Typography>
                ) : (
                    <GooglePlacesAutocomplete onSelect={(loc) => setLocation(loc)} />
                )}

                <Button
                    onClick={order}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ borderRadius: 3, backgroundColor: 'orange', mt: 2 }}
                    disabled={!location}
                >
                    Order
                </Button>
            </CardContent>
        </Card>
    );
};

const SummaryRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography>{label}</Typography>
        </Stack>
        <Typography>{value}</Typography>
    </Stack>
);

const Stat = ({ icon, value }: { icon: React.ReactNode; value: number }) => (
    <Stack direction="row" spacing={0.5} alignItems="center">
        {icon}
        <Typography fontSize={11}>{value}</Typography>
    </Stack>
);

export default PriceSummary;
