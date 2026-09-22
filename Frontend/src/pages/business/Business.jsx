import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2 } from "lucide-react";

import { useBusiness, useSaveBusiness } from "../../hooks/useBusiness";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import PageLoader from "../../components/common/PageLoader";
import AddressFields from "../../components/common/AddressFields";

import { CURRENCIES, EMPTY_ADDRESS } from "../../utils/constants";

const addressSchema = z.object({
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
});

const schema = z.object({
    businessName: z.string().min(3, "Must be at least 3 characters").max(100),
    ownerName: z.string().min(3, "Must be at least 3 characters").max(100),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    gstNumber: z.string().regex(/^[0-9A-Za-z]{15}$/, "GST number must be 15 characters").optional().or(z.literal("")),
    currency: z.string().min(1, "Select a currency"),
    address: addressSchema,
    logo: z.string().optional().or(z.literal("")),
    signature: z.string().optional().or(z.literal("")),
    invoicePrefix: z.string().min(2).max(10).optional().or(z.literal("")),
    invoiceStartNumber: z.coerce.number().min(1).optional(),
    termsAndConditions: z.string().max(1000).optional().or(z.literal("")),
});

const defaultValues = {
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    gstNumber: "",
    currency: "INR",
    address: EMPTY_ADDRESS,
    logo: "",
    signature: "",
    invoicePrefix: "INV",
    invoiceStartNumber: 1,
    termsAndConditions: "Thank you for your business.",
};

function Business() {

    const { data: business, isLoading } = useBusiness();
    const saveBusiness = useSaveBusiness(Boolean(business));

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    useEffect(() => {
        if (business) {
            reset({
                ...defaultValues,
                ...business,
                address: { ...EMPTY_ADDRESS, ...business.address },
            });
        }
    }, [business, reset]);

    if (isLoading) return <PageLoader label="Loading business profile…" />;

    const onSubmit = (values) => {

        const payload = { ...values };

        // Never send empty-string optional fields the backend validates
        // with regex/enum — an empty GST field, for example, would fail
        // Backend/src/validators/business.validator.js.
        ["gstNumber", "logo", "signature"].forEach((key) => {
            if (!payload[key]) delete payload[key];
        });

        saveBusiness.mutate(payload);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">

            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Building2 size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Business profile</h1>
                    <p className="text-sm text-slate-500">
                        This information appears on every invoice you send.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="space-y-6 p-6">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input label="Business name" error={errors.businessName?.message} {...register("businessName")} />
                        <Input label="Owner name" error={errors.ownerName?.message} {...register("ownerName")} />
                        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
                        <Input
                            label="GST number (optional)"
                            error={errors.gstNumber?.message}
                            {...register("gstNumber")}
                        />
                        <Select label="Currency" error={errors.currency?.message} {...register("currency")}>
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-700">Business address</h3>
                        <AddressFields register={register} errors={errors.address} prefix="address" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input label="Logo URL (optional)" placeholder="https://…" {...register("logo")} />
                        <Input label="Signature image URL (optional)" placeholder="https://…" {...register("signature")} />
                        <Input
                            label="Invoice number prefix"
                            error={errors.invoicePrefix?.message}
                            {...register("invoicePrefix")}
                        />
                        <Input
                            label="Next invoice number"
                            type="number"
                            min={1}
                            error={errors.invoiceStartNumber?.message}
                            {...register("invoiceStartNumber")}
                        />
                    </div>

                    <Textarea
                        label="Terms & conditions"
                        rows={4}
                        error={errors.termsAndConditions?.message}
                        {...register("termsAndConditions")}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" loading={saveBusiness.isPending} className="!w-auto px-6">
                            {business ? "Save changes" : "Create business profile"}
                        </Button>
                    </div>

                </Card>
            </form>
        </div>
    );
}

export default Business;
