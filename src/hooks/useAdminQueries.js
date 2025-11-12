import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/apiConfig';

const fetchProducts = async () => {
	throw new Error('fetchProducts está deshabilitado porque usamos productos locales');
};

const fetchAdminOrders = async () => {
	const token = localStorage.getItem('token');

	if (!token) {
		return [];
	}

	const response = await fetch(`${API_BASE_URL}/orders`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const text = await response.text().catch(() => response.statusText);
		throw new Error(text || `Error ${response.status}`);
	}

	return response.json();
};

export const useProductsQuery = () => {
	return useQuery({ queryKey: ['products'], queryFn: fetchProducts, enabled: false, staleTime: 60_000 });
};

export const useAdminProductsQuery = () => {
	return useQuery({
		queryKey: ['admin-products'],
		queryFn: async () => [],
		enabled: false,
		staleTime: 60_000,
	});
};

export const useAdminOrdersQuery = () => {
	return useQuery({
		queryKey: ['admin-orders'],
		queryFn: fetchAdminOrders,
		staleTime: 60_000,
		retry: false,
	});
};
