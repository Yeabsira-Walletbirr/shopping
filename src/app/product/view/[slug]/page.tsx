"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Divider,
    Typography,
    Stack,
    Alert,
    Button,
    Checkbox,
    IconButton,
} from "@mui/material";
import API from "@/api";


import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from "next/navigation";

import DiscountIcon from '@mui/icons-material/Discount';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProtectedRoute from "@/utils/protector";
import { Check, CheckBox, CheckBoxOutlineBlank, Close } from "@mui/icons-material";

export default function ViewProduct({ params }:any) {
    const router = useRouter()
    const api = API();
    const { slug }:any = React.use(params);

    const [product, setProduct]:any = useState(null);
    const [imageUrl, setImageUrl]:any = useState('');
    const [loading, setLoading]:any = useState(true);
    const [error, setError]:any = useState("");

    const [showDiscountModal, setShowDiscountModal]:any = useState(false);
    const [newDiscountPrice, setNewDiscountPrice]:any = useState(product?.price || '');
    const [discountSelected, setDiscountSelected]:any = useState(false);

    const [statusColor, setStatusColor]:any = useState('white')

    const [images, setImages]:any = useState([])


    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const fetchImage = async (name: string) => {
        try {
            const fileRes = await api.get(`/files/view/${name}`, null, {
                responseType: 'blob',
            });
            return fileRes
        }
        catch (e) {
            console.log(e)
        }

    }
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/product/${slug}`);
                setProduct(res);

                if (res.status == 'APPROVED') {
                    setStatusColor('green')
                }
                if (res.status == 'UNAPPROVED') {
                    setStatusColor('#ffc300')
                }
                if (res.status == 'DECLINED') {
                    setStatusColor('red')
                }

                if (res.status == 'VERIFIED') {
                    setStatusColor('green')
                }

                if (res.images?.length > 0) {
                    res?.images.forEach(async (image:any) => {
                        const fileRes = await fetchImage(image)
                        const img = URL.createObjectURL(fileRes);
                        if (images.length < 3)
                            images.push(img)
                    });

                }


                // Optional: fetch image as blob if necessary
                if (res.photo) {
                    try {
                        const fileRes = await api.get(`/files/view/${res.photo}`, null, {
                            responseType: 'blob',
                        });
                        const img = URL.createObjectURL(fileRes);
                        setImageUrl(img);
                        setDiscountSelected(res?.discount)
                    } catch {
                        setImageUrl("");
                    }
                }
            } catch (err) {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={4}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box mt={4}>
                <Alert severity="info">Product not found</Alert>
            </Box>
        );
    }

    const setOutOfStock = async (e:any) => {
        try {
            if (e.target.checked) {
                setProduct((prev:any) => ({
                    ...prev,
                    outOfStock: true,
                }));
            } else {
                setProduct((prev:any) => ({
                    ...prev,
                    outOfStock: false,
                }));
            }
            await api.put(`/product/outOfStock/${slug}`, e.target.checked, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }
        catch (e) {
            console.error(e)
        }
    }

    const submit = async () => {
        try {
            api.put(`/product/discount/${slug}`, newDiscountPrice, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            setProduct((prev:any) => ({
                ...prev,
                price: newDiscountPrice,
                discount: true
            }));
            setShowDiscountModal(false)
        }
        catch (e) {
            console.error(e)
        }
    }


    return (
        <ProtectedRoute>
            <Box maxWidth="sm" mx="auto" >
                <Card sx={{ boxShadow: 0 }}>
                    {imageUrl && (
                        <CardMedia
                            component="img"
                            image={imageUrl}
                            alt={product.name}
                            sx={{ objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12, height: 350 }}
                        />
                    )}

                    {/* Thumbnail Scrollable Image Gallery */}
                    {images?.length > 0 && (
                        <Box sx={{ overflowX: 'auto', scrollbarWidth: 'none', display: 'flex', gap: 1, px: 2, mt: 2, placeContent: 'center' }}>
                            {images.map((x:any, index:any) => (
                                <CardMedia
                                    key={index}
                                    component="img"
                                    image={x}
                                    alt={`IMG-${index}`}
                                    sx={{
                                        objectFit: "cover",
                                        height: 80,
                                        width: 80,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        boxShadow: 1,
                                        border: '1px solid #ccc',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                    onClick={() => {
                                        setPreviewImage(x);
                                        setPreviewOpen(true);
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Box sx={{ position: 'absolute', top: 100, right: 8, display: 'flex', gap: 1 }}>
                        <Button
                            endIcon={<EditIcon fontSize="small" />}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                            }}
                            size="small"
                            onClick={() => router.push(`/product/edit/${slug}`)}
                        >
                            Update Product
                        </Button>

                        <FormControlLabel
                            control={
                                <Checkbox

                                    checked={product?.discount}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setProduct((prev:any) => ({
                                                ...prev,
                                                discount: true,
                                            }));
                                            setShowDiscountModal(true)
                                        } else {
                                            setProduct((prev:any) => ({
                                                ...prev,
                                                discount: false,
                                            }));
                                        }
                                    }}
                                    icon={<DiscountIcon sx={{ color: 'gray' }} />}
                                    checkedIcon={<DiscountIcon sx={{ color: 'orange' }} />}
                                />
                            }
                            label=""
                        />
                        <FormControlLabel
                            sx={{ color: '#f00' }}
                            control={
                                <Checkbox
                                    checked={product?.outOfStock}
                                    onChange={(e) => {
                                        setOutOfStock(e)
                                    }}
                                    // icon={<CheckBox sx={{ color: 'gray' }} />}
                                    // checkedIcon={<CheckBoxOutlineBlank sx={{ color: 'orange' }} />}
                                />
                            }
                            label="Out of stock"
                        />
                    </Box>

                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h5" gutterBottom>
                                {product.title}
                            </Typography>

                            <Typography sx={{ borderRadius: 2, backgroundColor: statusColor, color: 'white', p: 1 }} fontWeight={700} gutterBottom>
                                {product.status}
                            </Typography>
                        </Box>


                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1}>
                            <Box>
                                <Typography variant="body1" fontWeight={'700'}>Description:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body1" fontWeight={'700'}>Product Type:</Typography>
                                <Typography variant="body2">{product.type}</Typography>
                            </Box>

                            {!product?.discount && <Box>
                                <Typography variant="body1" fontWeight={'700'}>Price:</Typography>
                                <Typography variant="body2">{product.price} ETB</Typography>
                            </Box>}

                            <Box>
                                <Typography variant="body1" fontWeight={'700'}>Place:</Typography>
                                <Typography variant="body2">
                                    {product.place?.name || "N/A"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body1" fontWeight={'700'}>Discount ?:</Typography>
                                <Typography variant="body2">
                                    {product.discount + ''}
                                </Typography>
                            </Box>

                            {product.discount &&
                                <Stack direction={'row'} spacing={4}>
                                    <Stack spacing={1} direction={'column'}>
                                        <Typography variant="body1" fontWeight={'700'}>Old Price:</Typography>
                                        <Typography variant="body2">
                                            {product.oldPrice + 'ETB'}
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={1} direction={'column'}>

                                        <Typography variant="body1" fontWeight={'700'}>Current Price:</Typography>
                                        <Typography variant="body2">
                                            {product.price + 'ETB'}
                                        </Typography>
                                    </Stack>
                                </Stack>}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                    boxShadow: 2,
                                    p: 1,
                                    borderRadius: 5
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton>
                                        <FavoriteBorderIcon color="error" />
                                    </IconButton>
                                    <Typography variant="body2">{product?.like}</Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton>
                                        <ChatBubbleOutlineIcon color="primary" />
                                    </IconButton>
                                    <Typography variant="body2">{product?.comment}</Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton>
                                        <VisibilityIcon sx={{ color: 'grey' }} />
                                    </IconButton>
                                    <Typography variant="body2">{product?.rate}</Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Modal
                    open={showDiscountModal}
                    onClose={() => {
                        setShowDiscountModal(false);
                        setProduct((prev:any) => ({
                            ...prev,
                            discount: false,
                        }));
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            borderRadius: 2,
                            p: 4,
                            width: 300,
                        }}
                    >
                        <Typography variant="body1" fontWeight={'700'} mb={2}>Set Discount Price</Typography>
                        <TextField
                            placeholder={product.price}
                            label="New Price"
                            fullWidth
                            type="number"
                            value={newDiscountPrice}
                            onChange={(e) => setNewDiscountPrice(e.target.value)}
                        />

                        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                            <Button variant="outlined" onClick={() => {
                                setShowDiscountModal(false);
                                setProduct((prev:any) => ({
                                    ...prev,
                                    discount: false,
                                }));
                            }}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    if (product.price <= newDiscountPrice) {
                                        alert('new price can not be greater than or equals the old price')
                                    } else {
                                        submit();
                                    }

                                }}
                            >
                                Submit
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
                <Modal
                    sx={{ p: 5 }}
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                >
                    <Box
                        sx={{
                            // position: 'absolute',
                            // top: '50%',
                            // left: '50%',
                            // transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 1,
                            borderRadius: 2,
                            // maxWidth: '90vw',
                            // maxHeight: '90vh',
                            outline: 'none',
                        }}
                    >
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
                        />
                    </Box>
                </Modal>

            </Box>

        </ProtectedRoute>

    );
}
