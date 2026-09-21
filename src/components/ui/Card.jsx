function Card({
    children,
    title,
    subtitle,
    className = ""
}) {

    return (

        <div
            className={`
                rounded-2xl
                bg-white
                shadow-md
                ${className}
            `}
        >

            {(title || subtitle) && (
                <div className="p-6">

                    {title && (
                        <h2 className="text-xl font-bold text-slate-900">
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="mt-2 text-sm text-slate-500">
                            {subtitle}
                        </p>
                    )}

                </div>
            )}

            {children}

        </div>

    );
}

export default Card;