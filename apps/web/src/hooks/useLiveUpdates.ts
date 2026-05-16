import { useState, useEffect, useCallback } from 'react';

interface LiveUpdate {
  type: string;
  content?: string;
  url?: string;
  timestamp: number;
}

interface UseLiveUpdatesReturn {
  updates: LiveUpdate[];
  isPolling: boolean;
  error: string | null;
}

export const useLiveUpdates = (
  sessionId: number,
  interval: number = 2000
): UseLiveUpdatesReturn => {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const fetchUpdates = useCallback(async () => {
    setIsPolling(true);
    try {
      // Mock: Simulate live updates
      const mockUpdates: LiveUpdate[] = [
        {
          type: 'suggestion',
          content: 'Mock live suggestion ' + Date.now(),
          timestamp: Date.now()
        }
      ];
      
      // In production: fetch from /co-creation/live-updates/{sessionId}/
      // const response = await fetch(`/api/co-creation/live-updates/${sessionId}/?last_update=${lastUpdate}`);
      // const data = await response.json();
      // if (data.updates.length > 0) {
      //   setUpdates(prev => [...prev, ...data.updates]);
      //   setLastUpdate(data.timestamp);
      // }
      
      setUpdates(prev => [...prev, ...mockUpdates]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch live updates');
    } finally {
      setIsPolling(false);
    }
  }, [sessionId, lastUpdate]);

  useEffect(() => {
    // Initial fetch
    fetchUpdates();
    
    // Set up polling
    const intervalId = setInterval(fetchUpdates, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchUpdates, interval]);

  return { updates, isPolling, error };
};
