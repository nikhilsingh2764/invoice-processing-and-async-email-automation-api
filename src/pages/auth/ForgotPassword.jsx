import {
    useNavigate,
    Link
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
    forgotPassword
} from "../../services/auth.service";


import {
    forgotPasswordSchema
} from "../../validation/auth.schema";





function ForgotPassword(){



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
            forgotPasswordSchema
        ),



        defaultValues:{


            email:""


        }


    });








    const onSubmit = async(data)=>{


        try{



            const response = await forgotPassword(
                data
            );





            toast.success(

                response.message ||

                "OTP sent successfully"

            );






            navigate(

                `/reset-password?email=${encodeURIComponent(
                    data.email
                )}`

            );






        }
        catch(error){



            console.log(
                "Forgot Password Error:",
                error
            );



            toast.error(


                error.response?.data?.message ||

                error.response?.data?.errors?.[0]?.msg ||

                "Failed to send OTP"


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



                title="Forgot Password"



                subtitle="
                Enter your email and we will send you a password reset OTP.
                "



            >







                <form



                    onSubmit={
                        handleSubmit(onSubmit)
                    }



                    className="space-y-5"



                >







                    <Input




                        label="Email Address"



                        type="email"



                        placeholder="Enter your registered email"



                        autoComplete="email"



                        error={
                            errors.email?.message
                        }



                        {...register("email")}



                    />









                    <Button



                        type="submit"



                        loading={
                            isSubmitting
                        }



                        className="w-full"



                    >


                        Send OTP



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





export default ForgotPassword;