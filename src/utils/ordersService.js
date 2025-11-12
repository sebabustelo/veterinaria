import { authenticatedFetch } from './apiConfig';

export const fetchOrders = async () => {
	const response = await authenticatedFetch('/orders');
	if (!response.ok) throw new Error('Error al obtener órdenes');
	return response.json();
};

export const fetchUserOrders = async () => {
	const response = await authenticatedFetch('/orders/user');
	if (!response.ok) throw new Error('Error al obtener mis órdenes');
	return response.json();
};

