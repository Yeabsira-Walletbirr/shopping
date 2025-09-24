'use client';
import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import API from '@/api'

type Props = {
    label?: string;
    maxImages?: number;
    onUploadSuccess?: (images: string[]) => void;
};

const MultiImageUpload: React.FC<Props> = ({ label = 'Upload Images', maxImages = 5, onUploadSuccess }) => {

    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const api = API()

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        const selectedFiles = Array.from(event.target.files || []);
        const remainingSlots = maxImages - images.length;












        if (selectedFiles.length > remainingSlots) {
            alert(`You can upload only ${remainingSlots} more image(s).`);
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        const validFiles = selectedFiles.filter(file => allowedTypes.includes(file.type));

        if (validFiles.length === 0) {
            alert('Only PNG, JPG, and JPEG images are allowed.');
            return;
        }


        try {
            const uploadedImages: string[] = [];

            for (const file of validFiles) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const fileName = res?.fileName;
                if (fileName) uploadedImages.push(fileName);
            }

            const updated = [...images, ...uploadedImages];
            setImages(updated);
            onUploadSuccess?.(updated);

            const filesToAdd = selectedFiles.slice(0, remainingSlots);

            const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

            setImages(updated);
            setPreviews(prev => [...prev, ...newPreviews]);

            event.target.value = '';
        } catch (err) {
            console.error('Upload error:', err);
            alert('Image upload failed.');
        } finally {
            setLoading(false);
        }














    };


    const handleRemove = (index: number) => {
        setImages(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        setPreviews(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index]); // clean up blob
            updated.splice(index, 1);
            return updated;
        });
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography fontWeight={'700'} mb={2}>
                {label} (Max {maxImages})
            </Typography>

            <Button
                sx={{ backgroundColor: '#0C4941', mb: 2 }}
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={images.length >= maxImages}
            >
                {label}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleChange}
                />
            </Button>

            {images.length > 0 && (
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    {previews.map((src, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
                                width: 100,
                                height: 100,
                                border: '1px solid #ccc',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={src}
                                alt={`preview-${index}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleRemove(index)}
                                sx={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    backgroundColor: '#fff',
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default MultiImageUpload;
