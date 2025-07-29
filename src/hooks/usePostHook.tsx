import { useState } from 'react';
import API from '@/api';
import { useRouter } from 'next/navigation';

const usePostHook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = API();
  const router = useRouter();

  const handlePost = async (url:any, payload:any) => {
    setLoading(true);
    try {
      const response = await api.post(url, payload);
      if (response?.status == 200) {
        router.push(window.location.pathname.replace('add', ''));
      }
    } catch (err:any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { handlePost, loading, error };
};

export default usePostHook;
