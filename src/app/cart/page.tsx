'use client'
import CartPage from '@/components/cart';
import ProtectedRoute from '@/utils/protector';
import React, { useState } from 'react';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);

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
      <CartPage
        cart={cartItems}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onDelete={handleDelete}
      />
    </ProtectedRoute>
  );
};

export default CartScreen;
