import { useState } from 'react';
import { useRouter } from 'next/router';
import API from '@/api';

const usePutHook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = API();
  const router = useRouter();

  const handlePut = async (url, payload) => {
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    setLoading(true);
    try {
      const response = await api.put(url, payload);
      if (response?.status == 200) {
        const pathname = window.location.pathname
        if (/\/edit\/[^/]+$/.test(pathname)) {
          router.push(window.location.pathname.replace(/\/edit\/\d+$/, ""));

        } else if (/\/edit$/.test(pathname)) {
          router.push(window.location.pathname.replace('edit', ""));

        }
      }


    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { handlePut, loading, error };
};

export default usePutHook;
