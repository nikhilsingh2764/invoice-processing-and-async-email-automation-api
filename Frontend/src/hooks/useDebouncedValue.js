import { useEffect, useState } from "react";

function useDebouncedValue(value, delayMs = 300) {

    const [debounced, setDebounced] = useState(value);

    useEffect(() => {

        const timeout = setTimeout(() => setDebounced(value), delayMs);

        return () => clearTimeout(timeout);

    }, [value, delayMs]);

    return debounced;
}

export default useDebouncedValue;
