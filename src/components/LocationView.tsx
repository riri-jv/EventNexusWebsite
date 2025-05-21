'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';

interface Props {
  location: string;
  locationURL: string;
}

export default function LocationView({ location, locationURL }: Props) {
  // Extract coordinates from Google Maps URL
  const coordsMatch = locationURL.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  const coords = coordsMatch 
    ? [parseFloat(coordsMatch[1]), parseFloat(coordsMatch[2])]
    : [28.6139, 77.2090]; // Default coordinates if parsing fails

  return (
    <div className="space-y-2">
      <MapContainer 
        center={coords as [number, number]} 
        zoom={15} 
        style={{ height: "300px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coords as [number, number]} />
      </MapContainer>
      <p className="text-sm break-words">
        <a 
          className="text-blue-500 underline" 
          href={locationURL} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View on Google Maps
        </a>
      </p>
    </div>
  );
}