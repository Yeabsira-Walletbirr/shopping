'use client';
import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Typography,
    Modal,
    IconButton,
    Button,
    Rating,
    Slide,
    useTheme,
    useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ProductModal from './ProductModal';

type ProductItem = {
    id: number;
    title: string;
    oldPrice: string;
    price: number;
    photo: object;
    type: string;
    place: any;
    rate: number,
    discount: string,
    description: string,
    images: [],
    percent: number,
    photoDataUrl: any
};

const Product = ({ productItem, gridSize }) => {
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);


    const priceNumber = productItem.price;
    const total = (priceNumber * quantity).toFixed(2);

    const [showContent, setShowContent] = useState(false);


    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => setShowContent(true), 100); // slight delay for smoother entry
    };

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => setOpen(false), 300); // delay matches Slide timeout
    };

    return (
        <>
            <Card
                sx={{ width: '100%', borderRadius: 3, boxShadow: 3, cursor: 'pointer', p: 0 }}
                onClick={handleOpen}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        image={productItem.photoDataUrl}
                        alt={productItem.title}
                        sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, height: isMobile ? (gridSize == 4 ? 100 : gridSize == 6 ? 200 : 450) : '40vh' }}
                    />
                    {productItem.discount && <Chip
                        label={`${productItem.percent?.toFixed(1)}%`}
                        color="success"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold',
                            borderRadius: 1
                        }}
                    />}
                </Box>
                <CardContent sx={{ p: 1, paddingBottom: '8px !important' }}>
                    <Typography sx={{ fontSize: 14 }} component="div" fontWeight={600}>
                        {productItem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {productItem.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 12 }} fontWeight="bold" color="text.primary">
                            {productItem.price} ETB
                        </Typography>
                        {productItem.discount && <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through', fontSize: 12 }}
                        >
                            {productItem.oldPrice} ETB
                        </Typography>}
                    </Box>
                </CardContent>
            </Card>
            <ProductModal {...productItem} open={open} setOpen={setOpen} showContent={showContent} setShowContent={setShowContent} />


        </>
    );
};

export default Product;
