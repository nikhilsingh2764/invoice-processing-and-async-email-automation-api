import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";


import toast from "react-hot-toast";


import {
  ArrowLeft,
} from "lucide-react";


import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";


import {
  changePassword
} from "../../services/auth.service";


import useAuthStore from "../../store/auth.store";



function ChangePassword(){


  const navigate = useNavigate();


  const logout = useAuthStore(
    state => state.logout
  );



  const [loading,setLoading] = useState(false);



  const [formData,setFormData] = useState({

    currentPassword:"",
    newPassword:"",
    confirmPassword:"",

  });





  const handleChange = (e) => {


    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });


  };






  const handleSubmit = async(e)=>{


    e.preventDefault();



    if(
      formData.newPassword !== 
      formData.confirmPassword
    ){

      toast.error(
        "Passwords do not match"
      );

      return;

    }




    if(formData.newPassword.length < 8){

      toast.error(
        "Password must contain minimum 8 characters"
      );

      return;

    }





    try{


      setLoading(true);



      const response = await changePassword({

        currentPassword:
        formData.currentPassword,


        newPassword:
        formData.newPassword,

      });





      toast.success(

        response.message ||
        "Password changed successfully"

      );





      logout();



      navigate("/login",{

        replace:true,

      });




    }
    catch(error){


      toast.error(

        error.response?.data?.message ||
        "Password change failed"

      );


    }
    finally{


      setLoading(false);


    }


  };







  return (


    <div className="space-y-8">



      <div>


        <button

          onClick={()=>navigate(-1)}

          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-900"

        >

          <ArrowLeft size={18}/>

          Back

        </button>





        <h1 className="text-3xl font-bold text-slate-900">

          Change Password

        </h1>



        <p className="mt-2 text-slate-500">

          Update your account password.

        </p>



      </div>







      <Card>



        <form

          onSubmit={handleSubmit}

          className="space-y-6"

        >




          {
            [

              {
                name:"currentPassword",
                label:"Current Password"
              },

              {
                name:"newPassword",
                label:"New Password"
              },

              {
                name:"confirmPassword",
                label:"Confirm New Password"
              }


            ].map((field)=>(


              <Input

                key={field.name}

                type="password"

                name={field.name}

                label={field.label}

                value={
                  formData[field.name]
                }

                onChange={handleChange}

                placeholder={field.label}

              />


            ))
          }





          <Button

            disabled={loading}

          >

            {
              loading
              ?
              "Updating..."
              :
              "Change Password"
            }


          </Button>





        </form>



      </Card>



    </div>


  );


}



export default ChangePassword;