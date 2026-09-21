import { create } from "zustand";

const useAuthStore = create((set) => ({

    // ==========================
    // State
    // ==========================

    user: null,

    isAuthenticated: false,

    isLoading: true,

    // ==========================
    // Actions
    // ==========================

    setLoading: (loading) => {

        set({
            isLoading: loading,
        });

    },

    setUser: (user) => {

        set({

            user,

            isAuthenticated: true,

            isLoading: false,

        });

    },

    clearUser: () => {

        set({

            user: null,

            isAuthenticated: false,

            isLoading: false,

        });

    },

    login: (user) => {

        set({

            user,

            isAuthenticated: true,

            isLoading: false,

        });

    },

    logout: () => {

        set({

            user: null,

            isAuthenticated: false,

            isLoading: false,

        });

    },

}));

export default useAuthStore;