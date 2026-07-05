"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell, AppTopBar, ScreenContent } from "@/components/app-shell";
import { useAppStore } from "@/store/use-app-store";

type ParsedAddress = {
  title: string;
  line1: string;
  line2: string;
  city: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

const getComponent = (components: Array<{ long_name: string; short_name: string; types: string[] }>, type: string) =>
  components.find((entry) => entry.types.includes(type))?.long_name ?? "";

const asRecord = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) => (typeof value === "number" ? value : null);

const asFunction = (value: unknown) => (typeof value === "function" ? (value as (...args: unknown[]) => unknown) : null);

const parseGoogleAddress = (
  place: unknown,
): ParsedAddress | null => {
  const placeRecord = asRecord(place);
  const geometry = asRecord(placeRecord.geometry);
  const location = asRecord(geometry.location);
  const latFn = asFunction(location.lat);
  const lngFn = asFunction(location.lng);
  const lat = asNumber(latFn ? latFn() : location.lat);
  const lng = asNumber(lngFn ? lngFn() : location.lng);
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  const componentsValue = placeRecord.address_components;
  const components = Array.isArray(componentsValue)
    ? (componentsValue as Array<{ long_name: string; short_name: string; types: string[] }>)
    : [];
  const streetNumber = getComponent(components, "street_number");
  const route = getComponent(components, "route");
  const sublocality =
    getComponent(components, "sublocality_level_1") ||
    getComponent(components, "sublocality") ||
    getComponent(components, "neighborhood");
  const city =
    getComponent(components, "locality") ||
    getComponent(components, "administrative_area_level_2") ||
    getComponent(components, "administrative_area_level_1");

  const name = asString(placeRecord.name);
  const formatted = asString(placeRecord.formatted_address);
  const line1 = [streetNumber, route].filter(Boolean).join(" ").trim() || name;
  const line2 = sublocality || (city && line1 ? city : "");
  const formattedAddress = (formatted || name).trim();
  const title = (name || formattedAddress.split(",")[0] || "Selected location").trim();

  if (!line1 || !city) {
    return null;
  }

  return { title, line1, line2: line2 || "Nearby", city, formattedAddress, lat, lng };
};

