import { GoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";


const GoogleLoginButton = () => {


    const login = useAuthStore(
        (state)=>state.login
    );


    const navigate = useNavigate();



    const handleGoogleSuccess = async(
        credentialResponse
    )=>{


        try{


            const response = await api.post(
                "/google",
                {
                    idToken:
                    credentialResponse.credential
                }
            );



            login(
                response.data.data
            );


            navigate("/dashboard");



        }
        catch(error){


            console.error(
                "Google Login Error:",
                error.response?.data || error
            );


        }


    };




    return (

        <GoogleLogin

            onSuccess={
                handleGoogleSuccess
            }

            onError={
                ()=>{
                    console.log(
                        "Google Login Failed"
                    )
                }
            }

            useOneTap={false}

        />

    );


};


export default GoogleLoginButton;