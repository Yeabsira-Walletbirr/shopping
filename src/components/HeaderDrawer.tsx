'use client'
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
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
   import { messaging } from '@/utils/firebase';
    import { getToken, onMessage } from "firebase/messaging";

// const navItems = ['Home', 'Shop', 'Contact'];

const TransparentResponsiveHeader = () => {
    const pathname = usePathname()
    const user = useUser()

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [hideHeader, setHideHeader] = useState(false);

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
            const permission = await Notification.requestPermission();
            const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            if (permission === "granted") {
                const token = await getToken(messaging, {
                    vapidKey: "BM71MSQ3H6NRxuMvvPdtWPMtoz_allOynbIWDZeyikouwpmpAVdi29aRpyEYzIHP2KLRp0ttXi7EO3Cj08D-Lz0", // From Firebase Console
                    serviceWorkerRegistration: swReg,
                });
                console.log("FCM Token:", token);
            }
        } catch (err) {
            console.error("Permission denied or error", err);
        }
    };

    useEffect(() => {
        requestPermission()
    }, [])


    const router = useRouter()

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
                            <Box component="span" sx={{ color: "#ff6c00" }}>VIA</Box>
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
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </Paper>
                        {/* )} */}
                    </Box>

                    {isMobile ? (
                        <IconButton color="inherit" edge="end" onClick={toggleDrawer}>
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            {navItems.map((item) => (
                                <Typography key={item.name} sx={{ cursor: 'pointer' }}>
                                    {item.name}
                                </Typography>
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
                            <Box component="span" sx={{ color: "#ff6c00" }}>VIA</Box>
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
