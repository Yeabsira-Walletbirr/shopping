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
} from "@mui/material";
import API from "@/api"; // your custom axios instance
import FileUpload from "@/components/FIleUpload";
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

export default function AddProductForm({ params }: any) {
    const api = API();
    const { slug }: any = React.use(params)

    const [name, setName]: any = useState("");
    const [description, setDescription]: any = useState("");
    const [productType, setProductType]: any = useState("");
    const [price, setPrice]: any = useState(1);
    const [photo, setPhoto]: any = useState('');
    const [images, setImages]: any = useState([]);
    const [quantity, setQuantity]: any = useState()
    const handleSubmit = async () => {
        const payload = {
            name,
            description,
            productType,
            place: { id: slug },
            price,
            photo,
            images,
            quantity
        };

        try {
            await api.post("/product", payload);
            setName("");
            setDescription("");
            setProductType("");
            setPhoto('')
            setPrice(0)
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };

    const onUploadSuccess = (response: any) => {
        setPhoto(response.fileName);
    }

    return (
        <ProtectedRoute>
            <Box maxWidth="sm" mx="auto" mt={4}>
                <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Add Product
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="Product Name"
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
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
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
                                rows={4}
                                value={price}
                                onChange={(e) => setPrice(e.target.value && parseInt(e.target.value))}
                            />
                            <TextField
                                label="Quantity"
                                fullWidth
                                type="number"
                                rows={4}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value && parseInt(e.target.value))}
                            />
                            <FileUpload label={'Upload Photo'} onUploadSuccess={onUploadSuccess} />

                            <MultiImageUpload
                                label="Additional Images"
                                maxImages={3}
                                onUploadSuccess={(images) => setImages(images)}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ backgroundColor: '#0C4941' }}
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </ProtectedRoute>

    );
}
