import { Box, Button, Card, CardContent, CardMedia, Chip, IconButton, Modal, Rating, Slide, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import { useState } from "react";
import ProductModal from "./ProductModal";
import { ShoppingCart, Star } from "@mui/icons-material";
type TrendingProductItem = {
    id?: any,
    name?: any,
    oldPrice?: any,
    price?: any,
    image?: any,
    type?: any,
    place?: any,
    rating?: any,
    discount?: any,
    description?: any,
    like?: any,
    comment?: any,
    view?: any,
    images?: [],
    counter?: any,
    photoDataUrl?: any,
    title?: any
};
const TrendingProduct = (trendingproductItem: TrendingProductItem) => {
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);


    const [showContent, setShowContent] = useState(false);

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
                onClick={handleOpen}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 4,
                    minWidth: 300,
                    maxWidth: 320,
                    // mx: 2,
                    flexShrink: 0,
                    boxShadow: 4,
                    ":hover": {
                        boxShadow: 8
                    }
                }}
            >
                <CardMedia
                    component="img"
                    image={trendingproductItem.photoDataUrl}
                    alt={trendingproductItem.title}
                    sx={{
                        width: 130,
                        height: 130,
                        objectFit: 'cover',
                        mr: 2,
                    }}
                />
                <Box>
                    <Typography fontWeight="bold">{trendingproductItem.title}</Typography>
                    <Typography fontSize={12} color="gray" mb={1}>
                        {trendingproductItem.type}
                    </Typography>
                    <Typography fontSize={12} color="gray" mb={1}>
                        {trendingproductItem.place?.name}
                    </Typography>

                    <Stack direction="row" spacing={1} mb={1}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                            <Typography fontSize={11}>{trendingproductItem?.view}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
                            <Typography fontSize={11}>{trendingproductItem?.comment}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ShoppingCart sx={{ fontSize: 14 }} />
                            <Typography fontSize={11}>{trendingproductItem?.counter}</Typography>
                        </Stack>
                        {trendingproductItem?.rating && <Stack direction="row" spacing={0.5} alignItems="center">
                            <Star sx={{ fontSize: 14, color: '#0C4941' }} />
                            <Typography fontSize={11}>{trendingproductItem?.rating}</Typography>
                        </Stack>}
                    </Stack>

                    <Typography fontWeight="bold" fontSize={13}>
                        {trendingproductItem.price} ETB
                    </Typography>
                </Box>
            </Card>
            <ProductModal {...trendingproductItem} open={open} setOpen={setOpen} showContent={showContent} setShowContent={setShowContent} />

        </>

    )
}
export default TrendingProduct;