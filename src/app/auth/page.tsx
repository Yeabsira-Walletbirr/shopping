'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import usePostHook from '@/hooks/usePostHook';
import API from '@/api'
import { useUser } from '@/contexts/UserContext';

import { messaging, initializeMessaging } from '@/utils/firebase';

import { getToken, onMessage } from "firebase/messaging";

export default function PhoneAuth() {
  const router = useRouter()
  const [step, setStep] = useState<'enterPhone' | 'enterOTP' | 'enterName'>('enterPhone');
  const [isSignup, setIsSignup] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const api = API()
  const user = useUser()

  useEffect(() => {
    console.log(user)
    if (user?.isAuthenticated == true) {
      router.push('/home')
    }
  }, [])

  const handleSendOTP = async () => {

    if (!phone) return alert('Please enter a valid phone number');
    if (isSignup) {
      try {
        const res = await api.authenticate('/auth/signup', { fullName: name, email: email, phone: phone })
        setStep('enterOTP');

      }
      catch (e) {
        alert(e)

      }
    } else {
      try {
        const res = await api.authenticate('/auth/login', { identifier: phone, method: 'PHONE_NUMBER' })
        setStep('enterOTP');

      }
      catch {

      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return alert('Enter OTP');
    // Simulate OTP check

    try {
      const res = await api.authenticate('/auth/verify', { identifier: phone, otp: otp })
      requestPermission(res)
      user.login(res)
      router.push('/')
    }
    catch (e) {
      console.log(e)
    }
  };

  const requestPermission = async (u:any) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const permission = await Notification.requestPermission();
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    if (permission === "granted") {
      await initializeMessaging();
      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: "BM71MSQ3H6NRxuMvvPdtWPMtoz_allOynbIWDZeyikouwpmpAVdi29aRpyEYzIHP2KLRp0ttXi7EO3Cj08D-Lz0",
        serviceWorkerRegistration: swReg,
      });

      console.log("FCM Token:", token);
      u['fcmToken'] = token;
      user.updateProfile(u);
      await api.put(`/dispatcher/updateFcm/${u?.id}`, { token });
    }
  } catch (err) {
    console.error("Permission denied or error", err);
  }
};


  const handleSignupFinish = () => {
    if (!name) return alert('Enter your name');
    alert(`Welcome ${name}! You’ve signed up successfully.`);
  };

  return (
    !user?.isAuthenticated &&
    <Box minHeight="60vh" display="flex" justifyContent="center" alignItems="center" px={2}>
      <Card sx={{ p: 4, borderRadius: 3, boxShadow: 5, maxWidth: 400, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ color: 'orange' }} variant="h3" fontWeight="bold" gutterBottom textAlign="center">
            VIA
          </Typography>
          <Typography sx={{ color: 'black' }} variant="h3" fontWeight="bold" gutterBottom textAlign="center">
            mart
          </Typography>
        </div>

        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          {isSignup ? 'Create your account' : 'Welcome back!'}
        </Typography>

        {isSignup ?
          <>
            {step === 'enterPhone' &&
              <Stack spacing={2}>
                <TextField
                  label="Phone Number"
                  placeholder="Phone Number"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  label="Full Name"
                  placeholder="Full Name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  label="Email"
                  placeholder="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="body2" textAlign="center">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <Button variant="text" size="small" onClick={() => setIsSignup(!isSignup)}>
                      {isSignup ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </Typography>
                </>

                <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleSendOTP}>
                  Send OTP
                </Button>
              </Stack>
            }
            {step === 'enterOTP' && (
              <Stack spacing={2}>
                <TextField
                  label="OTP Code"
                  placeholder="123456"
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleVerifyOTP}>
                  Verify OTP
                </Button>
              </Stack>
            )}
          </>
          :

          <>
            {step == 'enterPhone' &&
              <>
                <Stack spacing={2}>
                  <TextField
                    label="Phone Number"
                    placeholder="+251 912 345 678"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleSendOTP}>
                    Send OTP
                  </Button>
                </Stack>
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="body2" textAlign="center">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <Button variant="text" size="small" onClick={() => setIsSignup(!isSignup)}>
                      {isSignup ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </Typography>
                </>
              </>
            }
            {step === 'enterOTP' && (
              <Stack spacing={2}>
                <TextField
                  label="OTP Code"
                  placeholder="123456"
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleVerifyOTP}>
                  Verify OTP
                </Button>
              </Stack>
            )}
          </>

        }

        {/* {step === 'enterPhone' && (
          <Stack spacing={2}>
            <TextField
              label="Phone Number"
              placeholder="+251 912 345 678"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleSendOTP}>
              Send OTP
            </Button>
          </Stack>
        )}

        {step === 'enterOTP' && (
          <Stack spacing={2}>
            <TextField
              label="OTP Code"
              placeholder="123456"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button sx={{ backgroundColor: 'orange' }} variant="contained" fullWidth onClick={handleVerifyOTP}>
              Verify OTP
            </Button>
          </Stack>
        )}

        {step === 'enterName' && isSignup && (
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              placeholder="John Doe"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="contained" fullWidth onClick={handleSignupFinish}>
              Finish Sign Up
            </Button>
          </Stack>
        )}

        {step === 'enterPhone' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" textAlign="center">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <Button variant="text" size="small" onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Button>
            </Typography>
          </>
        )} */}
      </Card>
    </Box >
  );
}
