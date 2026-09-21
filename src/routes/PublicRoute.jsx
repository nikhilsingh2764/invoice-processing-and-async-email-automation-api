import { Navigate } from "react-router-dom";

import Loader from "../components/common/Loader";

import useAuthStore from "../store/auth.store";

function PublicRoute({ children }) {

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    const isLoading = useAuthStore(
        (state) => state.isLoading
    );

    if (isLoading) {

        return <Loader fullScreen />;

    }

    if (isAuthenticated) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }

    return children;

}

export default PublicRoute;