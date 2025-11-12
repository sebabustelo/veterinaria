import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/apiConfig';

const fetchProductById = async (id) => {
	const res = await fetch(`${API_BASE_URL}/products/${id}`);
	if (!res.ok) throw new Error('No se pudo cargar el producto');
	return res.json();
};

export const useProductByIdQuery = (id) => {
	return useQuery({ queryKey: ['product', id], queryFn: () => fetchProductById(id), enabled: !!id });
};
