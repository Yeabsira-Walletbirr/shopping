'use client';

import React from 'react';
import axios, { AxiosInstance } from 'axios';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_ADP_BASE_URL || '';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

const useCrudApi = () => {
  const router = useRouter()
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const showSuccess = (message: string) => showSnackbar(message, 'success');
  const showError = (message: string) => showSnackbar(message, 'error');

  // Always get the latest token
  const createApiInstance = (): AxiosInstance =>
    axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

  const authenticate = async (url: string, data: any) => {
    try {
      const response = await createApiInstance().post(url, data);
      return response.data;
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Authentication failed');
      throw error;
    }
  };

  const get = async (url: string, params?: any, config: any = {}) => {
    try {
      const response = await createApiInstance().get(url, {
        params,
        ...config, // ✅ allows responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.log(error)
      if (error.status == 401) {
        localStorage.clear()
        router.push('/auth')
      }
      showError(error?.response?.data?.message || 'Error fetching data');
      throw error;
    }
  };


  const post = async (url: string, data: any, config?: any) => {
    try {
      const response = await createApiInstance().post(url, data, {
        ...config, // ✅ allows responseType: 'blob'
      });
      showSuccess('Created successfully');
      return response.data;
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Error creating data');
      throw error;
    }
  };

  const put = async (url: string, data: any, config?: any) => {
    try {
      const response = await createApiInstance().put(url, data, {
        ...config
      });
      showSuccess('Updated successfully');
      return response.data;
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Error updating data');
      throw error;
    }
  };

  const del = async (url: string) => {
    try {
      const response = await createApiInstance().delete(url);
      showSuccess('Deleted successfully');
      return response.data;
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Error deleting data');
      throw error;
    }
  };

  const SnackbarComponent = (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        variant="filled"
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  return { get, post, put, del, authenticate, SnackbarComponent };
};

export default useCrudApi;
