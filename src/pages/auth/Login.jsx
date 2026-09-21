import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import GoogleLoginButton from "../../components/common/GoogleLoginButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { loginSchema } from "../../validation/auth.schema";
import { login,getProfile } from "../../services/auth.service";

import useAuthStore from "../../store/auth.store";



function Login() {


    const navigate = useNavigate();


    const loginUser = useAuthStore(
        (state) => state.login
    );



    const {
        register,
        handleSubmit,
        formState:{
            errors,
            isSubmitting
        }

    } = useForm({

        resolver:zodResolver(loginSchema),

        defaultValues:{

            email:"",
            password:""

        }

    });




const onSubmit = async (data) => {

    try {

        // Login (Backend sets accessToken & refreshToken cookies)
        const loginResponse = await login(data);

        // Fetch logged-in user
        const profileResponse = await getProfile();

        /*
            Expected Profile Response

            {
                statusCode: 200,
                message: "...",
                data: {
                    user
                }
            }

            OR

            {
                statusCode: 200,
                message: "...",
                data: user
            }

            Check your backend response and use the correct one.
        */

        loginUser(
            profileResponse.data
        );

        toast.success(
            loginResponse.message ||
            "Login successful"
        );

        navigate(
            "/dashboard",
            {
                replace: true,
            }
        );

    }
    catch (error) {

        console.log(
            "Login error:",
            error
        );

        toast.error(

            error.response?.data?.message ||

            error.response?.data?.errors?.[0]?.msg ||

            "Invalid email or password"

        );

    }

};





    return (

        <section
            className="
            flex
            min-h-[calc(100vh-64px)]
            items-center
            justify-center
            bg-slate-100
            px-4
            py-10
            "
        >



            <Card

                title="Welcome Back"

                subtitle="
                Login to manage your invoices and business.
                "

            >



                {/* Google Login */}


                <GoogleLoginButton />




                <div className="my-6 flex items-center">


                    <hr className="flex-1"/>


                    <span className="
                    px-4
                    text-sm
                    text-slate-500
                    ">
                        OR
                    </span>


                    <hr className="flex-1"/>


                </div>





                <form

                    onSubmit={
                        handleSubmit(onSubmit)
                    }

                    className="space-y-5"

                >





                    <Input


                        label="Email Address"


                        type="email"


                        placeholder="Enter your email"


                        autoComplete="email"


                        error={
                            errors.email?.message
                        }


                        {...register("email")}


                    />







                    <Input


                        label="Password"


                        type="password"


                        placeholder="Enter your password"


                        autoComplete="current-password"


                        error={
                            errors.password?.message
                        }


                        {...register("password")}


                    />






                    {/* Remember + Forgot */}


                    <div className="
                    flex
                    items-center
                    justify-between
                    ">



                        <label className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-600
                        ">


                            <input

                                type="checkbox"

                                className="
                                h-4
                                w-4
                                rounded
                                "

                            />


                            Remember me


                        </label>





                        <Link

                            to="/forgot-password"

                            className="
                            text-sm
                            font-medium
                            text-blue-600
                            hover:underline
                            "

                        >

                            Forgot Password?


                        </Link>




                    </div>







                    <Button

                        type="submit"

                        loading={
                            isSubmitting
                        }

                        className="w-full"

                    >

                        Login


                    </Button>







                    <p className="
                    text-center
                    text-sm
                    text-slate-600
                    ">


                        Don't have an account?{" "}



                        <Link

                            to="/signup"

                            className="
                            font-medium
                            text-blue-600
                            hover:underline
                            "

                        >

                            Create Account


                        </Link>



                    </p>






                </form>





            </Card>




        </section>


    );

}



export default Login;