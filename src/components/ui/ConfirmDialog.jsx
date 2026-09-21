import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    loading = false,
    danger = true,
}) {

    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">

            {description && (
                <p className="text-sm text-slate-600">{description}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
                >
                    Cancel
                </button>

                <Button
                    type="button"
                    loading={loading}
                    onClick={onConfirm}
                    className={`!w-auto px-5 ${danger ? "bg-red-600 hover:bg-red-700" : ""}`}
                >
                    {confirmLabel}
                </Button>

            </div>

        </Modal>
    );
}

export default ConfirmDialog;
