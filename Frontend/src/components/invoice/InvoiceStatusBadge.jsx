import clsx from "clsx";
import { INVOICE_STATUS_STYLES } from "../../utils/constants";

function InvoiceStatusBadge({ status, className = "" }) {

    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                INVOICE_STATUS_STYLES[status] || INVOICE_STATUS_STYLES.Draft,
                className
            )}
        >
            {status || "Draft"}
        </span>
    );
}

export default InvoiceStatusBadge;
