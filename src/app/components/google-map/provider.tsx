"use client";

import { ReactNode, createContext, useContext } from "react";
import { GoogleMapContext } from "./context";


export default function GoogleMapProvider({ children, apiKey }: { children: ReactNode, apiKey: string }) {
    return <GoogleMapContext.Provider value={apiKey}>
        {children}
    </GoogleMapContext.Provider>
}

