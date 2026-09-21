import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import GoogleLoginButton from "../../components/common/GoogleLoginButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";


import {
    signupSchema
} from "../../validation/auth.schema";


import {
    signup
} from "../../services/auth.service";



function Signup() {


    const navigate = useNavigate();




    const {

        register,

        handleSubmit,

        formState:{
            errors,
            isSubmitting
        }


    } = useForm({


        resolver:zodResolver(
            signupSchema
        ),


        defaultValues:{

            username:"",

            email:"",

            password:""

        }


    });







    const onSubmit = async(data)=>{


        try{


            const response = await signup(data);




            toast.success(

                response.message ||
                "Account created successfully"

            );




            sessionStorage.setItem(

                "verifyEmail",

                response.data?.email

            );




            navigate("/verify-otp");




        }
        catch(error){



            console.log(
                "Signup Error:",
                error
            );



            toast.error(

                error.response?.data?.message ||

                error.response?.data?.errors?.[0]?.msg ||

                "Signup failed"

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


                title="Create Account"


                subtitle="
                Join InvoicePilot and manage your invoices easily.
                "


            >





                {/* Google Signup */}



                <GoogleLoginButton />







                <div className="
                my-6
                flex
                items-center
                ">


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


                        label="Username"


                        placeholder="Enter username"


                        autoComplete="username"


                        error={
                            errors.username?.message
                        }


                        {...register("username")}


                    />









                    <Input


                        label="Email Address"


                        type="email"


                        placeholder="Enter email"


                        autoComplete="email"


                        error={
                            errors.email?.message
                        }


                        {...register("email")}


                    />









                    <Input


                        label="Password"


                        type="password"


                        placeholder="Create password"


                        autoComplete="new-password"


                        error={
                            errors.password?.message
                        }


                        {...register("password")}


                    />









                    <Button


                        type="submit"


                        loading={
                            isSubmitting
                        }


                        className="w-full"


                    >

                        Create Account


                    </Button>









                    <p className="
                    text-center
                    text-sm
                    text-slate-600
                    ">


                        Already have an account?{" "}



                        <Link


                            to="/login"


                            className="
                            font-medium
                            text-blue-600
                            hover:underline
                            "


                        >

                            Login


                        </Link>




                    </p>






                </form>






            </Card>






        </section>



    );

}



export default Signup;