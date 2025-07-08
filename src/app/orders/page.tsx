'use client'

import API from '@/api'
import TrendingProduct from '@/components/TrendingProduct'
import { useUser } from '@/contexts/UserContext'
import ProtectedRoute from '@/utils/protector'
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 10

const Order = () => {
    const api = API()
    const user = useUser()

    const [orders, setOrders] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const getPhoto = async (res: any) => {
        return await Promise.all(
            res?.content?.map(async (p: any) => {
                if (p?.product?.photo) {
                    try {
                        const blob = await api.get(`/files/view/${p?.product?.photo}`, null, {
                            responseType: 'blob',
                        })
                        const imageObjectURL = URL.createObjectURL(blob)
                        const product = { ...p.product, photoDataUrl: imageObjectURL }
                        return { ...p, product }
                    } catch (err) {
                        console.error('Photo load error:', err)
                        return { ...p }
                    }
                }
                return { ...p }
            })
        )
    }

    const fetchOrders = async (pageNumber = 0, append = false) => {
        if (loading || pageNumber >= totalPages) return
        setLoading(true)

        try {
            const res = await api.get(`/product/orders/${user?.user?.id}`, {
                page: pageNumber,
                size: PAGE_SIZE,
                sortBy: 'date',
                ascending: false,
            })

            const ordersWithPhotos = await getPhoto(res)
            if (append) {
                setOrders((prev) => [...prev, ...ordersWithPhotos])
            } else {
                setOrders(ordersWithPhotos)
            }
            setTotalPages(res.totalPages || 1)
            setPage(res.number || 0)
        } catch (err) {
            console.error('Error fetching orders:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.user?.id) {
            fetchOrders(0, false)
        }
    }, [user?.user?.id])

    const handleScroll = async () => {
        if (!scrollRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

        if (scrollTop + clientHeight >= scrollHeight - 100) {
            await fetchOrders(page + 1, true)
        }
    }
    const formatted = (isoString: string) => {
        if (isoString)
            return dayjs(isoString.slice(0, 23)).format("MMMM D, YYYY h:mm:ss A");
    }

    return (
        <ProtectedRoute>
            <Card sx={{ boxShadow: 0 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Your Orders
                    </Typography>

                    <Stack
                        spacing={2}
                        ref={scrollRef}
                        sx={{
                            height: '93.1vh',
                            overflowY: 'auto',
                            p: 1,
                            scrollbarWidth: 'none',
                        }}
                        onScroll={handleScroll}
                    >
                        {orders.length > 0 ? (
                            orders.map((x) => (
                                <div key={x?.id}>
                                    <Typography paddingY={2} fontWeight={'700'} >{formatted(x?.date)}</Typography>
                                    <Stack spacing={2}>
                                        <Stack direction={'row'}>
                                            <Typography fontWeight={'700'} >Name:</Typography>
                                            <Typography >{x?.product?.title}</Typography>
                                        </Stack>
                                        
                                        <Stack direction={'row'}>
                                            <Typography fontWeight={'700'} >Place:</Typography>
                                            <Typography >{x?.product?.place?.name}</Typography>
                                        </Stack>
                                        
                                        <Stack direction={'row'}>
                                            <Typography fontWeight={'700'} >Type:</Typography>
                                            <Typography >{x?.product?.type}</Typography>
                                        </Stack>
                                        <Stack direction={'row'}>
                                            <Typography fontWeight={'700'} >Quantity:</Typography>
                                            <Typography >{x?.quantity}</Typography>
                                        </Stack>
                                        <Stack direction={'row'}>
                                            <Typography fontWeight={'700'} >Status:</Typography>
                                            <Typography >{x?.status}</Typography>
                                        </Stack>
                                    </Stack>

                                    <Divider sx={{ paddingY: 2 }} />
                                </div>
                            ))
                        ) : (
                            <Typography>No orders available</Typography>
                        )}

                        {loading && <Typography>Loading...</Typography>}
                    </Stack>
                </CardContent>
            </Card >
        </ProtectedRoute>

    )
}

export default Order
