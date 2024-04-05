"use client";

import { createContext, useContext } from "react"

export const GoogleMapContext = createContext('')
export function useGoogleMapApiKey() {
    return useContext(GoogleMapContext)
}