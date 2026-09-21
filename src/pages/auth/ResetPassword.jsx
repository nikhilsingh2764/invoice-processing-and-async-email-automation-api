import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";


import {
    useForm
} from "react-hook-form";


import {
    zodResolver
} from "@hookform/resolvers/zod";


import {
    toast
} from "react-hot-toast";



import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";



import {
    resetPassword
} from "../../services/auth.service";


import {
    resetPasswordSchema
} from "../../validation/auth.schema";






function ResetPassword(){



    const navigate = useNavigate();



    const [searchParams] = useSearchParams();



    const email = searchParams.get(
        "email"
    );







    const {

        register,

        handleSubmit,

        formState:{
            errors,
            isSubmitting
        }


    } = useForm({



        resolver:zodResolver(
            resetPasswordSchema
        ),



        defaultValues:{


            otp:"",


            newPassword:"",


            confirmPassword:""


        }


    });








    const onSubmit = async(data)=>{


        try{



            const response = await resetPassword({


                email,


                otp:data.otp,


                newPassword:data.newPassword



            });







            toast.success(

                response.message ||

                "Password reset successfully"

            );






            navigate(
                "/login",
                {
                    replace:true
                }
            );






        }
        catch(error){



            console.log(
                "Reset Password Error:",
                error
            );



            toast.error(


                error.response?.data?.message ||

                error.response?.data?.errors?.[0]?.msg ||

                "Failed to reset password"



            );


        }


    };








    if(!email){



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


                    title="Invalid Request"


                    subtitle="
                    Password reset link is missing or expired.
                    "


                >



                    <Link to="/forgot-password">


                        <Button className="w-full">


                            Request New OTP


                        </Button>


                    </Link>



                </Card>



            </section>


        );


    }









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



                title="Reset Password"



                subtitle="
                Enter OTP and create your new password.
                "



            >






                <form



                    onSubmit={
                        handleSubmit(onSubmit)
                    }



                    className="space-y-5"



                >








                    <Input



                        label="Email"



                        value={email}



                        disabled



                    />









                    <Input



                        label="OTP"



                        placeholder="Enter 6-digit OTP"



                        maxLength={6}



                        autoComplete="one-time-code"



                        error={
                            errors.otp?.message
                        }



                        {...register("otp")}



                    />









                    <Input



                        label="New Password"



                        type="password"



                        placeholder="Create new password"



                        autoComplete="new-password"



                        error={
                            errors.newPassword?.message
                        }



                        {...register("newPassword")}



                    />









                    <Input



                        label="Confirm Password"



                        type="password"



                        placeholder="Confirm new password"



                        autoComplete="new-password"



                        error={
                            errors.confirmPassword?.message
                        }



                        {...register("confirmPassword")}



                    />









                    <Button



                        type="submit"



                        loading={
                            isSubmitting
                        }



                        className="w-full"



                    >


                        Reset Password



                    </Button>








                    <p className="
                    text-center
                    text-sm
                    text-slate-600
                    ">



                        Remember your password?{" "}





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




export default ResetPassword;