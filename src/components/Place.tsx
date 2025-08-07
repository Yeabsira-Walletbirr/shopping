import { Box, Card, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StraightenIcon from '@mui/icons-material/Straighten';
import { Star } from "@mui/icons-material";
type PlaceItem = {
    id: number,
    name: string,
    address: string,
    placeType: string,
    description: string,
    photo: string,
    latitude: number,
    longitude: number,
    productTypes: any,
    photoDataUrl: any,
    distance: any,
    rating: number
};
const Place = (placeItem: PlaceItem) => {
    const router = useRouter()
    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
                minWidth: 300,
                // maxWidth: 320,
                my: 2,
                flexShrink: 0,
                boxShadow: 4
            }}
            onClick={() => router.push(`/place/${placeItem.id}`)}
        >
            <CardMedia
                component="img"
                image={placeItem?.photoDataUrl}
                alt={placeItem.name}
                sx={{
                    width: 'auto',
                    height: 130,
                    objectFit: 'contain',
                    borderRadius: 2,
                    mr: 2,
                }}
            />
            <Box>
                <Typography fontWeight="bold">{placeItem.name}</Typography>

                <Stack direction="row" spacing={1} mb={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <StraightenIcon sx={{ fontSize: 14 }} />
                        <Typography fontSize={11}>{placeItem?.distance?.toFixed(2)} KM</Typography>
                    </Stack>
                    {/* <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography fontSize={11}>20 minuites</Typography>
                    </Stack> */}
                </Stack>

                {placeItem?.rating != 0 && <Typography fontWeight="bold" fontSize={13}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Star sx={{ fontSize: 14, color:'orange' }} />
                        <Typography fontSize={11}>{placeItem?.rating}</Typography>
                    </Stack>
                </Typography>}
            </Box>
        </Card>
    )
}
export default Place;