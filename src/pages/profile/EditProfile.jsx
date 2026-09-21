import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  User,
  Save,
  ArrowLeft,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import useAuthStore from "../../store/auth.store";

import {
  updateProfile,
} from "../../services/auth.service";


function EditProfile(){


  const navigate = useNavigate();


  const {
    user,
    setUser,
  } = useAuthStore();



  const [loading,setLoading] = useState(false);



  const [username,setUsername] = useState(
    user?.username || ""
  );





  const handleSubmit = async(e)=>{

    e.preventDefault();


    try{


      setLoading(true);



      const response = await updateProfile({

        username

      });



      // update zustand + localStorage

      setUser(response.data);



      toast.success(
        "Username updated successfully"
      );



      navigate("/profile");



    }
    catch(error){


      toast.error(

        error.response?.data?.message ||

        "Profile update failed"

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

onClick={()=>navigate("/profile")}

className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-900"

>

<ArrowLeft size={18}/>

Back to Profile

</button>



<h1 className="text-3xl font-bold text-slate-900">

Edit Profile

</h1>


<p className="mt-2 text-slate-500">

Update your username information.

</p>


</div>






<Card>


<form

onSubmit={handleSubmit}

className="space-y-6"

>



<div>


<label className="mb-2 block text-sm font-medium">

Username

</label>



<div className="relative">


<User

size={20}

className="absolute left-3 top-3.5 text-slate-400"

/>




<input

name="username"

value={username}

onChange={(e)=>setUsername(e.target.value)}

className="w-full rounded-xl border px-11 py-3 outline-none focus:border-blue-500"

/>



</div>



</div>







<Button

disabled={loading}

className="flex items-center gap-2"

>


<Save size={18}/>


{

loading

?

"Saving..."

:

"Save Changes"

}


</Button>



</form>



</Card>




</div>


);


}


export default EditProfile;