export default function LocationPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const addresses = useAppStore((state) => state.addresses);
  const createAddress = useAppStore((state) => state.createAddress);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const scriptSrc = useMemo(() => {
    if (!apiKey) {
      return null;
    }
    return `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
  }, [apiKey]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const geocoderRef = useRef<unknown>(null);

  const [scriptReady, setScriptReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ParsedAddress | null>(null);

  useEffect(() => {
    if (!scriptReady) {
      return;
    }

    const google = (window as unknown as { google?: unknown }).google;
    const googleRecord = asRecord(google);
    const mapsRecord = asRecord(googleRecord.maps);
    const placesRecord = asRecord(mapsRecord.places);
    if (!mapsRecord || !mapContainerRef.current || !inputRef.current || mapRef.current) {
      return;
    }

    const initial = { lat: 28.4595, lng: 77.0266 };
    const MapCtor = mapsRecord.Map as unknown as new (el: HTMLElement, options: Record<string, unknown>) => unknown;
    const MarkerCtor = mapsRecord.Marker as unknown as new (options: Record<string, unknown>) => unknown;
    const GeocoderCtor = mapsRecord.Geocoder as unknown as new () => unknown;
    const AutocompleteCtor = placesRecord.Autocomplete as unknown as new (el: HTMLInputElement, options: Record<string, unknown>) => unknown;

    if (!MapCtor || !MarkerCtor || !GeocoderCtor || !AutocompleteCtor) {
      setTimeout(() => setError("Google Maps is not available. Check your API key and enabled APIs."), 0);
      return;
    }

    const map = new MapCtor(mapContainerRef.current, {
      center: initial,
      zoom: 14,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    const marker = new MarkerCtor({ map, position: initial });
    const geocoder = new GeocoderCtor();

    const autocomplete = new AutocompleteCtor(inputRef.current, {
      fields: ["address_components", "formatted_address", "geometry", "name"],
    });
    const autocompleteRecord = asRecord(autocomplete);
    const bindTo = asFunction(autocompleteRecord.bindTo);
    if (bindTo) {
      bindTo.call(autocomplete, "bounds", map);
    }
    const addListener = asFunction(autocompleteRecord.addListener);
    const getPlaceFn = asFunction(autocompleteRecord.getPlace);
    if (!addListener || !getPlaceFn) {
      setTimeout(() => setError("Google Maps Autocomplete failed to initialize."), 0);
      return;
    }
    addListener.call(autocomplete, "place_changed", () => {
      const place = getPlaceFn.call(autocomplete);
      const parsed = parseGoogleAddress(place);
      if (!parsed) {
        setError("Pick a place with a valid street address.");
        return;
      }
      setError(null);
      setSelected(parsed);
      const next = { lat: parsed.lat, lng: parsed.lng };
      const mapRecord = asRecord(map);
      const markerRecord = asRecord(marker);
      const panTo = asFunction(mapRecord.panTo);
      const setPosition = asFunction(markerRecord.setPosition);
      if (panTo) {
        panTo.call(map, next);
      }
      if (setPosition) {
        setPosition.call(marker, next);
      }
    });

    const mapRecord = asRecord(map);
    const mapAddListener = asFunction(mapRecord.addListener);
    if (!mapAddListener) {
      setTimeout(() => setError("Google Maps failed to initialize."), 0);
      return;
    }

    mapAddListener.call(map, "click", (event: unknown) => {
      const eventRecord = asRecord(event);
      const latLng = asRecord(eventRecord.latLng);
      const latFn = asFunction(latLng.lat);
      const lngFn = asFunction(latLng.lng);
      const lat = asNumber(latFn ? latFn.call(eventRecord.latLng) : null);
      const lng = asNumber(lngFn ? lngFn.call(eventRecord.latLng) : null);
      if (typeof lat !== "number" || typeof lng !== "number") {
        return;
      }
      setError(null);
      const markerRecord = asRecord(marker);
      const markerSetPosition = asFunction(markerRecord.setPosition);
      if (markerSetPosition) {
        markerSetPosition.call(marker, { lat, lng });
      }

      const geocoderRecord = asRecord(geocoder);
      const geocodeFn = asFunction(geocoderRecord.geocode);
      if (!geocodeFn) {
        setError("Unable to resolve this location. Try searching.");
        return;
      }

      geocodeFn.call(geocoder, { location: { lat, lng } }, (results: unknown, status: unknown) => {
        const statusText = asString(status);
        if (statusText !== "OK" || !Array.isArray(results) || !results[0]) {
          setError("Unable to resolve this location. Try searching.");
          return;
        }
        const parsed = parseGoogleAddress(results[0]);
        if (!parsed) {
          setError("Pick a place with a valid street address.");
          return;
        }
        setSelected(parsed);
      });
    });

    mapRef.current = map;
    markerRef.current = marker;
    geocoderRef.current = geocoder;
  }, [scriptReady]);

  const locateMe = async () => {
    if (!scriptReady) {
      return;
    }
    const google = (window as unknown as { google?: unknown }).google;
    const googleRecord = asRecord(google);
    const mapsRecord = asRecord(googleRecord.maps);
    if (!mapsRecord || !navigator.geolocation || !geocoderRef.current || !mapRef.current || !markerRef.current) {
      setError("Geolocation is not available on this device.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const next = { lat, lng };
        const mapRecord = asRecord(mapRef.current);
        const markerRecord = asRecord(markerRef.current);
        const geocoderRecord = asRecord(geocoderRef.current);
        const panTo = asFunction(mapRecord.panTo);
        const setPosition = asFunction(markerRecord.setPosition);
        const geocodeFn = asFunction(geocoderRecord.geocode);
        if (panTo) {
          panTo.call(mapRef.current, next);
        }
        if (setPosition) {
          setPosition.call(markerRef.current, next);
        }
        if (!geocodeFn) {
          setIsLocating(false);
          setError("Unable to resolve your location. Try searching.");
          return;
        }
        geocodeFn.call(geocoderRef.current, { location: next }, (results: unknown, status: unknown) => {
          setIsLocating(false);
          const statusText = asString(status);
          if (statusText !== "OK" || !Array.isArray(results) || !results[0]) {
            setError("Unable to resolve your location. Try searching.");
            return;
          }
          const parsed = parseGoogleAddress(results[0]);
          if (!parsed) {
            setError("Pick a place with a valid street address.");
            return;
          }
          setSelected(parsed);
        });
      },
      () => {
        setIsLocating(false);
        setError("Location permission denied. Search for your address instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const save = async () => {
    if (!selected) {
      return;
    }
    if (!user) {
      router.push(`/auth/sign-in?redirectTo=${encodeURIComponent("/location")}`);
      return;
    }

    setIsSaving(true);
    setError(null);

    const label = "HOME" as const;
    const eta = "10-15 mins";
    const isDefault = addresses.length === 0;

    const id = await createAddress({
      label,
      title: selected.title,
      line1: selected.line1,
      line2: selected.line2,
      city: selected.city,
      eta,
      isDefault,
    });

    setIsSaving(false);

    if (!id) {
      setError("Unable to save this address right now.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <AppShell>
      <AppTopBar title="Set delivery location" subtitle="Search on Google Maps or use your current location" showSearchShortcut={false} />
      <ScreenContent>
        {!apiKey ? (
          <section className="rounded-[1.9rem] border border-rose-400/30 bg-rose-400/10 p-6 text-sm text-rose-100">
            Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Add it to your environment variables and reload.
          </section>
        ) : null}

        {scriptSrc ? (
          <Script
            src={scriptSrc}
            strategy="afterInteractive"
            onLoad={() => setScriptReady(true)}
            onError={() => setError("Failed to load Google Maps. Check your API key restrictions.")}
          />
        ) : null}

        <section className="space-y-4">
          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                ref={inputRef}
                placeholder="Search your address"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={locateMe}
                  disabled={isLocating || !scriptReady}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLocating ? "Locating..." : "Use my location"}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={isSaving || !selected}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {error ? <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

            {selected ? (
              <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{selected.title}</p>
                <p className="mt-1 text-sm text-emerald-50/72">{selected.formattedAddress}</p>
                <p className="mt-1 text-xs text-emerald-100/55">
                  {selected.city} • {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-emerald-50/72">Search for your place, or tap the map to drop a pin.</p>
            )}

            {!user ? (
              <p className="mt-4 text-sm text-emerald-50/72">
                Sign in required to save addresses.{" "}
                <Link href={`/auth/sign-in?redirectTo=${encodeURIComponent("/location")}`} className="font-semibold text-lime-300">
                  Sign in
                </Link>
              </p>
            ) : null}
          </div>

          <div ref={mapContainerRef} className="h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/8 bg-black/20" />
        </section>
      </ScreenContent>
    </AppShell>
  );
}
