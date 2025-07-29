'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    CircularProgress,
    Button,
    Badge,
    IconButton,
} from '@mui/material';
import API from '@/api';
import { useRouter } from 'next/navigation';
import { Add } from '@mui/icons-material';
import ProtectedRoute from '@/utils/protector';

export default function PlaceList() {
    const [places, setPlaces]:any = useState([]);
    const [loading, setLoading] = useState(false);
    const api = API();
    const router = useRouter();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const jsonUser = localStorage.getItem('user');
                if (!jsonUser) return;

                const user = JSON.parse(jsonUser);
                const data = await api.get(`/place/user/${user.id}`);

                const placesWithPhotos = await Promise.all(
                    data.map(async (place:any) => {
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

                setPlaces(placesWithPhotos);
            } catch (e) {
                console.error('Error fetching places:', e);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    return (
        <ProtectedRoute>
            <Box display="flex" flexDirection="column" sx={{ padding: 2 }} gap={2}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    places.map((place:any) => (
                        <Card key={place.id} onClick={() => router.push(`/myPlace/view/${place.id}`)} sx={{ cursor: 'pointer', display: 'flex' }}>
                            {place.photoDataUrl && (
                                <CardMedia
                                    component="img"
                                    style={{ width: 150 }}
                                    image={place.photoDataUrl}
                                    alt={place.name}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6">{place.name}</Typography>
                                <Typography variant="body2" color="textSecondary">{place.placeType}</Typography>
                                <Typography variant="body2" color="textSecondary">{place.address}</Typography>
                                <Typography variant="body2" color="textSecondary">{place.description}</Typography>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Box sx={{ position: 'fixed', bottom: 100, right: 20, zIndex: 1000 }}>
                    <IconButton
                        onClick={() => router.push('/myPlace/add')}
                        sx={{
                            background: '#ffa600',
                            color: '#fff',
                            fontWeight: 600,
                            px: 3,
                            py: 3,
                            borderRadius: '100%',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            '&:hover': {
                                background: '#e59400',
                            },
                        }}

                    ><Add />
                    </IconButton>
                </Box>
            </Box>
        </ProtectedRoute>

    );
}
