import { useMutation } from '@tanstack/react-query';
import { createOrder } from '@/utils/apiConfig';

export const useCreateOrderMutation = () => {
	return useMutation({
		mutationFn: (orderData) => createOrder(orderData),
	});
};
