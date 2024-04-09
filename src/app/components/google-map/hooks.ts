"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { useGoogleMapApiKey } from "./context";
import { Loader } from "@googlemaps/js-api-loader";

enum GeoErrorType {
  "PERMISSION_DENIED" = 1,
  "POSITION_UNAVAILABLE" = 2,
  "TIMEOUT" = 3
}
export function useLocation() {
  const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [error, setError] = useState<GeoErrorType | null>(null);
  const successHandler = useCallback((pos: GeolocationPosition) => {
    setLocation(() => ({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    }));
  }, []);
  const errorHandler = useCallback((err: GeolocationPositionError) => {
    setError(err.code as GeoErrorType);
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }, []);

  return { location, error, isSuccess: !error };
}

let LOADER: Loader | null = null;
let Libraries: {
  MarkerLibrary: google.maps.MarkerLibrary | null;
  MapLibrary: google.maps.MapsLibrary | null;
  GeometryLibrary: google.maps.GeometryLibrary | null;
  DrawingLibrary: google.maps.DrawingLibrary | null;
  PlacesLibrary: google.maps.PlacesLibrary | null;
} = {
  MapLibrary: null,
  MarkerLibrary: null,
  GeometryLibrary: null,
  DrawingLibrary: null,
  PlacesLibrary: null
};

function __loadGoogleLoader(apiKey: string) {
  if (LOADER || !apiKey || apiKey === "") return;
  LOADER = new Loader({ apiKey, version: "weekly" });
}
async function __loadLibraries() {
  if (!LOADER) return;
  if (Libraries.MapLibrary) return;

  Libraries.MarkerLibrary = await LOADER.importLibrary("marker");
  Libraries.MapLibrary = await LOADER.importLibrary("maps");
  Libraries.GeometryLibrary = await LOADER.importLibrary("geometry");
  Libraries.DrawingLibrary = await LOADER.importLibrary("drawing");
  Libraries.PlacesLibrary = await LOADER.importLibrary("places");
}

export function useGoogleMap<T extends HTMLElement>({
  initialLocation,
  defaultZoom = 12
}: {
  initialLocation?: google.maps.LatLngLiteral | google.maps.LatLng;
  defaultZoom?: number;
} = {}) {
  const NEW_YORK = {
    lng: -74.005974,
    lat: 40.712776
  };
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapId = useId();
  const mapElementRef = useRef<T>(null);
  const MapLibrary = useGoogleLibrary("MapLibrary");

  useEffect(() => {
    if (!mapElementRef.current) return;
    if (!MapLibrary) return;
    const { Map } = MapLibrary;
    const m = new Map(mapElementRef.current as HTMLElement, {
      center: initialLocation ?? NEW_YORK,
      zoom: defaultZoom,
      mapId
    });
    setMap(m);
  }, [mapElementRef.current, MapLibrary]);

  return { map, mapId, mapElementRef, Libraries };
}

export function useMarkerLibrary() {
  return useGoogleLibrary("MarkerLibrary");
}

export function useGoogleLibrary<TName extends keyof typeof Libraries>(
  libName: TName
) {
  const apiKey = useGoogleMapApiKey();

  const [lib, setLib] = useState(Libraries[libName]);
  __loadGoogleLoader(apiKey);

  useEffect(() => {
    __loadLibraries();
  }, []);

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      watch();
    }, 300);
    function watch() {
      if (Libraries[libName]) {
        setLib(Libraries[libName]);
        return;
      }
      timeoutId = setTimeout(() => watch(), 200);
    }

    return () => clearTimeout(timeoutId);
  }, []);
  return lib;
}

let PlacesServiceInstance: google.maps.places.PlacesService | null = null;
export function useGooglePlaceService() {
  const PlacesLibrary = useGoogleLibrary("PlacesLibrary");
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(PlacesServiceInstance);

  useEffect(() => {
    if (!PlacesLibrary) return;
    if (placesService) return;
    if (PlacesServiceInstance) {
      setPlacesService(PlacesServiceInstance);
      return;
    }
    let attrEle = document.getElementById("google_attr") as HTMLDivElement;
    if (!attrEle) {
      attrEle = document.createElement("div");
      attrEle.id = "google_attr";
      document.body.appendChild(attrEle);
    }
    PlacesServiceInstance = new PlacesLibrary.PlacesService(attrEle);
    setPlacesService(PlacesServiceInstance);
  }, [PlacesLibrary, placesService]);

  return placesService;
}
