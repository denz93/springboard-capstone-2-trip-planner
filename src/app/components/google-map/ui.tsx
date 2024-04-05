"use client";
import { ReactPortal, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useGoogleMap, useLocation, useMarkerLibrary } from "./hooks";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '__root__/tailwind.config'

const fullConfig = resolveConfig(tailwindConfig)

const MapContext = createContext<google.maps.Map | null>(null)

export default function GoogleMapContainer({ initialLocation, children }: { initialLocation?: google.maps.LatLng | google.maps.LatLngLiteral | undefined, children?: React.ReactNode }) {
    const { map, mapElementRef } = useGoogleMap<HTMLDivElement>({ initialLocation })

    return <MapContext.Provider value={map}>
        <div className={"w-full h-[400px] relative " + `${!map ? "animate-pulse bg-slate-600 after:opacity-80 after:content-['Loading_Maps...'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2" : ''}`} ref={mapElementRef}>
            {map && children}
        </div>
    </MapContext.Provider>
}

export function GoogleAdvanceMarker({ children, position }: { position?: google.maps.marker.AdvancedMarkerElementOptions["position"], children: React.ReactElement }) {
    "use client";

    const map = useContext(MapContext)
    const Library = useMarkerLibrary()
    const [marker, setMarker] = useState<HTMLElement | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!Library) return
        if (!map) return

        const { AdvancedMarkerElement } = Library

        const marker = new AdvancedMarkerElement({
            position: position,
            map,
            content: ref.current,
            gmpClickable: true
        })
        setMarker(marker)
        marker.addListener('click', () => { })
    }, [Library, map])

    return <div ref={ref}>
        {children}
    </div>
}

export function GoogleCircleElement({ center, radius }: { center: google.maps.CircleOptions["center"], radius: number }) {
    const map = useContext(MapContext)
    useEffect(() => {
        if (!map) return
        const circle = new google.maps.Circle({
            radius,
            center: center,
            map,
            strokeWeight: 1,
            fillColor: fullConfig.theme.colors.slate["800"],
            fillOpacity: .1,
            strokeOpacity: .2
        })
    }, [map])
    return <div></div>
}