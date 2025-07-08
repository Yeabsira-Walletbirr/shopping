import { useState } from 'react';
import { useRouter } from 'next/router';
import API from '@/api';

const useDeleteHook = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const api = API();
  const [error, setError] = useState(null);

  const handleDelete = async (url, id) => {
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      // 'Content-Type': 'application/json',
    };

    setLoading(true);
    try {
      const response = await api.del(`${url}/${id}`);
      if (response?.status == 200) {

        // Navigate after successful deletion
        router.push(window.location.pathname.replace(/\/view\/.*/, ''));
      }
    } catch (err) {
      setError(e)
    } finally {
      setLoading(false);
    }
  };

  return { handleDelete, loading, error };
};

export default useDeleteHook;
