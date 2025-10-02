'use client';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Card,
    Stack,
    CardMedia,
} from '@mui/material';
import 'keen-slider/keen-slider.min.css';
import { Close, Comment, Star, ThumbUp, Visibility } from '@mui/icons-material';
import { AddShoppingCart, RemoveShoppingCart } from '@mui/icons-material';
import { useCart } from '@/contexts/CartContext';
import ProductModal from './ProductModal';
import { useState } from 'react';

type AddFoodToCartCardProps = {
    id: number;
    title: string;
    view: number;
    comment: string;
    image: string;
    rate: string;
    price: number;
    oldPrice: string;
    place: any;
    photoDataUrl: any
};

const AddFoodToCartCard = ({
    id,
    title,
    view,
    comment,
    image,
    rate,
    price,
    oldPrice,
    place,
    photoDataUrl
}: AddFoodToCartCardProps) => {
    const {
        addToCart,
        removeFromCart,
        deleteFromCart,
        getItemCount,
    } = useCart();

    const [open, setOpen] = useState(false);

    const [showContent, setShowContent] = useState(false);
    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => setShowContent(true), 100); // slight delay for smoother entry
    };

    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
                minWidth: 300,
                my: 2,
                flexShrink: 0,
                boxShadow: 3,
            }}
        >
            <CardMedia
                image={photoDataUrl}
                sx={{
                    width: 300,
                    height: 145,
                    transition: 'height 0.3s ease',
                    overflowX: 'hidden',
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ justifyContent: 'space-between', display: 'flex' }} mb={1}>
                    <Typography
                        onClick={handleOpen} fontWeight="bold" sx={{ cursor: 'pointer' }}>{title}</Typography>
                    <Typography fontWeight="bold" fontSize={13}>
                        {price} ETB
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} mb={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Visibility sx={{ fontSize: 14 }} />
                        <Typography fontSize={11}>{view}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Comment sx={{ fontSize: 14 }} />
                        <Typography fontSize={11}>{comment}</Typography>
                    </Stack>
                </Stack>
                <Typography fontWeight="bold" fontSize={13} mb={1}>
                    <Star sx={{ color: '#0C4941' }} /> ({rate})
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddShoppingCart />}
                        sx={{ fontSize: 12, textTransform: 'none', borderRadius: 2, backgroundColor: '#0C4941' }}
                        onClick={() => addToCart({
                            id, quantity: 1, placeId: place.id,
                            price: price
                        })}
                    >
                        Add
                    </Button>
                    <>
                        <Typography>{getItemCount(id, place?.id)}</Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<RemoveShoppingCart />}
                            sx={{ fontSize: 12, textTransform: 'none', borderRadius: 2 }}
                            onClick={() => removeFromCart(id, place?.id)}
                        >
                            Remove
                        </Button>
                    </>
                </Stack>
            </Box>
            <IconButton
                sx={{ right: 2, marginBottom: 'auto' }}
                onClick={() => deleteFromCart(id, place?.id)}
            >
                <Close />
            </IconButton>

            <ProductModal id={id} title={title} view={view} comment={comment} image={image} rate={rate} price={price} oldPrice={oldPrice} place={place} photoDataUrl={photoDataUrl} open={open} setOpen={setOpen} showContent={showContent} setShowContent={setShowContent} />

        </Card>
    );
};

export default AddFoodToCartCard;
