import Spinner from "../ui/Spinner";

function PageLoader({ label = "Loading…" }) {
    return (
        <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-slate-500">
            <Spinner size={32} />
            <p className="text-sm">{label}</p>
        </div>
    );
}

export default PageLoader;
