'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
    id: number;
    quantity: number;
    placeId: number;
    price: number;
};

type CartContextType = {
    cartItemsByPlace: { [placeId: number]: CartItem[] };
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number, placeId: number) => void;
    deleteFromCart: (id: number, placeId: number) => void;
    getItemCount: (id: number, placeId: number) => number;
    getTotalItems: (placeId?: number) => number;
    getTotalPrice: (placeId?: number) => number;
    getAllPlaces: () => number[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItemsByPlace, setCartItemsByPlace] = useState<{ [placeId: number]: CartItem[] }>({});

    const getAllPlaces = (): number[] => {
        return Object.keys(cartItemsByPlace).map(id => parseInt(id));
    };


    const addToCart = (item: CartItem) => {
        setCartItemsByPlace(prev => {
            const current = prev[item.placeId] || [];
            const existing = current.find(i => i.id === item.id);
            let updated: CartItem[];

            if (existing) {
                updated = current.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            } else {
                updated = [...current, { ...item }];
            }

            return { ...prev, [item.placeId]: updated };
        });
    };

    const removeFromCart = (id: number, placeId: number) => {
        setCartItemsByPlace(prev => {
            const current = prev[placeId] || [];
            const updated = current.map(i =>
                i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
            ).filter(i => i.quantity > 0);
            return { ...prev, [placeId]: updated };
        });
    };

   const deleteFromCart = (id: number, placeId: number) => {
    setCartItemsByPlace(prev => {
        const current = prev[placeId];
        if (!current) return prev;
        const updated = current.filter(i => i.id !== id);
        if (updated.length === 0) {
            const { [placeId]: _, ...rest } = prev;
            return rest;
        }

        return { ...prev, [placeId]: updated };
    });
};

    const getItemCount = (id: number, placeId: number) => {
        return cartItemsByPlace[placeId]?.find(i => i.id === id)?.quantity || 0;
    };

    const getTotalItems = (placeId?: number) => {
        if (placeId != null) {
            return cartItemsByPlace[placeId]?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        }
        return Object.values(cartItemsByPlace).flat().reduce((sum, i) => sum + i.quantity, 0);
    };

    const getTotalPrice = (placeId?: number) => {
        const allItems = placeId != null ? cartItemsByPlace[placeId] || [] : Object.values(cartItemsByPlace).flat();

        return allItems.reduce((sum, i) => {
            const price =i.price
            return sum + i.quantity * price;
        }, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItemsByPlace,
                addToCart,
                removeFromCart,
                deleteFromCart,
                getItemCount,
                getTotalItems,
                getTotalPrice,
                getAllPlaces
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
