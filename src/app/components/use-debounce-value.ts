import { useEffect, useState } from "react";

type Opts = {
    msTimeout?: number
}
export default function useDebounceValue<T>(value: T, { msTimeout = 400 }: Opts = {}) {
    const [debounceValue, setDebounceValue] = useState<T>(value)
    useEffect(() => {
        let timeout = setTimeout(() => setDebounceValue(value), msTimeout)

        return () => clearTimeout(timeout)
    }, [value])
    return debounceValue
}