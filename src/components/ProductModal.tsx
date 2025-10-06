'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Modal,
    IconButton,
    Button,
    Rating,
    Slide,
    Stack,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ArrowBack, Star } from '@mui/icons-material';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useRouter } from 'next/navigation';
import API from '@/api';
import { useUser } from '@/contexts/UserContext';

type ProductItem = {
    id?: number;
    title?: string;
    oldPrice?: string;
    price?: number;
    image?: string;
    type?: string;
    place?: any;
    rate?: string;
    discount?: string;
    description?: string;
    images?: string[];
    like?: number;
    comment?: string;
    photoDataUrl?: string;
    view?: number;
    counter?: number;
    yourRating?: number;
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
    const [viewerHeight, setViewerHeight] = useState(250);
    const [currentSlide, setCurrentSlide] = useState(0);
    const startY = useRef<number | null>(null);
    const [rating, setRating] = useState(0);
    const [yourRate, setYourRate] = useState(0);
    const [pendingRating, setPendingRating] = useState<number | null>(null);
    const [commentInput, setCommentInput] = useState('');
    const [showCommentInput, setShowCommentInput] = useState(false);

    const [allImages, setAllImages] = useState<string[]>([]);
    const [showComment, setShowComment] = useState(false);
    const [ratings, setRatings] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [showImages, setShowImages] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const api = API();
    const user = useUser();

    let total = '';
    if (price)
        total = (price * quantity).toFixed(2);

    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: { perView: 1 },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY.current !== null) {
            const deltaY = e.touches[0].clientY - startY.current;
            if (deltaY > 0) handleClose();
        }
    };

    const handleTouchEnd = () => {
        startY.current = null;
    };

    const close = () => {
        setShowImages(false)

    }
    const handleClose = () => {
        setOpen(false)
        setShowContent(false);
        setTimeout(() => close(), 300);

    };

    const rateProduct = async (r: number, comment: string) => {
        try {
            const payload = {
                userId: user?.user?.id,
                entityId: id,
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

    const fetchRatings = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const res = await api.get('/product/getRatingsByProduct', {
                page,
                pageSize: 10,
                id,
            });
            setRatings((prev) => [...prev, ...res?.content]);
            setHasMore(!res.last);
        } catch (err) {
            console.error('Failed to fetch ratings', err);
        } finally {
            setLoading(false);
        }
    };

    const [totalView, setTotalView] = useState(0);
    const countView = async () => {
        try {
            const res = await api.get(`/product/countView/${id}`);
            setTotalView(res)
        } catch (error) {
            console.error('Rating failed', error);
        }
    };

    useEffect(() => {
        if (yourRating)
            setYourRate(yourRating);
        if (rate)
            setRating(parseInt(rate));
        if (photoDataUrl)
            setAllImages([photoDataUrl]);
        if (view)
            setTotalView(view)
        if (open && images && images?.length > 0) {
            const fetchAllImages = async () => {
                try {
                    const temp = await Promise.all(
                        images.map(async (x) => {
                            const fileRes = await api.get(`/files/view/${x}`, null, {
                                responseType: 'blob',
                            });
                            return URL.createObjectURL(fileRes);
                        })
                    );
                    if (photoDataUrl)
                        setAllImages([photoDataUrl, ...temp]);
                    setShowImages(true)

                } catch (error) {
                    console.error("Failed to fetch images", error);
                }
            };
            fetchAllImages();
        } else {
            setShowImages(true)

        }
        if (open) {
            countView()
        }
    }, [open]);

    useEffect(() => {
        if (showComment) fetchRatings();
    }, [page, showComment]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !showComment) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isBottom = scrollTop + clientHeight >= scrollHeight - 20;
            if (isBottom && hasMore && !loading) {
                setPage((prev) => prev + 1);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [showComment, hasMore, loading]);

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
                <Box sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '50%' },
                    bgcolor: 'background.paper',
                    position: 'absolute',
                    bottom: 0,
                    left: { sm: '25%' },
                    transform: { sm: 'translate(-50%, -50%)' },
                    borderRadius: { xs: '20px 20px 0 0', sm: 4 },
                    boxShadow: '0px 0px 10px 1px rgb(31, 31, 31)',
                    overflowY: 'auto',
                    maxHeight: '100vh',
                }}>
                    {showImages ?
                        <>

                            <Box
                                ref={sliderRef}
                                className="keen-slider"
                                sx={{
                                    height: viewerHeight,
                                    transition: 'height 0.4s ease-in-out',
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
                                    <Box key={idx} component="span" sx={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        mx: 0.5,
                                        borderRadius: '50%',
                                        backgroundColor: idx === currentSlide ? 'primary.main' : 'grey.400',
                                    }} />
                                ))}
                            </Box>
                        </> :
                        <Box

                            sx={{
                                height: viewerHeight,
                                transition: 'height 0.4s ease-in-out',
                                backgroundColor: '#000',
                                borderTopLeftRadius: '20px',
                                borderTopRightRadius: '20px',
                                alignContent: 'center',
                                textAlign: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    }

                    {!showComment ? (
                        <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '40vh' }}>
                            <Typography variant="h6" fontWeight="bold">{title}</Typography>
                            <Typography style={{ color: '#0080a7ff' }} onClick={() => router.push(`/place/${place.id}`)} color="text.secondary" gutterBottom>Visit {place?.name}</Typography>

                            <Rating
                                value={yourRate}
                                onChange={(e, newValue) => {
                                    if (newValue) {
                                        setPendingRating(newValue);
                                        setYourRate(newValue);
                                        setShowCommentInput(true);
                                    }
                                }}
                                precision={1}
                                sx={{ mb: 1 }}
                            />

                            {showCommentInput && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Please leave a comment for your rating
                                    </Typography>
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
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                                        <Button size="small" variant="outlined" onClick={() => {
                                            setShowCommentInput(false);
                                            setPendingRating(null);
                                            if (yourRating)
                                                setYourRate(yourRating);
                                            setCommentInput('');
                                        }}>Cancel</Button>
                                        <Button sx={{ backgroundColor: '#0C4941' }} size="small" variant="contained" onClick={() => {
                                            if (user.isAuthenticated && pendingRating !== null) {
                                                rateProduct(pendingRating, commentInput);
                                            }
                                            else {
                                                router.push('/auth')
                                            }
                                            setShowCommentInput(false);
                                            setCommentInput('');
                                        }}>OK</Button>
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                <Typography fontWeight="bold" color="success.main">{price} ETB</Typography>
                                {discount && (
                                    <Typography sx={{ textDecoration: 'line-through' }} color="text.secondary">
                                        {oldPrice} ETB
                                    </Typography>
                                )}
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2 }}>{description}</Typography>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}><RemoveIcon /></IconButton>
                                    <Typography variant="h6" sx={{ mx: 2 }}>{quantity}</Typography>
                                    <IconButton onClick={() => setQuantity(quantity + 1)}><AddIcon /></IconButton>
                                </Box>
                                <Typography fontWeight="bold">Total: {total} ETB</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, boxShadow: 2, p: 1, borderRadius: 5 }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton><Star sx={{ color: '#0C4941' }} /></IconButton>
                                    <Typography variant="body2">{rating?.toFixed(1)}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton onClick={() => {
                                        setRatings([]);
                                        setPage(0);
                                        setHasMore(true);
                                        setShowComment(true);
                                    }}>
                                        <ChatBubbleOutlineIcon color="primary" />
                                    </IconButton>
                                    <Typography variant="body2">{comment}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton><VisibilityIcon color="primary" /></IconButton>
                                    <Typography variant="body2">{totalView}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton><ShoppingCartIcon color="primary" /></IconButton>
                                    <Typography variant="body2">{counter}</Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ backgroundColor: '#0C4941' }}
                                startIcon={<ShoppingCartIcon />}
                                onClick={() => {
                                    handleClose();
                                    router.push(`/payment?id=${id}&quantity=${quantity}&placeId=${place?.id}`);
                                }}
                            >
                                Order Now
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '40vh' }}>
                            <Stack ref={scrollRef} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                                <IconButton onClick={() => setShowComment(false)} sx={{ width: 40 }}>
                                    <ArrowBack color="primary" />
                                </IconButton>
                                {ratings.length === 0 ? (
                                    <Typography>No comments yet</Typography>
                                ) : (
                                    <>
                                        {ratings.map((rate, index) => (
                                            <Box key={index} sx={{ borderBottom: '1px solid #eee', mb: 2, pb: 2 }}>
                                                <Typography fontWeight="bold">
                                                    {rate?.name || 'Anonymous'}
                                                </Typography>
                                                <Rating value={rate?.rating || 0} readOnly size="small" />
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {rate?.comment || 'No comment'}
                                                </Typography>
                                            </Box>
                                        ))}
                                        {loading && (
                                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Loading more comments...
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Slide>
        </Modal>
    );
};

export default ProductModal;
