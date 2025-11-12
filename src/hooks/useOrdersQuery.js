import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchUserOrders } from '@/utils/ordersService';

export const useOrdersQuery = () => {
	return useQuery({ queryKey: ['orders'], queryFn: fetchOrders, staleTime: 60_000 });
};

export const useUserOrdersQuery = () => {
	return useQuery({ queryKey: ['userOrders'], queryFn: fetchUserOrders, staleTime: 30_000 });
};
