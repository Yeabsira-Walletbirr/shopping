"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import API from "@/api";
import FileUpload from "@/components/FIleUpload";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/utils/protector";
import MultiImageUpload from "@/components/imagesUpload";

const PRODUCT_TYPES = [
    { label: "ELECTRONICS", value: "ELECTRONICS" },
    { label: "GROCERY", value: "GROCERY" },
    { label: "FASHION", value: "FASHION" },
    { label: "FOOD", value: "FOOD" },
    { label: "HOME", value: "HOME" },
    { label: "OTHER", value: "OTHER" },
];

export default function EditProductForm({ params }) {
    const api = API();
    const { slug } = React.use(params); // assuming the route is /product/edit/[id]

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [price, setPrice] = useState(1);
    const [photo, setPhoto] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const [images, setImages] = useState([]);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/product/${slug}`);

                setName(res.title || "");
                setDescription(res.description || "");
                setType(res.type || "");
                setPrice(res.price || 0);
                setPhoto(res.photo || "");
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    const handleSubmit = async () => {
        const payload = {
            name,
            description,
            productType: type,
            price,
            photo,
            images
        };

        try {
            await api.put(`/product/${slug}`, payload);
            router.back()
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const onUploadSuccess = (response) => {
        setPhoto(response.fileTitle);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ProtectedRoute>
            <Box maxWidth="sm" mx="auto" mt={4}>
                <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Edit Product
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="Product Title"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <TextField
                                label="Product Type"
                                fullWidth
                                select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                {PRODUCT_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Price"
                                fullWidth
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                            />

                            <FileUpload label={"Replace Photo"} onUploadSuccess={onUploadSuccess} />
                            <MultiImageUpload
                                label="Additional Images"
                                maxImages={3}
                                onUploadSuccess={(images) => setImages(images)}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleSubmit}
                            >
                                Update Product
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </ProtectedRoute>

    );
}
