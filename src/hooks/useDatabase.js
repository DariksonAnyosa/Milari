// hooks/useDatabase.js - Optimizado para SQLite en Electron
import { useEffect, useState } from 'react';
import { getDB } from '../database/DatabaseManager';

export const useDatabase = () => {
  const [db, setDb] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = getDB();
        setDb(database);
        setIsConnected(true);
      } catch (error) {
        console.error('Error conectando a SQLite:', error);
        setIsConnected(false);
      }
    };

    initDB();
  }, []);

  return { db, isConnected };
};