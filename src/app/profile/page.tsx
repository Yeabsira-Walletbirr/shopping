'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {Grid} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '@/contexts/UserContext';
import ProtectedRoute from '@/utils/protector';

interface User {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  orders: number;
  joined: string;
}

const mockUser: User = {
  name: 'Yeabsira Tesfaye',
  email: 'yeabsira@example.com',
  phone: '+251 911 123 456',
  location: 'Addis Ababa, Ethiopia',
  orders: 12,
  joined: 'March 2024',
};

const UserProfile = () => {
  const user:any = useUser();

  return (
    <ProtectedRoute>
      <Box maxWidth={800} mx="auto" px={2} py={4}>
        <Card elevation={4} sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={user?.user?.avatarUrl}
                sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
              >
                {user?.user?.fullName?.[0]}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight="bold">
                  {user?.user?.fullName}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Member since {user?.user?.joined}
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Edit Profile
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <InfoItem icon={<EmailIcon />} label="Email" value={user?.user?.email} />
              <InfoItem icon={<PhoneIcon />} label="Phone" value={user?.user?.phoneNumber} />
              <InfoItem
                icon={<LocationOnIcon />}
                label="Location"
                value={user?.user?.location}
              />
              <InfoItem
                icon={<AccountCircleIcon />}
                label="Total Orders"
                value={`${user?.user?.orders} orders`}
              />
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </ProtectedRoute>

  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Grid size={{xs:12, sm:6}}>
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <Typography fontWeight={600}>{label}:</Typography>
      <Typography>{value}</Typography>
    </Stack>
  </Grid>
);

export default UserProfile;
