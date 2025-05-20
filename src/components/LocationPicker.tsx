"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

interface Props {
  location: string;
  locationURL: string;
  onChange: (coords: { lat: number; lng: number; url: string }) => void;
}

const LocationMarker = ({ onChange }: { onChange: (coords: { lat: number; lng: number; url: string }) => void }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090,
  });

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });

      const gmapURL = `https://www.google.com/maps?q=${lat},${lng}`;
      onChange({ lat, lng, url: gmapURL });
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          const gmapURL = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;
          onChange({ lat: pos.lat, lng: pos.lng, url: gmapURL });
        },
      }}
    />
  );
};

export default function LocationPicker({ locationURL, onChange }: Props) {
  return (
    <div className="space-y-2">
      <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: "300px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onChange={onChange} />
      </MapContainer>
      <p className="text-sm text-gray-600">Click or drag the marker to pick the location.</p>
      <p className="text-sm break-words">Google Maps URL: <a className="text-blue-500 underline" href={locationURL} target="_blank" rel="noopener noreferrer">{locationURL}</a></p>
    </div>
  );
}
