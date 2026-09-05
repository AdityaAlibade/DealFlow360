import { useState, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // TODO: Implement standardized API caller with error handling
  const request = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Unexpected API error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, error, loading, request };
};

export default useApi;
