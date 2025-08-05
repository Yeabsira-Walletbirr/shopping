'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface LocationContextType {
    latitude: number;
    setLatitude: (lat: number) => void;
    longitude: number;
    setLongitude: (lng: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function LocationProvider({ children }: { children: ReactNode }) {
    const [latitude, setLatitude] = useState(0.0);
    const [longitude, setLongitude] = useState(0.0);
    const prevLat = useRef<number>(0.0);
    const prevLng = useRef<number>(0.0);

    useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude: newLat, longitude: newLng } = position.coords;
                    const distance = getDistanceFromLatLonInKm(prevLat.current, prevLng.current, newLat, newLng);

                    if (distance >= 1 || (prevLat.current === 0 && prevLng.current === 0)) {
                        setLatitude(newLat);
                        setLongitude(newLng);
                        prevLat.current = newLat;
                        prevLng.current = newLng;
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10000,
                    timeout: 5000,
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            console.warn('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        <LocationContext.Provider
            value={{
                latitude,
                setLatitude,
                longitude,
                setLongitude,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
