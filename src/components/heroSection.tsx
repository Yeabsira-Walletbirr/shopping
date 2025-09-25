'use client';

import {
    Box,
    Typography,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
} from '@mui/material';
import { homeData } from '@/data/home'
import { useEffect, useRef, useState } from 'react';
import TrendingProduct from './TrendingProduct';
import Place from './Place';
import Product from './Product';
import API from '@/api'

import { useLocation } from '@/contexts/LocationContext'; // update path as needed
import { useUser } from '@/contexts/UserContext';


const categories = [
    { name: 'Food', value: "FOOD" },
    { name: 'Grocery', value: 'GROCERY' },
    { name: 'Fashion', value: 'FASHION' },
    { name: 'Electroics', value: 'ELECTRONICS' },
    { name: 'Home Appliances & Furniture', value: 'HOME_APPLIANCES_AND_FURNITURE' },
    { name: 'Vehicle', value: 'VEHICLE' },
    { name: 'House', value: 'HOUSE' },
    { name: 'Other', value: 'OTHER' }
];

export default function HeroSection() {
    const user = useUser()
    const [loading, setLoading] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [loading3, setLoading3] = useState(true)
    const [tabIndex, setTabIndex]: any = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollRef1 = useRef<HTMLDivElement>(null);
    const scrollRef2 = useRef<HTMLDivElement>(null);
    const { latitude, setLatitude, longitude, setLongitude } = useLocation();


    const api = API();

    const [products, setProducts]: any = useState([]);
    const [page, setPage]: any = useState(0);
    const [totalPages, setTotalPages]: any = useState(1);

    const [trendingProducts, setTrendingProducts]: any = useState([]);
    const [pageTrending, setPageTrending]: any = useState(0);
    const [totalTrendingPages, setTotalTrendingPages]: any = useState(1);

    const [type, setType]: any = useState('FOOD');
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
                    finally {
                    }
                }
                return { ...p, photoDataUrl: null };
            })
        );
    };

    const fetchProducts = async (pageNumber = 0, append = false) => {
        try {
            setLoading(true)
            const res = await api.get('/product', {
                page: pageNumber,
                size: 10,
                productType: type,
                latitude: latitude,
                longitude: longitude
            });
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
    };

    const fetchTrending = async (pageNumber = 0, append = false) => {
        try {
            setLoading2(true)
            const res2 = await api.get(`/product/trending`, {
                page: pageNumber,
                size: 10,
                productType: type,
                latitude: latitude,
                longitude: longitude
            });
            const newTrending = await getPhoto(res2);
            setTrendingProducts((prev: any) =>
                append ? [...prev, ...newTrending] : newTrending
            );
            setTotalTrendingPages(res2.totalPages || 1);
            setPageTrending(res2.number || 0);
        } catch (err) {
            console.error("Failed to load trending products");
        }
        finally {
            setLoading2(false)
        }
    };


    const [places, setPlaces]: any = useState([]);
    const [pagePlaces, setPagePlaces]: any = useState(0);
    const [totalPlacesPages, setTotalPlacesPages]: any = useState(1);

    const fetchPlaces = async (pageNumber = 0, append = false) => {
        try {
            setLoading3(true)
            const data = await api.get(`/place/getNearByPlaces`, {
                page: pageNumber,
                size: 10,
                productType: type,
                latitude: latitude,
                longitude: longitude
            });

            const placesWithPhotos = await Promise.all(
                data?.content?.map(async (place: any) => {
                    if (place.photo) {
                        try {
                            const res = await api.get(`/files/view/${place.photo}`, null, {
                                responseType: 'blob',
                            });
                            const imageObjectURL = URL.createObjectURL(res);


                            return { ...place, photoDataUrl: imageObjectURL };
                        } catch (err) {
                            console.error('Photo load error:', err);
                            return { ...place, photoDataUrl: null };
                        }
                    }
                    return { ...place, photoDataUrl: null };
                })
            );

            setPlaces((prev: any) =>
                append ? [...prev, ...placesWithPhotos] : placesWithPhotos
            );
            setTotalPlacesPages(data.totalPages || 1);
            setPagePlaces(data.number || 0);
        } catch (e) {
            console.error('Error fetching places:', e);
        } finally {
            setLoading3(false)
        }
    };

    const handleScroll = async () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20 && page + 1 < totalPages) {
            await fetchProducts(page + 1, true);
        }
    };

    const handleScrollTrending = () => {
        if (!scrollRef1.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef1.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20 && pageTrending + 1 < totalTrendingPages) {
            fetchTrending(pageTrending + 1, true);
        }
    };

    const checkAuth = () => {
        if (localStorage.getItem('user') != null) {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            user.setAuth(u);
        }
    }

    useEffect(() => {
        checkAuth();
        fetchProducts();
        fetchTrending();
        fetchPlaces()
    }, [type, latitude]);

    return (

        <Box>

            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Tabs
                    value={tabIndex}
                    onChange={(_, newVal) => {
                        scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                        scrollRef1.current?.scrollTo({ left: 0, behavior: 'smooth' });
                        scrollRef2.current?.scrollTo({ left: 0, behavior: 'smooth' });
                        setTabIndex(newVal);
                        setType(categories[newVal]?.value);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {categories.map((cat) => (
                        <Tab disabled={loading || loading2 || loading3} key={cat.value} label={cat.name} sx={{ textTransform: 'none' }} />
                    ))}
                </Tabs>
            </Box>


            {loading || loading2 || loading3 ? (
                <Box height="82vh" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                (products?.length > 0 || trendingProducts?.length > 0 || places?.length > 0) ?
                    <>
                        <Box sx={{ px: 1 }}>
                            <Box
                                ref={scrollRef}
                                sx={{ display: 'flex', overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}
                                onScroll={handleScroll}
                            >
                                {products?.map((p: any) => (
                                    <Box key={p.id}><Product {...p} /></Box>
                                ))}
                                {loading && <CircularProgress />}

                            </Box>
                        </Box>
                        {trendingProducts?.length > 0 &&
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ px: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" mt={4} mb={2}>
                                        Trending Items
                                    </Typography>
                                    <Box
                                        ref={scrollRef1}
                                        sx={{ display: 'flex', overflowX: 'auto', pb: 2, scrollbarWidth: 'none' }}
                                        onScroll={handleScrollTrending}
                                    >
                                        {trendingProducts?.map((p: any) => (
                                            <Box sx={{ padding: 1 }} key={p.id}><TrendingProduct {...p} /></Box>
                                        ))}
                                        {loading2 && <CircularProgress />}

                                    </Box>
                                </Box>
                            </>
                        }

                        {places?.length > 0 &&
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ px: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Nearby Places
                                    </Typography>
                                    {places?.map((p: any) => (
                                        // console.log(p)
                                        <Box sx={{ p: 1 }} key={p.id}><Place {...p} /></Box>
                                    ))}
                                    {loading3 && <CircularProgress />}

                                </Box>
                            </>
                        }

                    </>
                    :
                    <Typography height={'82vh'} sx={{ alignContent: 'center', justifySelf: 'center' }}>
                        No content available
                    </Typography>
            )
            }

        </Box>
    );
}
