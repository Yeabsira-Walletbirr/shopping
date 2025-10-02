'use client'
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    CssBaseline,
    Drawer,
    Grid,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { History, Home, Login, Logout, MaleOutlined, Man2, ManOutlined, ShoppingCart, Store } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { messaging, initializeMessaging } from '@/utils/firebase';
import { getToken, onMessage } from "firebase/messaging";
import API from '@/api'
import Product from './Product';

const TransparentResponsiveHeader = () => {
    const pathname = usePathname()
    const user = useUser()

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [hideHeader, setHideHeader] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults]: any = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const api = API()


    const [page, setPage] = useState(0);
    const [size, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [ascending, setAscending] = useState(true);



    const toggleDrawer = () => setMobileOpen(!mobileOpen);

    const navItems = [{ name: 'Home', route: '/', icon: <Home /> }, { name: 'My Cart', route: '/cart', icon: <ShoppingCart /> }, { name: 'My Shop', route: '/myPlace', icon: <Store /> }, { name: 'History', route: '/orders', icon: <History /> }, { name: 'Profile', route: '/profile', icon: <Man2 /> }, { name: user?.isAuthenticated ? 'Logout' : 'Login', route: '/auth', icon: user?.isAuthenticated ? <Logout /> : <Login /> }];


    // Scroll logic to hide header on large screens
    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            // if (!isMobile) {
            setHideHeader(window.scrollY > lastScrollY && window.scrollY > 10);
            lastScrollY = window.scrollY;
            // }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile]);


    const requestPermission = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const permission = await Notification.requestPermission();

                const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

                if (permission === "granted") {
                    await initializeMessaging(); // Ensure messaging is available

                    if (messaging) {
                        const token = await getToken(messaging, {
                            vapidKey: "BM71MSQ3H6NRxuMvvPdtWPMtoz_allOynbIWDZeyikouwpmpAVdi29aRpyEYzIHP2KLRp0ttXi7EO3Cj08D-Lz0",
                            serviceWorkerRegistration: swReg,
                        });

                        console.log("FCM Token:", token);

                    } else {
                        console.warn("Firebase messaging not supported");
                    }
                }
            }
        } catch (err) {
            console.error("Permission denied or error", err);
        }
    };



    useEffect(() => {
        requestPermission()
    }, [])


    const router = useRouter()

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
    const search = () => {
        const fetchResults = async () => {

            try {
                setSearchLoading(true);
                const data = await api.get(`/product/findByName?name=${searchQuery}`, {
                    page,
                    size,
                    sortBy,
                    ascending
                });
                console.log(data)

                const newProducts = await getPhoto(data);
                setSearchResults((prev: any) =>
                    page != 0 ? [...prev, ...newProducts] : newProducts
                );
                // setTotalPages(res.totalPages || 1);
                setPage(data.number || 0);


                // setSearchResults(data?.content || []);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const handler = setTimeout(fetchResults, 400);

        return () => clearTimeout(handler);
    };

    return (
        pathname != '/auth' && <>
            <CssBaseline />

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    transition: 'transform 0.3s ease-in-out',
                    transform: hideHeader ? 'translateY(-100%)' : 'translateY(0)',
                    backdropFilter: 'blur(6px)', // Optional: adds a glass effect
                    borderBottom: '1px solid #dddddd'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', color: 'black' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Typography onClick={() => router.push('/')} variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                            <Box component="span" sx={{ color: "#0C4941" }}>VIA</Box>
                            <Box component="span" sx={{ color: "#000000" }}>mart</Box>
                        </Typography>

                        {/* Search bar visible only on md and up */}
                        {/* {!isMobile && ( */}
                        <Paper
                            component="form"
                            sx={{
                                p: '2px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                width: isMobile ? '100%' : 300,
                                backgroundColor: '#f1f3f4',
                                borderRadius: '20px',
                                boxShadow: 'none',
                            }}
                        >
                            <SearchIcon sx={{ color: 'gray' }} />
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                inputProps={{ 'aria-label': 'search' }}
                            />
                            {searchQuery != '' && <Button
                                variant="contained"
                                endIcon={<SearchIcon />}
                                onClick={search}
                            />}
                        </Paper>
                        {searchQuery.length > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1200,
                                    backgroundColor: '#fff',
                                    boxShadow: 3,
                                    borderRadius: 1,
                                    mt: 1,
                                    height: '100vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <Grid container spacing={1}>
                                    {searchResults?.map((p: any) => (
                                        <Grid size={6} key={p.id}>
                                            <Box key={p.id}><Product productItem={p} gridSize={6} /></Box>
                                        </Grid>
                                    ))}
                                    {searchLoading && <CircularProgress />}
                                </Grid>
                            </Box>
                        )}

                        {/* )} */}
                    </Box>

                    {isMobile ? (
                        <IconButton color="inherit" edge="end" onClick={toggleDrawer}>
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 0, width: '50%' }}>
                            {navItems.map((text) => (
                                <ListItem key={text.name}
                                    onClick={() => {
                                        if (text.name === 'Logout') {
                                            user.logout();
                                        } else if (text.name === 'Login') {
                                            router.push('/auth');
                                        } else {
                                            router.push(text.route);
                                        }
                                    }}>
                                    <ListItemText primary={text.name} />
                                </ListItem>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Drawer for Mobile */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={toggleDrawer}
                ModalProps={{ keepMounted: true }}
            >
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
                    <Box sx={{ placeItems: 'center', height: '10vh', alignContent: 'center', backgroundColor: '#dbdbdb' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                            <Box component="span" sx={{ color: "#0C4941" }}>VIA</Box>
                            <Box component="span" sx={{ color: "#000000" }}>mart</Box>
                        </Typography>
                    </Box>

                    <List>
                        {navItems.map((text) => (
                            <ListItem key={text.name}
                                onClick={() => {
                                    if (text.name === 'Logout') {
                                        user.logout();
                                    } else if (text.name === 'Login') {
                                        router.push('/auth');
                                    } else {
                                        router.push(text.route);
                                    }
                                }}>
                                <ListItemIcon>{text.icon}</ListItemIcon>
                                <ListItemText primary={text.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default TransparentResponsiveHeader;
