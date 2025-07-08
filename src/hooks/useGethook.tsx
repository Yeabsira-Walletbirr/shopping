import { useState, useEffect } from 'react';
import API from '@/api';
import { useRouter } from 'next/navigation';

const useGethook = (urls,dependencies) => {

  const api = API();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          urls.map((url) =>
            api.get(url)
          )
        );
        const resultData = responses.map((response) => response.data);

        setData(resultData);
      } catch (err) {
        
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router,dependencies]);

  return { data, loading, error };
};

export default useGethook;
