import { useEffect } from "react";

import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";

import {
    getProfile
} from "./services/auth.service";

import useAuthStore from "./store/auth.store";

function App() {

    const {

        setUser,

        clearUser,

        setLoading,

    } = useAuthStore();

    useEffect(() => {

        const initializeAuth = async () => {

            try {

                setLoading(true);

                const response = await getProfile();

                /*
                    If your API returns:

                    {
                        data: user
                    }

                    use:

                    setUser(response.data);

                    If it returns:

                    {
                        data: {
                            user
                        }
                    }

                    use:

                    setUser(response.data.user);
                */

                setUser(response.data);

            }
            catch {

                clearUser();

            }

        };

        initializeAuth();

    }, []);

    return (
        <>

            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={12}
                toastOptions={{
                    duration: 3500,

                    style: {
                        borderRadius: "14px",
                        padding: "14px 18px",
                        fontSize: "15px",
                    },

                    success: {
                        iconTheme: {
                            primary: "#2563eb",
                            secondary: "#ffffff",
                        },
                    },

                    error: {
                        iconTheme: {
                            primary: "#dc2626",
                            secondary: "#ffffff",
                        },
                    },
                }}
            />

            <AppRoutes />

        </>
    );

}

export default App;