'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function Ip() {
  const [ip, setIp] = useState('');
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet);
      }).catch((error) => {
        console.error('Error loading leaflet:', error);
      });
    }
  }, []);

  useEffect(() => {
    const fetchClientIp = async () => {
      try {
        const res = await fetch('https://ipinfo.io/json');
        const data = await res.json();
        setIp(data.ip);
      } catch (error) {
        console.error('Error fetching client IP:', error);
      }
    };

    fetchClientIp();
  }, []);

  const fetchGeoData = async () => {
    if (!ip) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ip?ip=${ip}`);
      const data = await res.json();
      if (res.ok) {
        setGeoData(data);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ip) {
      fetchGeoData();
    }
  }, [ip]);

  const customIcon = L ? new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(` 
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
        <path d="M21 10c0 4.28-9 13-9 13S3 14.28 3 10a9 9 0 1 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 flex items-center justify-center">
      <div className="flex flex-col lg:flex-row items-center lg:items-start bg-white shadow-lg rounded-xl p-8 lg:p-12 w-full max-w-6xl">
        {/* Left Section */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">Geolocation Finder</h1>
          <div className="bg-gray-100 rounded-lg p-6 shadow-md">
            <label className="block text-sm font-medium text-gray-600 mb-2">Enter IP Address</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g., 8.8.8.8"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:outline-none transition"
            />
            <button
              onClick={fetchGeoData}
              className={`w-full mt-4 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition ${loading ? 'cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Geolocation'}
            </button>
          </div>

          {geoData && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center lg:text-left">Geolocation Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <p><span className="font-semibold">IP:</span> {geoData.ip}</p>
                <p><span className="font-semibold">City:</span> {geoData.city}</p>
                <p><span className="font-semibold">Region:</span> {geoData.region}</p>
                <p><span className="font-semibold">Country:</span> {geoData.country}</p>
                <p><span className="font-semibold">Latitude:</span> {geoData.latitude}</p>
                <p><span className="font-semibold">Longitude:</span> {geoData.longitude}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Map */}
        {/* {geoData && L && (
          <div className="flex relative w-52 h-52 lg:w-1/2 mt-8 lg:mt-0">
            <div className="w-[400px] h-[400px] rounded-lg overflow-hidden border border-black shadow-md">
              <MapContainer
                center={[geoData.latitude, geoData.longitude]}
                zoom={13}
                style={{ width: '200px', height: '200px', display: 'flex', margin: 'auto' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[geoData.latitude, geoData.longitude]} icon={customIcon}>
                  <Popup>
                    {geoData.city}, {geoData.region}, {geoData.country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
