"use client";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Container,
    IconButton
} from "@mui/material";
import React, { useEffect, useState } from "react";
import API from "@/api";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker } from "@react-google-maps/api";
import EditIcon from '@mui/icons-material/Edit';
import { Add } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProtectedRoute from "@/utils/protector";


function ViewPlace({ params }) {
    const api = API();
    const router = useRouter();
    const { slug } = React.use(params);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [placeType, setPlaceType] = useState('');
    const [photo, setPhoto] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/place/${slug}`);
                if (res?.photo) {
                    const pic = await api.get(`/files/view/${res.photo}`, null, {
                        responseType: 'blob',
                    });
                    const imageObjectURL = URL.createObjectURL(pic);
                    setPhoto(imageObjectURL || '');

                }

                setName(res?.name || '');
                setAddress(res?.address || '');
                setPlaceType(res?.placeType || '');
                setDescription(res?.description || '');
                setLatitude(res?.latitude || null);
                setLongitude(res?.longitude || null);
            } catch { }
        };
        fetch();
    }, []);

    const defaultMapContainerStyle = {
        width: "100%",
        height: isMobile ? "250px" : "40vh",
        borderRadius: 12,
    };

    const defaultMapZoom = 18;

    const defaultMapCenter =
        latitude && longitude
            ? { lat: latitude, lng: longitude }
            : { lat: 8.991671, lng: 38.7804249 };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
    };

    return (
        <ProtectedRoute>
            <Container maxWidth="md">
                <Stack spacing={2} paddingY={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        {photo && (
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    image={photo}
                                    alt={name}
                                    sx={{
                                        width: "100%",
                                        height: isMobile ? 200 : 350,
                                        objectFit: "cover",
                                        borderTopLeftRadius: 12,
                                        borderTopRightRadius: 12,
                                    }}
                                />

                            </Box>
                        )}
                        <Box sx={{}}>
                            <Button
                                endIcon={<VisibilityIcon fontSize="small" />}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                                size="small"
                                onClick={() => {
                                    router.push(`/myPlace/view/${slug}/product`)
                                }}
                            >
                                View Items
                            </Button>
                            <Button
                                endIcon={<EditIcon fontSize="small" />}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                                size="small"
                                onClick={() => {
                                    router.push(`/myPlace/edit/${slug}`)
                                }}
                            >
                                Update Place
                            </Button>
                            <Button
                                endIcon={<Add fontSize="small" />}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                                size="small"
                                onClick={() => {
                                    router.push(`/product/add/${slug}`)
                                }}
                            >
                                Add Product
                            </Button>
                        </Box>


                        <CardContent>
                            <Typography variant="h6">Name</Typography>
                            <Typography gutterBottom>{name}</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6">Address</Typography>
                            <Typography gutterBottom>{address}</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6">Description</Typography>
                            <Typography gutterBottom>{description}</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6">Place Type</Typography>
                            <Typography gutterBottom>{placeType}</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                Location
                            </Typography>
                            <Box sx={{ overflow: 'hidden', borderRadius: 2 }}>
                                <GoogleMap
                                    mapContainerStyle={defaultMapContainerStyle}
                                    center={defaultMapCenter}
                                    zoom={defaultMapZoom}
                                    onClick={handleMapClick}
                                >
                                    {latitude && longitude && (
                                        <Marker position={{ lat: latitude, lng: longitude }} />
                                    )}
                                </GoogleMap>
                            </Box>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </ProtectedRoute>

    );
}

export default ViewPlace;
