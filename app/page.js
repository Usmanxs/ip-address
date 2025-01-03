"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

function ZoomControls() {
  const map = useMap();

  const zoomIn = () => {
    map.setZoom(map.getZoom() + 1);
  };

  const zoomOut = () => {
    map.setZoom(map.getZoom() - 1);
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <button
        onClick={zoomIn}
        className="bg-purple-500 text-white p-2 rounded-md shadow hover:bg-purple-600 transition"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        className="bg-purple-500 text-white p-2 rounded-md shadow hover:bg-purple-600 transition"
      >
        -
      </button>
    </div>
  );
}

function NavigateToLocationButton({ geoData }) {
  const map = useMap();

  const navigateToLocation = () => {
    if (geoData) {
      map.setView([geoData.latitude, geoData.longitude], 13, {
        animate: true,
      });
    }
  };

  return (
    <button
      onClick={navigateToLocation}
      className="absolute bottom-4 left-2 z-10 bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition"
    >
      Navigate to Location
    </button>
  );
}

export default function Home() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet")
        .then((leaflet) => {
          setL(leaflet);
        })
        .catch((error) => {
          console.error("Error loading leaflet:", error);
        });
    }
  }, []);

  const fetchGeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://ipinfo.io/json");
      const data = await res.json();

      if (res.ok) {
        const [latitude, longitude] = data.loc.split(",").map(Number);
        setGeoData({
          ...data,
          latitude,
          longitude,
        });
      } else {
        console.error("Error fetching geolocation data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, []);

  const customIcon = L
    ? new L.Icon({
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(` 
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="full" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
          <path d="M21 10c0 4.28-9 13-9 13S3 14.28 3 10a9 9 0 1 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 flex items-center justify-center">
      <div className="flex flex-col lg:flex-row items-center lg:items-start bg-white shadow-lg rounded-xl p-8 lg:p-12 w-full max-w-6xl">
        {/* Left Section */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
            Geolocation Finder
          </h1>
          <div className="bg-gray-100 rounded-lg p-6 shadow-md">
            
            <button
              onClick={fetchGeoData}
              className={`w-full mt-4 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition ${
                loading ? "cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch Geolocation"}
            </button>
          </div>

          {geoData && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6 shadow-md">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 text-center lg:text-left">
                Geolocation Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">IP:</span> {geoData.ip}
                </p>
                <p>
                  <span className="font-semibold">City:</span> {geoData.city}
                </p>
                <p>
                  <span className="font-semibold">Region:</span>{" "}
                  {geoData.region}
                </p>
                <p>
                  <span className="font-semibold">Country:</span>{" "}
                  {geoData.country}
                </p>
                <p>
                  <span className="font-semibold">Latitude:</span>{" "}
                  {geoData.latitude}
                </p>
                <p>
                  <span className="font-semibold">Longitude:</span>{" "}
                  {geoData.longitude}
                </p>
                <p>
                  <span className="font-semibold">Timezone:</span>{" "}
                  {geoData.timezone}
                </p>
                <p>
                  <span className="font-semibold">Organization:</span>{" "}
                  {geoData.org}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Map */}
        {geoData && L && (
          <div className="w-[500px] h-[400px] mt-12 lg:mt-12 lg:ml-8 relative z-0">
            <div className="w-[500px] h-[400px] rounded-lg border border-gray-200 shadow-md relative">
              <MapContainer
                center={[geoData.latitude, geoData.longitude]}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[geoData.latitude, geoData.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    {geoData.city}, {geoData.region}, {geoData.country}
                  </Popup>
                  <NavigateToLocationButton geoData={geoData} />
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
