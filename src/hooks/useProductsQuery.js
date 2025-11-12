import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/apiConfig';

const fetchProducts = async () => {
	const res = await fetch(`${API_BASE_URL}/products`);
	if (!res.ok) throw new Error('Error al obtener productos');
	return res.json();
};

export const useProductsQuery = () => {
	return useQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 });
};
