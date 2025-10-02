'use client';

import {
    Box,
    Typography,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Grid,
    Paper,
    TextField,
    MenuItem,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import TrendingProduct from './TrendingProduct';
import Place from './Place';
import Product from './Product';
import API from '@/api'

import { useLocation } from '@/contexts/LocationContext'; // update path as needed


const categories = [
    { name: 'All', value: null },
    { name: 'Grocery', value: 'GROCERY' },
    { name: 'Fashion', value: 'FASHION' },
    { name: 'Electroics', value: 'ELECTRONICS' },
    { name: 'Home Appliances & Furniture', value: 'HOME_APPLIANCES_AND_FURNITURE' },
    { name: 'Vehicle', value: 'VEHICLE' },
    { name: 'House', value: 'HOUSE' },
    { name: 'Other', value: 'OTHER' }
];

export default function HeroSection() {
    const [loading, setLoading] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [loading3, setLoading3] = useState(true)
    const [tabIndex, setTabIndex]: any = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollRef1 = useRef<HTMLDivElement>(null);
    const scrollRef2 = useRef<HTMLDivElement>(null);

    const [gridSize, setGridSize] = useState(4)


    const api = API();

    const [products, setProducts]: any = useState([]);
    const [page, setPage]: any = useState(0);
    const [totalPages, setTotalPages]: any = useState(1);

    const [trendingProducts, setTrendingProducts]: any = useState([]);
    const [pageTrending, setPageTrending]: any = useState(0);
    const [totalTrendingPages, setTotalTrendingPages]: any = useState(1);

    const [type, setType]: any = useState(null);
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


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
            const res = await api.get('/product/getProducts', {
                page: pageNumber,
                size: 10,
                productType: type,
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
            const res2 = await api.get(`/product/getTrending`, {
                page: pageNumber,
                size: 10,
                productType: type,
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

    useEffect(() => {
        if (localStorage.getItem('gridSize')) {
            setGridSize(parseInt(localStorage.getItem('gridSize')))

        }
        fetchProducts();
        fetchTrending();

    }, [type]);

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
                <Box sx={{ display: 'flex' }}>
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
                            <Tab disabled={loading || loading2} key={cat.value} label={cat.name} sx={{ textTransform: 'none' }} />
                        ))}
                    </Tabs>
                    {isMobile && <TextField
                        label="Grid Size"
                        fullWidth
                        select
                        value={gridSize}
                        onChange={(e) => {
                            setGridSize(e.target.value)
                            localStorage.setItem('gridSize', e.target.value)
                        }}
                    >
                        {[4, 6, 12].map((size) => (
                            <MenuItem key={size} value={size}>
                                {size}
                            </MenuItem>
                        ))}
                    </TextField>}
                </Box>


            </Box>


            {loading || loading2 ? (
                <Box height="82vh" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                (products?.length > 0 || trendingProducts?.length > 0) ?
                    <>
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
                        {/* <Box sx={{ px: 1 }}> */}
                        <Box
                            ref={scrollRef}
                            sx={{ overflowY: 'auto', p: 1, scrollbarWidth: 'none' }}
                            onScroll={handleScroll}
                        >
                            <Grid container spacing={1}>
                                {/* Column 1 */}
                                {products?.map((p: any) => (
                                    <Grid size={isMobile ? gridSize : 2} key={p.id}>
                                        <Box key={p.id}><Product productItem={p} gridSize={gridSize} /></Box>
                                    </Grid>
                                ))}


                                {loading && <CircularProgress />}
                            </Grid>
                        </Box>
                        {/* </Box> */}

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
