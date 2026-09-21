import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layout/publicLayout/publicLayout";
import DashboardLayout from "../layout/privateLayout/privateLayout";

import Home from "../pages/auth/Home";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";


function AppRoutes() {

    return (

        <Routes>


            {/* =====================
                Public Routes
            ====================== */}

            <Route element={<PublicLayout />}>

                <Route
                    path="/"
                    element={<Home />}
                />


                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />


                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />


                <Route
                    path="/verify-otp"
                    element={<VerifyOTP />}
                />


                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />


                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

            </Route>




            {/* =====================
                Protected Routes
            ====================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >


                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />


                <Route
                    path="/profile"
                    element={<Profile />}
                />


                <Route
                    path="/edit-profile"
                    element={<EditProfile />}
                />


                <Route
                    path="/change-password"
                    element={<ChangePassword />}
                />


            </Route>



        </Routes>

    );

}


export default AppRoutes;