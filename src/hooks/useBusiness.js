import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
    createBusiness,
    getBusiness,
    updateBusiness,
} from "../api/business.service";

import { getErrorMessage } from "../utils/format";

export const useBusiness = () => {

    return useQuery({
        queryKey: ["business"],
        queryFn: async () => {
            try {
                const res = await getBusiness();
                return res.data;
            } catch (error) {
                // No business profile yet is a normal, expected state.
                if (error?.response?.status === 404) return null;
                throw error;
            }
        },
        retry: false,
    });
};

export const useSaveBusiness = (hasProfile) => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) =>
            hasProfile ? updateBusiness(data) : createBusiness(data),

        onSuccess: (res) => {
            queryClient.setQueryData(["business"], res.data);
            toast.success(
                hasProfile
                    ? "Business profile updated"
                    : "Business profile created"
            );
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not save business profile"));
        },
    });
};
