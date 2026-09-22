import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../api/dashboard.service";

export const useDashboard = (params = {}) => {

    return useQuery({
        queryKey: ["dashboard", params],
        queryFn: async () => {
            const res = await getDashboard(params);
            return res.data;
        },
        placeholderData: (previous) => previous,
    });
};
