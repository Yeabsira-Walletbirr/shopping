'use client'
import CartPage from '@/components/cart';
import ProtectedRoute from '@/utils/protector';
import React, { useState } from 'react';


const CartScreen = () => {
  return (
    <ProtectedRoute>
      <CartPage/>
    </ProtectedRoute>
  );
};

export default CartScreen;
