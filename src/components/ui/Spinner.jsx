import { LoaderCircle } from "lucide-react";
import clsx from "clsx";

function Spinner({ size = 20, className = "" }) {
    return (
        <LoaderCircle
            size={size}
            className={clsx("animate-spin text-blue-600", className)}
        />
    );
}

export default Spinner;
