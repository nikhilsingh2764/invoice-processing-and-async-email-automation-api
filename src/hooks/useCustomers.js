import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer,
} from "../api/customer.service";

import { getErrorMessage } from "../utils/format";

export const useCustomers = () => {

    return useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            try {
                const res = await getCustomers();
                return res.data || [];
            } catch (error) {
                // Backend returns 404 when the user has zero customers.
                if (error?.response?.status === 404) return [];
                throw error;
            }
        },
    });
};

export const useSaveCustomer = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            id ? updateCustomer(id, data) : createCustomer(data),

        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success(variables.id ? "Customer updated" : "Customer added");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not save customer"));
        },
    });
};

export const useDeleteCustomer = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteCustomer(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer deleted");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not delete customer"));
        },
    });
};
