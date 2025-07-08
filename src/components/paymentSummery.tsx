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
    Chip,
    Button,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { products } from '@/data/products';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import API from '@/api'
import { useUser } from '@/contexts/UserContext';

interface Props {
    id: number;
    quantity: number;
    deliveryFee?: number;
    otherFees?: number;
}

const PriceSummary = ({ id, quantity, deliveryFee = 35, otherFees = 0 }: Props) => {
    const api = API()
    // const product = products.find((x) => x.id === id);
    const [product, setProduct] = useState()
    const [image, setImage] = useState();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/product/${id}`);
                const img = await api.get(`/files/view/${res.photo}`, null, {
                    responseType: 'blob',
                });
                const imageObjectURL = URL.createObjectURL(img);
                setImage(imageObjectURL)
                setProduct(res)
            }
            catch {

            }
        }
        fetch()

    }, [])
    const unitPrice = product?.price ?? 0;
    const subtotal = unitPrice * quantity;
    const tax = subtotal * 0.15;
    const total = subtotal + tax + deliveryFee + otherFees;


    const format = (val: number) =>
        val.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        const user = useUser()

    const order = async () => {
        try {
            const payload={
                productId:id,
                quantity: quantity,
                userId:user?.user?.id
            }
            await api.post(`/product/order`,payload)
        }
        catch {

        }

    }

    return (
        <Card
            elevation={4}
            sx={{
                maxWidth: 400,
                mx: 'auto',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                p: 2,
                bgcolor: 'background.paper',
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <ReceiptLongIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Card
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 4,
                        minWidth: 300,
                        // maxWidth: 320,
                        // mx: 2,
                        flexShrink: 0,
                        // boxShadow: 4,
                        my: 2
                    }}
                >
                    <CardMedia
                        component="img"
                        image={image}
                        alt={product?.title}
                        sx={{
                            width: 130,
                            height: 130,
                            objectFit: 'cover',
                            mr: 2,
                        }}
                    />
                    <Box>
                        <Typography fontWeight="bold">{product?.title}</Typography>
                        <Typography fontSize={12} color="gray" mb={1}>
                            {product?.type}
                        </Typography>
                        <Typography fontSize={12} color="gray" mb={1}>
                            {product?.place?.name}
                        </Typography>

                        <Stack direction="row" spacing={1} mb={1}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <VisibilityIcon sx={{ fontSize: 14 }} />
                                <Typography fontSize={11}>{product?.view}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <FavoriteBorderIcon sx={{ fontSize: 14 }} />
                                <Typography fontSize={11}>{product?.like}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
                                <Typography fontSize={11}>{product?.comment}</Typography>
                            </Stack>
                        </Stack>

                        <Typography fontWeight="bold" fontSize={13}>
                            {product?.price} ETB
                        </Typography>
                    </Box>
                </Card>


                <Stack spacing={1.5}>
                    <SummaryRow
                        icon={<ShoppingCartIcon color="primary" />}
                        label={`Subtotal (${quantity} x ${format(unitPrice)})`}
                        value={format(subtotal)}
                    />
                    <SummaryRow
                        icon={<AttachMoneyIcon color="secondary" />}
                        label="Tax (15%)"
                        value={format(tax)}
                    />
                    <SummaryRow
                        icon={<LocalShippingIcon color="success" />}
                        label="Delivery Fee"
                        value={format(deliveryFee)}
                    />
                    {otherFees > 0 && (
                        <SummaryRow
                            icon={<AttachMoneyIcon color="warning" />}
                            label="Other Fees"
                            value={format(otherFees)}
                        />
                    )}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight="bold">Total</Typography>
                    <Typography fontWeight="bold">{format(total)}</Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />

                <Stack>
                    <Button
                        onClick={order}
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ borderRadius: 3, backgroundColor: 'orange' }}
                    >
                        Order
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

const SummaryRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography>{label}</Typography>
        </Stack>
        <Typography>{value}</Typography>
    </Stack>
);

export default PriceSummary;
