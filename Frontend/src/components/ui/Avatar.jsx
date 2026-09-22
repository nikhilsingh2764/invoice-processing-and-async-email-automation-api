function Avatar({ name = "U", size = 40, className = "" }) {

    const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

    return (
        <div
            style={{ width: size, height: size }}
            className={`flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${className}`}
        >
            {initial}
        </div>
    );
}

export default Avatar;
