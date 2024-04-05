import { useGooglePlaceService } from "@/app/components/google-map/hooks";
import useDebounceValue from "@/app/components/use-debounce-value";
import { formatKNumber } from "@/app/helpers/format-k-number";
import { SearchBox } from "@/components/ui/searchbox";
import { LatLngLiteral } from "@googlemaps/google-maps-services-js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa6";

type NearBySearch = google.maps.places.PlacesService["nearbySearch"];
type GoogleNearBySearchCallback<T = NearBySearch> = T extends (
  d: any,
  callback: infer C,
) => void
  ? C
  : never;

let globalResolve:
  | ((result: {
      data: google.maps.places.PlaceResult[];
      next: google.maps.places.PlaceSearchPagination | null;
    }) => void)
  | null = null;

const callbackHandler: GoogleNearBySearchCallback = (
  result,
  status,
  pagination,
) => {
  if (!globalResolve) return;
  globalResolve({
    data: result ?? [],
    next: pagination?.hasNextPage ? pagination : null,
  });
};
const searchNearBy = async (
  placesService:
    | google.maps.places.PlacesService
    | google.maps.places.PlaceSearchPagination
    | null,
  opts?: {
    request: Parameters<NearBySearch>["0"];
  },
) => {
  if (!placesService) return { data: [], next: null };
  if (placesService instanceof google.maps.places.PlacesService) {
    return new Promise<{
      data: google.maps.places.PlaceResult[];
      next: google.maps.places.PlaceSearchPagination | null;
    }>((resolve, reject) => {
      globalResolve = resolve;
      placesService.nearbySearch(opts?.request ?? {}, callbackHandler);
    });
  } else {
    return new Promise<{
      data: google.maps.places.PlaceResult[];
      next: google.maps.places.PlaceSearchPagination | null;
    }>((resolve) => {
      globalResolve = resolve;
      placesService.nextPage();
    });
  }
};

