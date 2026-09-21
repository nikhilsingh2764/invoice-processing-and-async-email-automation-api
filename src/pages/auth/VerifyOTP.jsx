import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

import {
    verifyOtpSchema
} from "../../validation/auth.schema";


import {
    verifyOtp
} from "../../services/auth.service.js";


import {
    useNavigate,
    Navigate
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




function VerifyOTP() {


    const navigate = useNavigate();



    const email = sessionStorage.getItem(
        "verifyEmail"
    );




    if(!email){

        return (
            <Navigate
                to="/signup"
                replace
            />
        );

    }







    const {
        register,
        handleSubmit,
        formState:{
            errors,
            isSubmitting
        }

    } = useForm({


        resolver:zodResolver(
            verifyOtpSchema
        ),


        defaultValues:{

            otp:""

        }


    });









    const onSubmit = async(data)=>{


        try{


            const response = await verifyOtp({


                email,


                otp:data.otp


            });






            toast.success(

                response.message ||
                "OTP verified successfully"

            );






            sessionStorage.removeItem(
                "verifyEmail"
            );






            navigate("/login",{

                replace:true

            });







        }
        catch(error){



            console.log(
                "Verify OTP Error:",
                error
            );



            toast.error(

                error.response?.data?.message ||

                "Invalid OTP"

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


                title="Verify OTP"


                subtitle={
                    `Enter the verification code sent to ${email}`
                }


            >





                <form


                    onSubmit={
                        handleSubmit(onSubmit)
                    }


                    className="space-y-5"


                >






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








                    <Button


                        type="submit"


                        loading={
                            isSubmitting
                        }


                        className="w-full"


                    >

                        Verify OTP


                    </Button>







                    <p className="
                    text-center
                    text-sm
                    text-slate-500
                    ">


                        Didn't receive OTP?


                        <button

                            type="button"

                            className="
                            ml-1
                            font-medium
                            text-blue-600
                            hover:underline
                            "

                        >

                            Resend OTP

                        </button>



                    </p>






                </form>





            </Card>






        </section>


    );

}



export default VerifyOTP;