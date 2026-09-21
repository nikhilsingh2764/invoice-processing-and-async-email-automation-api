import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import Container from "../common/Container";
import Logo from "../common/Logo";


const Footer = () => {

  return (

    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">

      <Container>


        {/* Main Footer */}

        <div className="grid gap-12 py-16 lg:grid-cols-5">


          {/* Company */}


          <div className="lg:col-span-2">


            <Logo />


            <p className="mt-6 max-w-md leading-7 text-slate-400">

              InvoicePilot helps businesses create professional
              invoices, manage customers, organize products,
              download PDF invoices and send invoices through
              email with a modern, secure platform.

            </p>



            <div className="mt-8 flex gap-4">


              <a
                href="#"
                className="rounded-xl border border-slate-700 p-3 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >

                <FaGithub size={20}/>

              </a>



              <a
                href="#"
                className="rounded-xl border border-slate-700 p-3 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >

                <FaLinkedin size={20}/>

              </a>


              <a
                href="mailto:support@invoicepilot.com"
                className="rounded-xl border border-slate-700 p-3 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >

                <Mail size={20}/>

              </a>


            </div>


          </div>





          {/* Product */}


          <div>


            <h3 className="mb-6 text-lg font-bold text-white">
              Product
            </h3>


            <ul className="space-y-4">


              <li>

                <a
                  href="#features"
                  className="hover:text-white"
                >
                  Features
                </a>

              </li>



              <li>

                <a
                  href="#how-it-works"
                  className="hover:text-white"
                >
                  How It Works
                </a>

              </li>



              <li>

                <Link
                  to="/login"
                  className="hover:text-white"
                >
                  Login
                </Link>

              </li>



              <li>

                <Link
                  to="/signup"
                  className="hover:text-white"
                >
                  Sign Up
                </Link>

              </li>


            </ul>


          </div>






          {/* Resources */}



          <div>


            <h3 className="mb-6 text-lg font-bold text-white">
              Resources
            </h3>


            <ul className="space-y-4">


              <li>

                <a
                  href="#faq"
                  className="hover:text-white"
                >
                  FAQ
                </a>

              </li>



              <li>

                <a
                  href="#"
                  className="hover:text-white"
                >
                  Documentation
                </a>

              </li>



              <li>

                <a
                  href="#"
                  className="hover:text-white"
                >
                  Privacy Policy
                </a>

              </li>



              <li>

                <a
                  href="#"
                  className="hover:text-white"
                >
                  Terms & Conditions
                </a>

              </li>


            </ul>


          </div>







          {/* Contact */}



          <div>


            <h3 className="mb-6 text-lg font-bold text-white">
              Contact
            </h3>



            <div className="space-y-5">


              <div className="flex gap-3">

                <Mail
                  size={18}
                  className="mt-1 text-blue-400"
                />

                <span>
                  support@invoicepilot.com
                </span>


              </div>




              <div className="flex gap-3">


                <Phone
                  size={18}
                  className="mt-1 text-blue-400"
                />


                <span>
                  +91 XXXXX XXXXX
                </span>


              </div>




              <div className="flex gap-3">


                <MapPin
                  size={18}
                  className="mt-1 text-blue-400"
                />


                <span>
                  Pune, Maharashtra
                </span>


              </div>


            </div>


          </div>



        </div>







        {/* Newsletter */}



        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">


          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


            <div>


              <h2 className="text-2xl font-bold text-white">

                Stay Updated

              </h2>



              <p className="mt-2 text-slate-400">

                Get product updates and new feature releases.

              </p>


            </div>





            <div className="flex w-full max-w-xl">


              <input

                type="email"

                placeholder="Enter your email"

                className="flex-1 rounded-l-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-blue-500"

              />




              <button

                className="flex items-center gap-2 rounded-r-2xl bg-blue-600 px-8 font-semibold text-white transition hover:bg-blue-700"

              >

                Subscribe


                <ArrowUpRight size={18}/>


              </button>



            </div>


          </div>


        </div>







        {/* Bottom */}



        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 py-8 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">


          <p>

            © {new Date().getFullYear()} InvoicePilot.
            All rights reserved.

          </p>





          <div className="flex gap-8">


            <a href="#" className="hover:text-white">

              Privacy

            </a>



            <a href="#" className="hover:text-white">

              Terms

            </a>



            <a href="#" className="hover:text-white">

              Cookies

            </a>



          </div>



        </div>




      </Container>


    </footer>

  );

};


export default Footer;