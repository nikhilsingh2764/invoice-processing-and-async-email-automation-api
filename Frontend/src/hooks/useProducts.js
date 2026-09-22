import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from "../api/product.service";

import { getErrorMessage } from "../utils/format";

export const useProducts = () => {

    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            try {
                const res = await getProducts();
                return res.data || [];
            } catch (error) {
                if (error?.response?.status === 404) return [];
                throw error;
            }
        },
    });
};

export const useSaveProduct = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            id ? updateProduct(id, data) : createProduct(data),

        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success(variables.id ? "Product updated" : "Product added");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not save product"));
        },
    });
};

export const useDeleteProduct = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteProduct(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not delete product"));
        },
    });
};
