'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';

const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return 'ws://localhost:5001';
};
const WS_URL = getWsUrl();
export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const setGenerationStatus = useAssignmentStore((s) => s.setGenerationStatus);
  const fetchAssignment = useAssignmentStore((s) => s.fetchAssignment);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'job:completed') {
            setGenerationStatus('completed');
            if (data.assignmentId) fetchAssignment(data.assignmentId);
          } else if (data.type === 'job:failed') {
            setGenerationStatus('failed');
          } else if (data.type === 'job:started' || data.type === 'job:progress') {
            setGenerationStatus('processing');
          }
        } catch {}
      };
      ws.onclose = () => {
        reconnectTimer.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    } catch {}
  }, [setGenerationStatus, fetchAssignment]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);
}
