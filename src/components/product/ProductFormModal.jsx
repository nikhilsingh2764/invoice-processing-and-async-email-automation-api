import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

import { useSaveProduct } from "../../hooks/useProducts";
import { PRODUCT_UNITS } from "../../utils/constants";

const schema = z.object({
    productName: z.string().min(3, "Must be at least 3 characters").max(100),
    description: z.string().min(1, "Description is required").max(500),
    category: z.string().min(1, "Category is required"),
    unit: z.enum(PRODUCT_UNITS),
    price: z.coerce.number().min(0, "Price must be 0 or more"),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
});

const emptyValues = {
    productName: "",
    description: "",
    category: "",
    unit: "piece",
    price: 0,
    taxRate: 0,
    discount: 0,
};

function ProductFormModal({ open, onClose, product }) {

    const saveProduct = useSaveProduct();

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

        reset(product ? { ...emptyValues, ...product } : emptyValues);

    }, [product, open, reset]);

    const onSubmit = (values) => {
        saveProduct.mutate({ id: product?._id, data: values }, { onSuccess: onClose });
    };

    return (
        <Modal open={open} onClose={onClose} title={product ? "Edit product" : "Add product"} maxWidth="max-w-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <Input label="Product name" error={errors.productName?.message} {...register("productName")} />

                <Textarea label="Description" error={errors.description?.message} {...register("description")} />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Category" error={errors.category?.message} {...register("category")} />
                    <Select label="Unit" error={errors.unit?.message} {...register("unit")}>
                        {PRODUCT_UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        min={0}
                        error={errors.price?.message}
                        {...register("price")}
                    />
                    <Input
                        label="Tax rate %"
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        error={errors.taxRate?.message}
                        {...register("taxRate")}
                    />
                    <Input
                        label="Discount %"
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        error={errors.discount?.message}
                        {...register("discount")}
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <Button type="submit" loading={saveProduct.isPending} className="!w-auto px-6">
                        {product ? "Save changes" : "Add product"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default ProductFormModal;
