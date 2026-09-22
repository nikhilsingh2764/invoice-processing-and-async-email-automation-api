import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import AddressFields from "../common/AddressFields";

import { useSaveCustomer } from "../../hooks/useCustomers";
import { CUSTOMER_TYPES, EMPTY_ADDRESS } from "../../utils/constants";

const addressSchema = z.object({
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
});

const optionalAddress = z
    .object({
        addressLine1: z.string().optional().or(z.literal("")),
        addressLine2: z.string().optional().or(z.literal("")),
        city: z.string().optional().or(z.literal("")),
        state: z.string().optional().or(z.literal("")),
        country: z.string().optional().or(z.literal("")),
        postalCode: z.string().optional().or(z.literal("")),
    })
    .optional();

const schema = z.object({
    customerName: z.string().min(3, "Must be at least 3 characters").max(100),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    companyName: z.string().max(100).optional().or(z.literal("")),
    gstNumber: z.string().regex(/^[0-9A-Za-z]{15}$/, "GST number must be 15 characters").optional().or(z.literal("")),
    customerType: z.enum(CUSTOMER_TYPES),
    notes: z.string().max(500).optional().or(z.literal("")),
    billingAddress: addressSchema,
    shippingAddress: optionalAddress,
});

const emptyValues = {
    customerName: "",
    email: "",
    phone: "",
    companyName: "",
    gstNumber: "",
    customerType: "Individual",
    notes: "",
    billingAddress: EMPTY_ADDRESS,
    shippingAddress: EMPTY_ADDRESS,
};

function CustomerFormModal({ open, onClose, customer }) {

    const [sameAsBilling, setSameAsBilling] = useState(true);

    const saveCustomer = useSaveCustomer();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: emptyValues,
    });

    useEffect(() => {

        if (!open) return;

        if (customer) {
            reset({
                ...emptyValues,
                ...customer,
                billingAddress: { ...EMPTY_ADDRESS, ...customer.billingAddress },
                shippingAddress: { ...EMPTY_ADDRESS, ...customer.shippingAddress },
            });
            setSameAsBilling(!customer.shippingAddress?.addressLine1);
        } else {
            reset(emptyValues);
            setSameAsBilling(true);
        }
    }, [customer, open, reset]);

    const onSubmit = (values) => {

        const payload = { ...values };

        if (sameAsBilling) {
            payload.shippingAddress = payload.billingAddress;
        } else if (!payload.shippingAddress?.addressLine1) {
            delete payload.shippingAddress;
        }

        ["companyName", "gstNumber", "notes"].forEach((key) => {
            if (!payload[key]) delete payload[key];
        });

        saveCustomer.mutate(
            { id: customer?._id, data: payload },
            { onSuccess: onClose }
        );
    };

    return (
        <Modal open={open} onClose={onClose} title={customer ? "Edit customer" : "Add customer"} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Customer name" error={errors.customerName?.message} {...register("customerName")} />
                    <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                    <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
                    <Select label="Customer type" error={errors.customerType?.message} {...register("customerType")}>
                        {CUSTOMER_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </Select>
                    <Input
                        label="Company name (optional)"
                        error={errors.companyName?.message}
                        {...register("companyName")}
                    />
                    <Input
                        label="GST number (optional)"
                        error={errors.gstNumber?.message}
                        {...register("gstNumber")}
                    />
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Billing address</h3>
                    <AddressFields register={register} errors={errors.billingAddress} prefix="billingAddress" />
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Shipping address</h3>
                        <label className="flex items-center gap-2 text-sm text-slate-500">
                            <input
                                type="checkbox"
                                checked={sameAsBilling}
                                onChange={(e) => setSameAsBilling(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Same as billing address
                        </label>
                    </div>

                    {!sameAsBilling && (
                        <AddressFields register={register} errors={errors.shippingAddress} prefix="shippingAddress" />
                    )}
                </div>

                <Textarea
                    label="Notes (optional)"
                    error={errors.notes?.message}
                    {...register("notes")}
                />

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <Button type="submit" loading={saveCustomer.isPending} className="!w-auto px-6">
                        {customer ? "Save changes" : "Add customer"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default CustomerFormModal;