export default function PlaceSearch({
  onSelectedPlace,
  baseLocation,
}: {
  onSelectedPlace?: (place: google.maps.places.PlaceResult) => void;
  baseLocation: google.maps.LatLng | LatLngLiteral;
}) {
  const [searchValue, setSearchValue] = useState("");
  const debounceSearchValue = useDebounceValue(searchValue);
  const placesService = useGooglePlaceService();
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  const {
    refetch,
    data: { pages },
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isPending,
    isSuccess,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "google.places",
      baseLocation,
      debounceSearchValue,
      placesService != null,
    ],
    enabled: false,
    getNextPageParam: (lastPage: {
      data: google.maps.places.PlaceResult[];
      next: google.maps.places.PlaceSearchPagination | null;
    }) => {
      return lastPage?.next as
        | google.maps.places.PlacesService
        | google.maps.places.PlaceSearchPagination
        | null;
    },
    initialPageParam: placesService,
    initialData: { pages: [], pageParams: [] },
    queryFn: async ({ pageParam }) => {
      return searchNearBy(pageParam, {
        request: {
          location: baseLocation,
          radius: 50000,
          keyword: debounceSearchValue,
        },
      });
    },
  });

  useEffect(() => {
    refetch();
  }, [debounceSearchValue]);

  const priceLevelBadge = (priceLevel: number) => {
    return (
      <div className="badge badge-neutral font-mono ">
        <div className={"font-bold  " + (priceLevel >= 0 ? "" : "opacity-25")}>
          $
        </div>
        <div className={"font-bold " + (priceLevel >= 1 ? "" : "opacity-25")}>
          $
        </div>
        <div className={"font-bold " + (priceLevel >= 2 ? "" : "opacity-25")}>
          $
        </div>
        <div className={"font-bold " + (priceLevel >= 3 ? "" : "opacity-25")}>
          $
        </div>
        <div className={"font-bold " + (priceLevel >= 4 ? "" : "opacity-25")}>
          $
        </div>
      </div>
    );
  };

  const items = useMemo(() => {
    return pages
      .flatMap((p) => p.data)
      .map((place, idx) => {
        const url =
          place.photos?.[0].getUrl({ maxHeight: 300, maxWidth: 300 }) ?? "";
        const isSelected = selectedPlace === place;

        return (
          <div
            key={place.place_id ?? idx}
            className={
              "grid grid-cols-5 items-center relative p-4 " +
              (isSelected ? " bg-base-300 " : "")
            }
            role="listitem"
            onClick={() => {
              setSelectedPlace(place);
              onSelectedPlace?.(place);
              console.log({ place });
            }}
          >
            <div className="col-start-1 col-span-1 w-full h-28">
              {url === "" && <div className="skeleton w-full h-full"></div>}
              {url !== "" && (
                <img src={url} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="col-start-2 col-span-3 grid grid-rows-3 pl-2 gap-y-2">
              <p className="line-clamp-1 ">{place.name}</p>
              <p className="italic opacity-80 text-xs">{place.vicinity}</p>
              <div className="flex items-center">
                {place.rating !== undefined && (
                  <span className="flex-shrink-0 badge badge-neutral">
                    {place.rating}&nbsp;
                    <FaStar />
                    &nbsp;{formatKNumber(place.user_ratings_total ?? 0)} Ratings
                  </span>
                )}
              </div>
            </div>
            <div
              className={
                "col-start-5 col-span-1 place-self-center grid grid-rows-3 gap-y-2 items-center justify-center"
              }
            >
              <div className="row-start-2 row-span-1 flex justify-center">
                <img
                  width={25}
                  height={25}
                  src={place.icon}
                  className="rounded-sm mix-blend-plus-lighter"
                />
              </div>
              {place.price_level && (
                <span className="row-start-3">
                  {priceLevelBadge(place.price_level)}
                </span>
              )}
            </div>
            {isSelected && (
              <div className="absolute badge badge-accent right-0 top-0">
                Selected
              </div>
            )}
          </div>
        );
      });
  }, [pages, selectedPlace]);

  return (
    <SearchBox className="justify-self-center" autoFocus={false}>
      <SearchBox.Trigger autoFocus={false}>
        <input
          autoFocus={false}
          className="input input-bordered w-96"
          placeholder="Find your favorite places..."
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </SearchBox.Trigger>
      <SearchBox.Content className="border border-slate-600 rounded-md mt-4 shadow-md bg-base-100 z-50">
        <div className="grid grid-cols-1 relative  max-h-96 overflow-scroll">
          {isPending && (
            <div className="justify-self-center animate-pulse italic">
              Loading places...
            </div>
          )}
          {!isPending && isError && (
            <div className="justify-self-center italic text-error">
              {error.message}
            </div>
          )}
          {!isPending && !isError && items.length === 0 && (
            <div className="justify-self-center italic">No places found.</div>
          )}

          {!isPending && items.length > 0 && items}
          {isFetchingNextPage && (
            <>
              <div className="grid grid-cols-5">
                <div className="skeleton w-full h-16 col-start-1 col-span-1"></div>
                <div className="col-start-2 col-span-3 flex flex-col gap-4 items-start justify-center pl-4">
                  <div className="w-32 h-4 skeleton"></div>
                  <div className="w-20 h-4 skeleton"></div>
                </div>
                <div className="col-start-5 col-span-1 flex justify-center items-center">
                  <div className="w-12 h-12 skeleton"></div>
                </div>
              </div>
            </>
          )}
        </div>
        {!isPending && items.length > 0 && (
          <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 badge badge-info shadow-xl">
            {items.length} Places{hasNextPage ? " and more" : ""}
          </div>
        )}
        {hasNextPage && (
          <div className="flex justify-center">
            <button
              className="btn btn-ghost"
              onMouseDown={(e) => {
                fetchNextPage();
                e.preventDefault();
              }}
              disabled={isFetchingNextPage}
            >
              Load more places
            </button>
          </div>
        )}
      </SearchBox.Content>
    </SearchBox>
  );
}
