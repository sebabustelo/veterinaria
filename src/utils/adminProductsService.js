import { authenticatedFetch } from '@/utils/apiConfig';

export const fetchAdminProducts = async () => {
	const res = await authenticatedFetch('/products');
	if (!res.ok) throw new Error('Error al obtener productos');
	return res.json();
};

