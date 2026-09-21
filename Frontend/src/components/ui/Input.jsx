import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";


const Input = forwardRef(
(
{
    label,
    error,
    type = "text",
    className = "",
    ...props
},
ref
) => {


    const [showPassword, setShowPassword] = useState(false);


    const inputType =
        type === "password" && showPassword
        ? "text"
        : type;



    return (

        <div className="space-y-2">


            {
                label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )
            }



            <div className="relative">


                <input

                    ref={ref}

                    type={inputType}

                    className={`
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                        ${type === "password" ? "pr-12" : ""}
                        ${className}
                    `}


                    {...props}

                />



                {
                    type === "password" && (

                        <button

                            type="button"

                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }


                            className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-500
                            hover:text-blue-600
                            "

                        >

                            {
                                showPassword
                                ?
                                <EyeOff size={20}/>
                                :
                                <Eye size={20}/>
                            }


                        </button>

                    )
                }


            </div>



            {
                error && (

                    <p className="text-sm text-red-500">
                        {error}
                    </p>

                )
            }


        </div>

    );

});


Input.displayName = "Input";


export default Input;