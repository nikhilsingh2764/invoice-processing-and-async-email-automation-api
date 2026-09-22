import Input from "../ui/Input";
import Select from "../ui/Select";

import { INDIAN_STATES, COUNTRIES } from "../../utils/constants";

// Shared address sub-form used by Business, and by a Customer's billing /
// shipping address. The backend currently only accepts Indian states and
// "India" as the country (Backend/src/model/invoice/address.model.js), so
// the frontend mirrors that instead of allowing values the API will reject.
function AddressFields({ register, errors = {}, prefix = "address" }) {

    const err = (field) => errors?.[field]?.message;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="sm:col-span-2">
                <Input
                    label="Address line 1"
                    placeholder="Street, building, area"
                    error={err("addressLine1")}
                    {...register(`${prefix}.addressLine1`)}
                />
            </div>

            <div className="sm:col-span-2">
                <Input
                    label="Address line 2 (optional)"
                    placeholder="Landmark, floor, etc."
                    {...register(`${prefix}.addressLine2`)}
                />
            </div>

            <Input
                label="City"
                error={err("city")}
                {...register(`${prefix}.city`)}
            />

            <Select
                label="State"
                error={err("state")}
                defaultValue=""
                {...register(`${prefix}.state`)}
            >
                <option value="" disabled>Select state</option>
                {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                ))}
            </Select>

            <Select
                label="Country"
                error={err("country")}
                defaultValue="India"
                {...register(`${prefix}.country`)}
            >
                {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                ))}
            </Select>

            <Input
                label="Postal code"
                placeholder="6-digit PIN code"
                error={err("postalCode")}
                {...register(`${prefix}.postalCode`)}
            />

        </div>
    );
}

export default AddressFields;
