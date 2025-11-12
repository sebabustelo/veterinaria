import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

const RealTimeContext = createContext();

export const useRealTime = () => {
    const context = useContext(RealTimeContext);
    if (!context) {
        throw new Error('useRealTime debe ser usado dentro de un RealTimeProvider');
    }
    return context;
};

export const RealTimeProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

    const POLLING_INTERVAL = 10000; // 10 segundos por defecto

    // Función para obtener productos
    const fetchProducts = async () => {
        try {
            console.log('RealTimeContext: Obteniendo productos...');
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                const data = await response.json();
                console.log('RealTimeContext: Productos obtenidos:', data.length);
                setProducts(data);
                setLastUpdate(new Date());
                setError(null);
                return data;
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('RealTimeContext: Error al obtener productos:', err);
            setError(err.message);
            return null;
        }
    };

    // Función para iniciar polling
    const startPolling = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        console.log('RealTimeContext: Iniciando polling');
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setLastUpdate(new Date());
                }
            } catch (error) {
                console.error('Error polling products:', error);
            }
        }, POLLING_INTERVAL);
        setPollingInterval(interval);
    }, [pollingInterval]);

    // Función para detener polling
    const stopPolling = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
            console.log('RealTimeContext: Deteniendo polling');
        }
    }, [pollingInterval]);

    // Función para forzar actualización
    const forceUpdate = async () => {
        console.log('RealTimeContext: Forzando actualización');
        return await fetchProducts();
    };

    const ENABLE_POLLING = false; // ponlo en false para debug

    // Iniciar polling automáticamente cuando se monta el componente
    useEffect(() => {
        if (ENABLE_POLLING) {
            startPolling();
        } else {
            stopPolling();
        }
    }, [ENABLE_POLLING, startPolling, stopPolling]);

    const value = {
        products,
        lastUpdate,
        loading: false, // Assuming loading is not directly managed here, but can be added if needed
        error,
        fetchProducts,
        startPolling,
        stopPolling,
        forceUpdate
    };

    return (
        <RealTimeContext.Provider value={value}>
            {children}
        </RealTimeContext.Provider>
    );
}; 