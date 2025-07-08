'use client';
import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    Divider,
    TextField,
    MenuItem,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { ArrowBack, DeliveryDining, ShoppingBag } from '@mui/icons-material';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import CircleIcon from '@mui/icons-material/Circle';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/utils/protector';

const images = [
    '/pizza.jpg',
    '/pizza.jpg',
    '/pizza.jpg'
];

const ProductCard = () => {
    const [viewerHeight, setViewerHeight] = useState(250);
    const [currentSlide, setCurrentSlide] = useState(0)
    const startY = useRef(null);
    const router = useRouter()

    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: { perView: 1 }, slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel); // `rel` gives relative slide index
        },
    });

    return (
        <ProtectedRoute>
            <Paper
                sx={{
                    height: '100%',
                    fontFamily: 'sans-serif',
                    overflow: 'hidden',
                    boxShadow: 'none'
                }}
            >
                <ArrowBack sx={{ fontSize: 40, position: 'absolute', zIndex: 1, color: '#ffa600' }} onClick={() => router.back()} />
                {/* Swipeable Product Images */}
                <Box
                    sx={{
                        height: viewerHeight,
                        transition: 'height 0.3s ease',
                        borderBottomLeftRadius: 30,
                        borderBottomRightRadius: 30,
                        backgroundColor: '#000',
                        overflowX: 'hidden'
                    }}
                >
                    <Box ref={sliderRef} className="keen-slider" sx={{ height: '100%' }}>
                        {images.map((src, index) => (
                            <Box
                                onClick={() => setViewerHeight(viewerHeight == 500 ? 250 : 500)}
                                key={index}
                                className="keen-slider__slide"
                                sx={{
                                    height: '100%',
                                    backgroundImage: `url(${src})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                        ))}
                    </Box>
                </Box>
                <div style={{ display: 'flex', placeContent: 'center' }}>
                    {
                        images.map((x, i) => {
                            return (
                                <div key={i}>
                                    {i != currentSlide ? <HorizontalRuleIcon /> : <CircleIcon sx={{ fontSize: 10 }} />}
                                </div>
                            )
                        })
                    }
                </div>

                {/* Content */}
                <Box sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                Special Pizza
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Food
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: '#eee',
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: 14,
                            }}
                        >
                            1000 ETB
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mt={1.5}>
                        This is a place holder description. it will be changed when the real data comes.
                    </Typography>

                    {/* Icons */}
                    <Box display="flex" gap={2} mt={2} alignItems="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <FavoriteBorderIcon fontSize="small" />
                            <Typography variant="body2">1.5K</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <ChatBubbleOutlineIcon fontSize="small" />
                            <Typography variant="body2">212</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <ShoppingBagOutlinedIcon fontSize="small" />
                            <Typography variant="body2">120</Typography>
                        </Box>
                    </Box>

                    <Box mt={3}>
                        <TextField label='Quantity' placeholder='Quantity' size="small" defaultValue={1} sx={{ width: '100%' }} />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            borderRadius: 20,
                            textTransform: 'none',
                            backgroundColor: '#000',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#333',
                            },
                        }}
                    >
                        Order
                    </Button>
                    <Button
                        endIcon={<ShoppingBag />}
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            borderRadius: 20,
                            textTransform: 'none',
                            backgroundColor: '#000',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#333',
                            },
                        }}
                    >
                        Add To Cart
                    </Button>
                </Box>
            </Paper>
        </ProtectedRoute>

    );
};

export default ProductCard;
