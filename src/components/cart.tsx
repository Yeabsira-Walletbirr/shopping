'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  Container,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useCart } from '@/contexts/CartContext';
import AddFoodToCartCard from './AddFoodToCart';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import API from '@/api';

const CartPage = () => {
  const api = API();
  const {
    cartItemsByPlace,
    getTotalPrice,
    getTotalItems,
    getAllPlaces,
  } = useCart();
  const router = useRouter();

  const [cartProductsByPlace, setCartProductsByPlace] = useState<{ [placeId: number]: any[] }>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const placeIds = getAllPlaces();
        const allData: { [placeId: number]: any[] } = {};

        for (const placeId of placeIds) {
          const parsed = await Promise.all(
            cartItemsByPlace[placeId]?.map(async (x) => {
              const data = await api.get(`/product/${x.id}`);
              const res = await api.get(`/files/view/${data.photo}`, null, {
                responseType: 'blob',
              });
              const imageObjectURL = URL.createObjectURL(res);
              data['photoDataUrl'] = imageObjectURL
              return { ...data, quantity: x?.quantity ?? 0, placeId };
            })
          );
          allData[placeId] = parsed;
        }

        setCartProductsByPlace(allData);
      } catch (err) {
        console.error('Failed to fetch cart products:', err);
      }
    };

    fetch();
  }, [cartItemsByPlace]);

  const placeNameFromProduct = (product: any) => product?.place?.name || `Place ${product.placeId}`;

  return (
    <Container maxWidth="md" sx={{ py: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography color='black' variant="h6" fontWeight="bold">
            Your Cart
          </Typography>
        </Box>
        <Chip
          label={getTotalItems()}
          sx={{ color: 'orange' }}
          icon={<ShoppingBagOutlinedIcon />}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {Object.keys(cartProductsByPlace).length === 0 ? (
        <Typography color="text.secondary">Your cart is empty.</Typography>
      ) : (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, scrollbarWidth: 'none' }}>
          {Object.entries(cartProductsByPlace).map(([placeId, items]) => {
            const placeName = items?.[0]?.place?.name || `Place ${placeId}`;
            const total = getTotalPrice(Number(placeId));
            return (
              <Accordion key={placeId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography fontWeight="bold">{placeName}</Typography>
                    <Chip
                      label={`${items.length} items`}
                      sx={{ ml: 1, background: '#ffa600', color: '#fff' }}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {items.map((item: any) => (
                      <Box key={item.id}>
                        <AddFoodToCartCard {...item} />
                      </Box>
                    ))}
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight="bold">Total for {placeName}</Typography>
                      <Typography fontWeight="bold">{total} ETB</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ borderRadius: 3, backgroundColor: 'orange' }}
                      onClick={() => {
                        // console.log(`Checkout for place ${placeId}`, cartItemsByPlace[Number(placeId)]);
                        router.push(`/checkout/${placeId}`)
                      }}
                    >
                      Checkout for {placeName}
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default CartPage;
