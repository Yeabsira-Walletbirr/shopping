'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    CardMedia,
    Typography,
    Modal,
    IconButton,
    Button,
    Rating,
    Slide,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Star } from '@mui/icons-material';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import API from '@/api';
import { useUser } from '@/contexts/UserContext';

type ProductItem = {
    id: number;
    title: string;
    oldPrice: string;
    price: number;
    image: string;
    type: string;
    place: any;
    rate: number;
    discount: string;
    description: string;
    images: string[];
    like: number;
    comment: number;
    photoDataUrl: string;
    view: number;
    counter: number;
    yourRating: number;
};

type ProductModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    showContent: boolean;
    setShowContent: (open: boolean) => void;
} & ProductItem;

const ProductModal: React.FC<ProductModalProps> = ({
    id,
    title,
    oldPrice,
    price,
    type,
    place,
    rate,
    discount,
    description,
    images,
    open,
    setOpen,
    showContent,
    setShowContent,
    like,
    comment,
    view,
    photoDataUrl,
    counter,
    yourRating,
}) => {
    const [quantity, setQuantity] = useState(1);
    const priceNumber = price;
    const total = (priceNumber * quantity).toFixed(2);
    const [viewerHeight, setViewerHeight] = useState(250);
    const [currentSlide, setCurrentSlide] = useState(0);
    const startY = useRef(null);
    const [rating, setRating] = useState(0);
    const [yourRate, setYourRate] = useState(0);

    // New states for rating comment input
    const [pendingRating, setPendingRating] = useState<number | null>(null);
    const [commentInput, setCommentInput] = useState('');
    const [showCommentInput, setShowCommentInput] = useState(false);

    const router = useRouter();
    const api = API();
    const user = useUser();

    const [allImages, setAllImages] = useState([])

    useEffect(() => {
        setYourRate(yourRating);
        setRating(rate);
        setAllImages([photoDataUrl])
        if (open && images?.length > 0) {
            const fetchAllImages = async () => {
                try {
                    const temp = await Promise.all(
                        images.map(async (x) => {
                            const fileRes = await api.get(`/files/view/${x}`, null, {
                                responseType: 'blob',
                            });
                            const imageObjectURL = URL.createObjectURL(fileRes);
                            return imageObjectURL;
                        })
                    );

                    setAllImages([...allImages, ...temp]);
                } catch (error) {
                    console.error("Failed to fetch images", error);
                }
            };

            fetchAllImages();
        }


    }, [open]);

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => setOpen(false), 300);
    };

    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: { perView: 1 },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });

    const handleTouchStart = (e: { touches: { clientY: number }[] }) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: { touches: { clientY: number }[] }) => {
        if (startY.current !== null) {
            const deltaY = e.touches[0].clientY - startY.current;
            if (deltaY > 0) handleClose();
        }
    };

    const handleTouchEnd = () => {
        startY.current = null;
    };

    const rateProduct = async (r: number, comment: string) => {
        try {
            const payload = {
                userId: user?.user?.id,
                productId: id,
                rating: r,
                comment: comment,
            };
            const res = await api.post(`/product/rate`, payload);
            setRating(res?.rating || r);
            setYourRate(r);
        } catch (error) {
            console.error('Rating failed', error);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition>
            <Slide
                direction="up"
                in={showContent}
                mountOnEnter
                unmountOnExit
                timeout={300}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: '50%' },
                        bgcolor: 'background.paper',
                        position: 'absolute',
                        bottom: { xs: 0, sm: '10%' },
                        left: { sm: '25%' },
                        transform: { sm: 'translate(-50%, -50%)' },
                        borderRadius: { xs: '20px 20px 0 0', sm: 4 },
                        boxShadow: '0px 0px 10px 1px rgb(31, 31, 31)',
                        overflowY: 'auto',
                        maxHeight: '100vh',
                    }}
                >
                    <Box
                        ref={sliderRef}
                        className="keen-slider"
                        sx={{
                            height: viewerHeight,
                            transition: 'height 0.3s ease',
                            backgroundColor: '#000',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            overflow: 'hidden',
                        }}
                    >
                        {allImages.map((img, idx) => (
                            <Box
                                key={idx}
                                className="keen-slider__slide"
                                component="img"
                                src={img}
                                alt={`product-image-${idx}`}
                                onClick={() => setViewerHeight(viewerHeight === 500 ? 250 : 500)}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        {allImages.map((_, idx) => (
                            <Box
                                key={idx}
                                component="span"
                                sx={{
                                    display: 'inline-block',
                                    width: 10,
                                    height: 10,
                                    mx: 0.5,
                                    borderRadius: '50%',
                                    backgroundColor:
                                        idx === currentSlide ? 'primary.main' : 'grey.400',
                                }}
                            />
                        ))}
                    </Box>


                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" fontWeight="bold">
                            {title}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            {place?.name}
                        </Typography>

                        <Rating
                            onChange={(e, newValue) => {
                                if (newValue) {
                                    setPendingRating(newValue);
                                    setYourRate(newValue)
                                    setShowCommentInput(true);
                                }
                            }}
                            value={yourRate}
                            precision={1}
                            sx={{ mb: 1 }}
                        />

                        {showCommentInput && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Please leave a comment for your rating
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder="Write your comment..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            borderRadius: 8,
                                            padding: 8,
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                    <Box
                                        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
                                    >
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setShowCommentInput(false);
                                                setPendingRating(null);
                                                setYourRate(yourRating)
                                                setCommentInput('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => {
                                                if (pendingRating !== null) {
                                                    rateProduct(pendingRating, commentInput);
                                                }
                                                setShowCommentInput(false);
                                                setCommentInput('');
                                            }}
                                        >
                                            OK
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Typography fontWeight="bold" color="success.main">
                                {price} ETB
                            </Typography>
                            {discount && (
                                <Typography
                                    sx={{ textDecoration: 'line-through' }}
                                    color="text.secondary"
                                >
                                    {oldPrice} ETB
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {description}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <RemoveIcon />
                                </IconButton>
                                <Typography variant="h6" sx={{ mx: 2 }}>
                                    {quantity}
                                </Typography>
                                <IconButton onClick={() => setQuantity(quantity + 1)}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <Typography fontWeight="bold">Total: {total} ETB</Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 2,
                                boxShadow: 2,
                                p: 1,
                                borderRadius: 5,
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <IconButton>
                                    <Star sx={{ color: 'orange' }} />
                                </IconButton>
                                <Typography variant="body2">{rating?.toFixed(1)}</Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                                <IconButton>
                                    <ChatBubbleOutlineIcon color="primary" />
                                </IconButton>
                                <Typography variant="body2">{comment}</Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                                <IconButton>
                                    <VisibilityIcon color="primary" />
                                </IconButton>
                                <Typography variant="body2">{view}</Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                                <IconButton>
                                    <ShoppingCartIcon color="primary" />
                                </IconButton>
                                <Typography variant="body2">{counter}</Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: 'orange',
                            }}
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => {
                                handleClose();
                                router.push(`/payment?id=${id}&quantity=${quantity}`);
                            }}
                        >
                            Order Now
                        </Button>
                    </Box>
                </Box>
            </Slide>
        </Modal>
    );
};

export default ProductModal;
