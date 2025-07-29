'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    Divider,
    TextField,
    MenuItem,
    Card,
    CardMedia,
    Stack,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import 'keen-slider/keen-slider.min.css';
import { ArrowBack, Comment, DeliveryDining, LocationPin, ShoppingBag, Star, ThumbUp, Watch, WatchOutlined } from '@mui/icons-material';

import CircleIcon from '@mui/icons-material/Circle';
import { useRouter } from 'next/navigation';

import AddFoodToCartCard from '@/components/AddFoodToCart';
import API from '@/api'

const PlaceCard = ({ params }:any) => {
    const { slug }:any = React.use(params)
    const api = API()

    const [viewerHeight, setViewerHeight] = useState(250);
    const router = useRouter()


    const [value, setValue] = useState('option1');
    const options = [
        { label: 'All', value: 'option1' },
        { label: 'Fasting', value: 'option2' },
        { label: 'Breakfast', value: 'option3' },
        { label: 'Lunch', value: 'option4' },
        { label: 'Habesha', value: 'option5' },
    ];


    const tabRef = useRef<HTMLDivElement>(null);
    const [tabReachedTop, setTabReachedTop] = useState(false);

    const [place, setPlace]:any = useState()
    const [products, setProducts]:any = useState([])
    const [totalPages, setTotalPages]:any = useState(1)
    const [page, setPage] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)


    const fetch = async (pageNumber = 0, append = false) => {
        if (loading || pageNumber >= totalPages) return
        setLoading(true)
        try {
            const payload = {
                id: slug,
                page: pageNumber,
                pageSize: 10
            }
            const res = await api.get(`/product/getProductByPlace`, {
                ...payload
            })
            const newProducts = await getPhoto(res);
            setProducts((prev: any) =>
                append ? [...prev, ...newProducts] : newProducts
            );
            setTotalPages(res.totalPages || 1);
            setPage(res.number || 0);
        } catch (err) {
            console.error("Failed to load products");
        }
        finally {
            setLoading(false)

        }
    }



    const getPhoto = async (res: any) => {
        return await Promise.all(
            res?.content?.map(async (p: any) => {
                if (p.photo) {
                    try {
                        const res = await api.get(`/files/view/${p.photo}`, null, {
                            responseType: 'blob',
                        });
                        const imageObjectURL = URL.createObjectURL(res);
                        return { ...p, photoDataUrl: imageObjectURL };
                    } catch (err) {
                        console.error('Photo load error:', err);
                        return { ...p, photoDataUrl: null };
                    }
                }
                return { ...p, photoDataUrl: null };
            })
        );
    };

    const fetchPlace = async () => {
        try {
            const data = await api.get(`/place/${slug}`);

            if (data?.photo)
                try {
                    const res = await api.get(`/files/view/${data.photo}`, null, {
                        responseType: 'blob',
                    });
                    const imageObjectURL = URL.createObjectURL(res);
                    data['photoDataUrl'] = imageObjectURL;
                } catch (err) {
                    console.error('Photo load error:', err);
                    data['photoDataUrl'] = null;

                }
            setPlace(data)
        }
        catch {

        }
    }



    useEffect(() => {
        fetchPlace()
        fetch()
    }, [])

    // useEffect(() => {
    //     const observer = new IntersectionObserver(
    //         ([entry]) => {
    //             setTabReachedTop(!entry.isIntersecting); // true if it's out of view
    //         },
    //         {
    //             root: null, // observe relative to viewport
    //             rootMargin: '-60px 0px 0px 0px', // adjust based on your top bar height
    //             threshold: 0,
    //         }
    //     );

    //     const el = tabRef.current;
    //     if (el) observer.observe(el);

    //     return () => {
    //         if (el) observer.unobserve(el);
    //     };
    // }, []);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetch(page + 1, true);
        }
    };


    return (
            <Paper
                sx={{
                    height: '100vh', // Full viewport height
                    overflowY: 'auto', // Enable scrolling
                    fontFamily: 'sans-serif',
                    boxShadow: 'none',
                    position: 'relative', // Needed for sticky to work inside
                }}
            >
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        height: 60,
                        backgroundColor: tabReachedTop ? '#fff' : 'transparent',
                        boxShadow: tabReachedTop ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                        color: '#ffa600',
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                >
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack sx={{ color: 'orange' }} />
                    </IconButton>

                </Box>

                {/* Swipeable Product Images */}
                <Box
                    // onTouchStart={handleTouchStart}
                    // onTouchMove={handleTouchMove}
                    // onTouchEnd={handleTouchEnd}
                    sx={{
                        height: viewerHeight,
                        transition: 'height 0.3s ease',
                        borderBottomLeftRadius: 30,
                        borderBottomRightRadius: 30,
                        backgroundColor: '#000',
                        overflowX: 'hidden',
                        mt: -8
                    }}
                >

                    <Box
                        ref={tabRef}
                        onClick={() => setViewerHeight(viewerHeight == 500 ? 250 : 500)}
                        className="keen-slider__slide"
                        sx={{
                            height: '100%',
                            backgroundImage: `url(wowProfile.jpeg)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            alignContent: 'center', justifyContent: 'center', display: 'flex'
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{
                                backgroundColor: '#00000090',
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
                                width: '85%',
                                p: 2,
                                m: 4,
                                borderRadius: 4,
                                backdropFilter: 'blur(4px)',
                                overflow: 'hidden',
                                height: 200,
                                alignSelf: 'center'
                            }}
                        >
                            {/* Left: Image & Name */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 130 }}>
                                <CardMedia
                                    image={place?.photoDataUrl}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 3,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        mb: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                    }}
                                />
                                <Typography fontWeight={700} fontSize={16} color="white">
                                    {place?.name}
                                </Typography>
                                <Typography fontWeight={600} fontSize={12} color="#00ff00" display="flex" alignItems="center">
                                    <CircleIcon sx={{ fontSize: 10, mr: 0.5 }} /> Open now
                                </Typography>
                            </Box>

                            {/* Right: Info */}
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    fontWeight={400}
                                    fontSize={14}
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    mb={1}
                                >
                                    <LocationPin sx={{ fontSize: 16, mr: 1 }} />
                                    {place?.address}
                                </Typography>

                                <Typography
                                    fontWeight={400}
                                    fontSize={13}
                                    color="#ffffff"
                                    display="flex"
                                    alignItems="center"
                                    mb={0.5}
                                >
                                    <WatchOutlined sx={{ fontSize: 16, mr: 1 }} />
                                    Working Hour: 8:00 AM - 08:30 PM
                                </Typography>

                                <Typography
                                    fontWeight={500}
                                    fontSize={13}
                                    color="#FFD700"
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Star sx={{ fontSize: 16, mr: 1 }} />
                                    Rate: 5.0
                                </Typography>
                            </Box>
                        </Stack>



                    </Box>
                </Box>
                <RadioGroup
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    sx={{
                        position: 'sticky',
                        top: 50,
                        zIndex: 10,
                        backgroundColor: 'white', // or your page background
                        overflowX: 'auto',
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        p: 2,
                        scrollbarWidth: 'none',
                    }}
                >
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio sx={{ display: 'none' }} />} // hide default radio
                            label={
                                <Box
                                    sx={{
                                        p: '3px',
                                        borderRadius: 2,
                                        border: '2px solid',
                                        borderColor: value === option.value ? 'orange' : 'grey.300',
                                        color: value === option.value ? 'orange' : 'text.primary',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        fontWeight: '500',
                                        minWidth: 120,
                                    }}
                                >
                                    {option.label}
                                </Box>
                            }
                            sx={{ marginRight: 2 }}
                        />
                    ))}
                </RadioGroup>

                {products?.length > 0 ? <Box
                    ref={scrollRef}
                    onScroll={handleScroll}
                    sx={{ height: '66vh', overflowY: 'auto', px: 2 }}
                >
                    {products?.map((product:any, i:any) => (
                        <Box key={i}>
                            <AddFoodToCartCard {...product} />
                        </Box>
                    ))}
                    {loading && <Typography>Loading...</Typography>}
                </Box>
                :

                <Typography height={'64%'} sx={{alignContent:'center', justifySelf:'center'}}>
                    No content available
                </Typography>}

            </Paper>

    );
};

export default PlaceCard;
