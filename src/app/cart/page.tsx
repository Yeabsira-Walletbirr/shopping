'use client'
import CartPage from '@/components/cart';
import ProtectedRoute from '@/utils/protector';
import React, { useState } from 'react';


type CartItem = {
  title: string;
  quantity: number;
};

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAdd = (title: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.title === title
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleRemove = (title: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.title === title && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleDelete = (title: string) => {
    setCartItems((prev) => prev.filter((item) => item.title !== title));
  };

  return (
    <ProtectedRoute>
      <CartPage/>
    </ProtectedRoute>
  );
};

export default CartScreen;
