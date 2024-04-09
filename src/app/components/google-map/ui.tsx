"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useGoogleMap, useMarkerLibrary } from "./hooks";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "__root__/tailwind.config";
import { ReactPortal } from "react";
import { createPortal } from "react-dom";
const fullConfig = resolveConfig(tailwindConfig);

const MapContext = createContext<google.maps.Map | null>(null);

export default function GoogleMapContainer({
  initialLocation,
  children
}: {
  initialLocation?: google.maps.LatLng | google.maps.LatLngLiteral | undefined;
  children?: React.ReactNode;
}) {
  const { map, mapElementRef } = useGoogleMap<HTMLDivElement>({
    initialLocation
  });

  return (
    <MapContext.Provider value={map}>
      <div
        className={
          "w-full h-[400px] relative " +
          `${!map ? "animate-pulse bg-slate-600 after:opacity-80 after:content-['Loading_Maps...'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2" : ""}`
        }
        ref={mapElementRef}
      >
        {map && children}
      </div>
    </MapContext.Provider>
  );
}

export function GoogleAdvanceMarker({
  children,
  position
}: {
  position?: google.maps.marker.AdvancedMarkerElementOptions["position"];
  children: React.ReactElement;
}) {
  const map = useContext(MapContext);
  const Library = useMarkerLibrary();
  const [marker, setMarker] = useState<HTMLElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const flexibleNode = useMemo(() => {
    const node = document.createElement("div");
    document.body.appendChild(node);
    return node;
  }, []);
  useEffect(() => {
    if (!Library) return;
    if (!map) return;

    const { AdvancedMarkerElement } = Library;

    const marker = new AdvancedMarkerElement({
      position: position,
      map,
      content: flexibleNode,
      gmpClickable: true
    });
    setMarker(marker);
    marker.addListener("click", () => {});
    return () => marker.remove();
  }, [Library, map]);

  useEffect(() => {
    return () => {
      flexibleNode.remove();
    };
  }, []);

  return createPortal(children, flexibleNode);
}

export function GoogleCircleElement({
  center,
  radius
}: {
  center: google.maps.CircleOptions["center"];
  radius: number;
}) {
  const map = useContext(MapContext);
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      radius,
      center: center,
      map,
      strokeWeight: 1,
      fillColor: fullConfig.theme.colors.slate["800"],
      fillOpacity: 0.1,
      strokeOpacity: 0.2
    });
    return () => circle.setMap(null);
  }, [map]);
  return <div></div>;
}
