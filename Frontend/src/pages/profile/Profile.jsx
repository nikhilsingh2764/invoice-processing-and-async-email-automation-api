import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  User,
  Mail,
  ShieldCheck,
  Pencil,
  Lock,
  AlertTriangle,
} from "lucide-react";


import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import useAuthStore from "../../store/auth.store";


import {
  deactivateAccount,
  deleteAccount,
} from "../../services/auth.service";



function Profile() {


  const navigate = useNavigate();



  const {
    user,
    logout,
  } = useAuthStore();




  const [
    showDeactivateModal,
    setShowDeactivateModal
  ] = useState(false);



  const [
    showDeleteModal,
    setShowDeleteModal
  ] = useState(false);



  const [
    password,
    setPassword
  ] = useState("");






  const handleDeactivate = async () => {


    try {


      const response =
        await deactivateAccount();



      toast.success(
        response.message ||
        "Account deactivated"
      );



      logout();



      navigate("/login", {
        replace: true
      });



    }
    catch (error) {


      toast.error(
        error.response?.data?.message ||
        "Failed to deactivate account"
      );


    }


  };







  const handleDelete = async () => {


    try {


      const response =
        await deleteAccount({
          password
        });



      toast.success(
        response.message ||
        "Account deleted"
      );



      logout();



      navigate("/login", {
        replace: true
      });



    }
    catch (error) {


      toast.error(
        error.response?.data?.message ||
        "Failed to delete account"
      );


    }


  };





  if (!user) {

    return (

      <div className="flex h-[70vh] items-center justify-center">

        <p className="text-lg text-slate-500">
          User not found
        </p>

      </div>

    );

  }

  return (

    <div className="space-y-8">


      {/* Page Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          My Profile
        </h1>


        <p className="mt-2 text-slate-500">
          Manage your personal information, account security and preferences.
        </p>


      </div>





      {/* Profile Hero */}


      <Card className="overflow-hidden p-0">


        <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />



        <div className="-mt-16 flex flex-col items-center gap-6 px-8 pb-8 lg:flex-row lg:items-end lg:justify-between">


          <div className="flex flex-col items-center gap-5 lg:flex-row">



            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white text-5xl font-bold text-blue-600 shadow-xl">

              {user?.username?.charAt(0)?.toUpperCase() || "U"}

            </div>





            <div className="text-center lg:text-left">


              <h2 className="text-3xl font-bold text-slate-900">

                {user?.username}

              </h2>



              <p className="mt-2 flex items-center justify-center gap-2 text-slate-500 lg:justify-start">

                <Mail size={18} />

                {user?.email}

              </p>


            </div>



          </div>





          <Button

            onClick={() => navigate("/edit-profile")}

            className="flex items-center gap-2"

          >

            <Pencil size={18} />

            Edit Profile

          </Button>



        </div>


      </Card>







      {/* Information Cards */}


      <div className="grid gap-6 lg:grid-cols-2">





        {/* Personal Information */}


        <Card>


          <div className="mb-6 flex items-center gap-3">


            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

              <User size={22} />

            </div>



            <div>

              <h3 className="text-lg font-semibold">
                Personal Information
              </h3>


              <p className="text-sm text-slate-500">
                Your basic account information.
              </p>


            </div>


          </div>





          <div className="space-y-6">



            <div className="flex items-center justify-between border-b pb-4">


              <div>


                <p className="text-sm text-slate-500">
                  Username
                </p>


                <p className="mt-1 font-semibold text-slate-900">

                  {user?.username}

                </p>


              </div>


              <User
                size={20}
                className="text-slate-400"
              />


            </div>






            <div className="flex items-center justify-between border-b pb-4">


              <div>


                <p className="text-sm text-slate-500">
                  Email Address
                </p>


                <p className="mt-1 font-semibold text-slate-900">

                  {user?.email}

                </p>


              </div>


              <Mail
                size={20}
                className="text-slate-400"
              />


            </div>



          </div>



        </Card>








        {/* Account Status */}


        <Card>


          <div className="mb-6 flex items-center gap-3">


            <div className="rounded-xl bg-green-100 p-3 text-green-600">

              <ShieldCheck size={22} />

            </div>



            <div>

              <h3 className="text-lg font-semibold">
                Account Status
              </h3>


              <p className="text-sm text-slate-500">
                Current status of your account.
              </p>


            </div>


          </div>





          <div className="space-y-5">



            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">


              <span>
                Email Verification
              </span>



              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${user?.isVerified
                  ?
                  "bg-green-100 text-green-700"
                  :
                  "bg-red-100 text-red-700"
                  }`}
              >

                {
                  user?.isVerified
                    ?
                    "Verified"
                    :
                    "Not Verified"
                }

              </span>



            </div>







            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">


              <span>
                Account Status
              </span>



              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${user?.isActive
                  ?
                  "bg-blue-100 text-blue-700"
                  :
                  "bg-red-100 text-red-700"
                  }`}
              >

                {
                  user?.isActive
                    ?
                    "Active"
                    :
                    "Inactive"
                }

              </span>



            </div>






            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">


              <span>
                Membership
              </span>



              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">

                Free Plan

              </span>


            </div>



          </div>



        </Card>



      </div>

      {/* Security */}

      <Card>


        <div className="mb-6 flex items-center gap-3">


          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">

            <Lock size={22} />

          </div>


          <div>

            <h3 className="text-lg font-semibold">
              Security
            </h3>


            <p className="text-sm text-slate-500">
              Keep your account secure.
            </p>


          </div>


        </div>





        <div className="flex flex-col gap-4 md:flex-row">


          <Button
            onClick={() => navigate("/change-password")}
          >

            Change Password

          </Button>




          <Button
            variant="secondary"
            onClick={() => navigate("/edit-profile")}
          >

            Update Profile

          </Button>



        </div>


      </Card>







      {/* Danger Zone */}


      <Card className="border border-red-200">


        <div className="mb-6 flex items-center gap-3">


          <div className="rounded-xl bg-red-100 p-3 text-red-600">

            <AlertTriangle size={22} />

          </div>



          <div>

            <h3 className="text-lg font-semibold text-red-600">
              Danger Zone
            </h3>


            <p className="text-sm text-slate-500">
              These actions are irreversible.
            </p>


          </div>



        </div>





        <div className="space-y-5">



          <div className="flex flex-col justify-between gap-4 rounded-xl border p-5 lg:flex-row lg:items-center">


            <div>

              <h4 className="font-semibold">
                Deactivate Account
              </h4>


              <p className="mt-1 text-sm text-slate-500">
                Temporarily disable your account.
              </p>


            </div>



            <Button
              variant="secondary"
              onClick={() => setShowDeactivateModal(true)}
            >

              Deactivate

            </Button>



          </div>








          <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 p-5 lg:flex-row lg:items-center">


            <div>

              <h4 className="font-semibold text-red-600">
                Delete Account
              </h4>


              <p className="mt-1 text-sm text-slate-500">
                Permanently remove your account and all data.
              </p>


            </div>




            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >

              Delete Account

            </Button>




          </div>




        </div>


      </Card>









      {/* Deactivate Modal */}


      {
        showDeactivateModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">


            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">



              <div className="p-6">


                <h2 className="text-xl font-bold">
                  Deactivate Account
                </h2>


                <p className="mt-2 text-slate-500">
                  Your account will be temporarily disabled.
                </p>


              </div>





              <div className="flex justify-end gap-3 border-t p-6">


                <Button
                  variant="secondary"
                  onClick={() => setShowDeactivateModal(false)}
                >

                  Cancel

                </Button>



                <Button
                  onClick={handleDeactivate}
                >

                  Deactivate

                </Button>



              </div>



            </div>


          </div>


        )

      }








      {/* Delete Modal */}



      {
        showDeleteModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">


            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">



              <div className="border-b p-6">


                <h2 className="text-2xl font-bold text-red-600">
                  Delete Account
                </h2>


                <p className="text-sm text-slate-500">
                  This action cannot be undone.
                </p>


              </div>





              <div className="space-y-5 p-6">



                <ul className="list-disc space-y-2 pl-5 text-sm text-red-600">

                  <li>Business Profile</li>

                  <li>Customers</li>

                  <li>Products</li>

                  <li>Invoices</li>

                  <li>Account Information</li>

                </ul>







                <Input

                  type="password"

                  name="password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  placeholder="Enter password"

                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-red-500"


                />



              </div>






              <div className="flex justify-end gap-3 border-t p-6">


                <Button

                  variant="secondary"

                  onClick={() => {

                    setShowDeleteModal(false);

                    setPassword("");

                  }}

                >

                  Cancel

                </Button>





                <Button

                  variant="danger"

                  onClick={handleDelete}

                >

                  Delete

                </Button>



              </div>





            </div>


          </div>


        )

      }




    </div>


  );


}



export default Profile;