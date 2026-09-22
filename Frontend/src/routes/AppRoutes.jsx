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

import Business from "../pages/business/Business";
import Customers from "../pages/customers/Customers";
import Products from "../pages/products/Products";

import Invoices from "../pages/invoices/Invoices";
import InvoiceCreate from "../pages/invoices/InvoiceCreate";
import InvoiceEdit from "../pages/invoices/InvoiceEdit";
import InvoiceView from "../pages/invoices/InvoiceView";

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";
import NotFound from "../pages/profile/NotFound";

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
                    path="/business"
                    element={<Business />}
                />


                <Route
                    path="/customers"
                    element={<Customers />}
                />


                <Route
                    path="/products"
                    element={<Products />}
                />


                <Route
                    path="/invoices"
                    element={<Invoices />}
                />


                <Route
                    path="/invoices/new"
                    element={<InvoiceCreate />}
                />


                <Route
                    path="/invoices/:id"
                    element={<InvoiceView />}
                />


                <Route
                    path="/invoices/:id/edit"
                    element={<InvoiceEdit />}
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


            {/* =====================
                Fallback
            ====================== */}

            <Route
                path="*"
                element={<NotFound />}
            />


        </Routes>

    );

}


export default AppRoutes;
