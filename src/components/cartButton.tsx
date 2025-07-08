'use client'
import { Button, Box, Badge } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';

const YourCartButton = () => {
  const router = useRouter();
  const { cartItemsByPlace } = useCart(); // Assuming it's an object: { [placeId]: CartItem[] }

  const pathname = usePathname();
  const [totalItems, setTotalItems] = useState(0);
  const user = useUser()

  useEffect(() => {
    if (cartItemsByPlace) {
      const total = Object.values(cartItemsByPlace).flat().reduce((sum, item) => sum + item.quantity, 0);
      setTotalItems(total);
    }
  }, [cartItemsByPlace]);

  return (
    (pathname !== '/cart' && pathname !== '/auth' && user.isAuthenticated) &&
     (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Button
          onClick={() => router.push('/cart')}
          variant="contained"
          sx={{
            background: '#ffa600',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': {
              background: '#e59400',
            },
          }}
          startIcon={
            <Badge
              badgeContent={totalItems}
              color="error"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            >
              <ShoppingBagOutlinedIcon />
            </Badge>
          }
        >
          Your Cart
        </Button>
      </Box>
    )
  );
};

export default YourCartButton;
