import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  const connect = () => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io(process.env.VITE_WS_URL || 'ws://localhost:8000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Listen for execution updates
    newSocket.on('execution-updated', (data) => {
      console.log('Execution updated:', data);
      // You can emit a custom event or use a state management solution here
      window.dispatchEvent(new CustomEvent('execution-updated', { detail: data }));
    });

    // Listen for workflow updates
    newSocket.on('workflow-updated', (data) => {
      console.log('Workflow updated:', data);
      window.dispatchEvent(new CustomEvent('workflow-updated', { detail: data }));
    });

    // Listen for notifications
    newSocket.on('notification', (data) => {
      console.log('Notification received:', data);
      window.dispatchEvent(new CustomEvent('notification', { detail: data }));
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  const value: SocketContextType = {
    socket,
    connected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 