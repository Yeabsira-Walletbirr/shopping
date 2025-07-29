"use client";

import FileUpload from "@/components/FIleUpload";
import { Box, Button, Checkbox, ListItemText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import API from "@/api";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useUser } from "@/contexts/UserContext";
import ProtectedRoute from "@/utils/protector";

function EditPlace({ params }:any) {
    const api = API();
    const router = useRouter();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [placeType, setPlaceType]:any = useState([]);
    const [productTypes, setProductTypes]:any = useState([]);
    const [photo, setPhoto] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const user = useUser()

    const uploadSuccess = (response:any) => {
        setPhoto(response?.fileName);
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                name,
                address,
                placeType,
                productTypes,
                photo,
                description,
                latitude,
                longitude,
                ownerId: user?.user?.id
            };

            await api.post(`/place/create`, payload);
            router.back();
        } catch { }
    };

    const defaultMapContainerStyle = {
        width: '100%',
        height: '30vh',
        borderRadius: '15px 0px 0px 15px',
    };

    const defaultMapOptions = {
        zoomControl: true,
        tilt: 0,
        gestureHandling: 'auto',
        // mapTypeId: 'satellite',
    };

    const defaultMapZoom = 18;

    const defaultMapCenter = latitude && longitude
        ? { lat: latitude, lng: longitude }
        : { lat: 8.991671, lng: 38.7804249 };

    const handleMapClick = (e:any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
    };


    const PRODUCT_TYPES = [
        { label: "ELECTRONICS", value: "ELECTRONICS" },
        { label: "GROCERY", value: "GROCERY" },
        { label: "FASHION", value: "FASHION" },
        { label: "FOOD", value: "FOOD" },
        { label: "HOUSE", value: "HOUSE" },
        { label: "OTHER", value: "OTHER" },
    ];

    const categories = [
        { name: 'HOTEL', value: 'HOTEL' },
        { name: 'RESTAURANT', value: 'RESTAURANT' },
        { name: 'CAFE', value: 'CAFE' },
        { name: 'SUPERMARKET', value: 'SUPERMARKET' },
        { name: 'BOUTIQUE', value: 'BOUTIQUE' },
        { name: 'ELECTRONICS_STORE', value: 'ELECTRONICS_STORE' },
        { name: 'GENERAL_STORE', value: 'GENERAL_STORE' },
        { name: 'HOME_APPLIANCE_AND_FURNITURE', value: 'HOME_APPLIANCE_AND_FURNITURE' }
    ];

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setProductTypes(event.target.value as string[]);
    };

    return (
        <ProtectedRoute>
            <Stack spacing={2} padding={1}>
                <TextField
                    label="Name"
                    placeholder="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Address"
                    placeholder="Address"
                    fullWidth
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <Typography>Location:</Typography>
                <GoogleMap
                    mapContainerStyle={defaultMapContainerStyle}
                    center={defaultMapCenter}
                    zoom={defaultMapZoom}
                    // options={defaultMapOptions}
                    onClick={handleMapClick}
                >
                    {latitude && longitude && (
                        <Marker position={{ lat: latitude, lng: longitude }} />
                    )}
                </GoogleMap>
                <TextField
                    label="Description"
                    placeholder="Description"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label="Place Types"
                    fullWidth
                    select
                    value={placeType}
                    onChange={(e) => setPlaceType(e.target.value)}
                >
                    {categories.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            <ListItemText primary={type.name} />
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Product Types"
                    fullWidth
                    select
                    value={productTypes}
                    onChange={handleChange}
                    SelectProps={{
                        multiple: true,
                        renderValue: (selected) => (selected as string[]).join(', '),
                    }}
                >
                    {PRODUCT_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            <Checkbox checked={productTypes.indexOf(type.value) > -1} />
                            <ListItemText primary={type.label} />
                        </MenuItem>
                    ))}
                </TextField>
                <FileUpload label={'Upload Brand Logo'} onUploadSuccess={uploadSuccess} />

                <Button variant="contained" fullWidth onClick={handleUpdate}>
                    Save
                </Button>
            </Stack>
        </ProtectedRoute>

    );
}

export default EditPlace;
