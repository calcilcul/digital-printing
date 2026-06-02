import React, { useEffect, useRef } from 'react';
import { Platform, DeviceEventEmitter } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';

const getWsUrl = () => {
  if (process.env.EXPO_PUBLIC_WS_URL) return process.env.EXPO_PUBLIC_WS_URL;
  if (Platform.OS === 'android') return 'ws://10.0.2.2:8000/ws';
  return 'ws://localhost:8000/ws';
};

export default function WebSocketHandler() {
  const { token } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnects = 5;

  useEffect(() => {
    if (!token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const connect = () => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        reconnectAttempts.current = 0; // Reset on success
      };

      ws.onmessage = (event) => {
        console.log('[WebSocket] Message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          let toastType: 'success' | 'error' | 'info' | 'error' | 'success' | 'warning' = 'info';
          
          if (data.event === 'payment_approved' || data.event === 'design_approved' || data.event === 'order_ready') {
            toastType = 'success';
          } else if (data.event === 'payment_rejected') {
            toastType = 'error';
          } else if (data.event === 'design_revision') {
            toastType = 'warning';
          }

          Toast.show({
            type: toastType,
            text1: data.title || 'Notifikasi',
            text2: data.message || event.data,
            visibilityTime: 4000,
          });

          if (data.order_id) {
            DeviceEventEmitter.emit('order_updated', {
              orderId: Number(data.order_id),
              event: data.event,
            });
          }
        } catch (e) {
          Toast.show({
            type: 'info',
            text1: 'Notifikasi Baru',
            text2: event.data,
            visibilityTime: 4000,
          });

          // Fallback parsing of order ID from string if it contains "Order #12" or similar
          const orderIdMatch = event.data.match(/Order #(\d+)/i);
          if (orderIdMatch && orderIdMatch[1]) {
            DeviceEventEmitter.emit('order_updated', {
              orderId: Number(orderIdMatch[1]),
              event: 'unknown',
            });
          }
        }
      };

      ws.onerror = (error) => {
        console.log('[WebSocket] Error:', error);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        wsRef.current = null;

        if (token && reconnectAttempts.current < maxReconnects) {
          reconnectAttempts.current += 1;
          console.log(`[WebSocket] Reconnecting in 3s... (Attempt ${reconnectAttempts.current}/${maxReconnects})`);
          setTimeout(connect, 3000);
        } else if (reconnectAttempts.current >= maxReconnects) {
          console.log('[WebSocket] Max reconnect attempts reached. Stopping reconnect.');
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token]);

  return null; // This component does not render anything
}
