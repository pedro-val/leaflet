import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

export default function Home() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('leaflet').then((L) => {
      const DefaultIcon = new L.Icon({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const MarkerPrototype = L.Marker.prototype;
      MarkerPrototype.options.icon = DefaultIcon;
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        setError(`Erro ao obter localização: ${err.message}`);
      },
    );
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!position) {
    return <p>Obtendo localização...</p>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a 
          href="https://www.openstreetmap.org/copyright"
          >OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Você está aqui</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
