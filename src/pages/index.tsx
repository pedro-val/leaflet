import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

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

const initialPosition: LatLngExpression = [-14.235, -51.9253];
const rioDeJaneiro: LatLngExpression = [-22.9068, -43.1729];
const saoPaulo: LatLngExpression = [-23.5505, -46.6333];

const rioDeJaneiroBounds: LatLngBoundsExpression = [
  [-22.9519, -43.2105],
  [-22.8633, -43.1139],
];

const saoPauloBounds: LatLngBoundsExpression = [
  [-23.6821, -46.7359],
  [-23.5015, -46.5445],
];

const initialBounds: LatLngBoundsExpression = [
  [-33.7472, -73.9872],
  [5.2718, -34.7922],
];

export default function Home() {
  const [position, setPosition] = useState<LatLngExpression>(initialPosition);
  const mapRef = useRef<any>(null);

  const handleButtonClick = (
    newPosition: LatLngExpression,
    bounds: LatLngBoundsExpression,
    zoom: number,
  ) => {
    setPosition(newPosition);
    if (mapRef.current) {
      mapRef.current.flyToBounds(bounds, { maxZoom: zoom });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');

      // Corrige o ícone padrão do Leaflet
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

      L.Marker.prototype.options.icon = DefaultIcon;
    }
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '10px',
          background: '#f0f0f0',
        }}
      >
        <button
          onClick={() =>
            handleButtonClick(rioDeJaneiro, rioDeJaneiroBounds, 13)
          }
          style={{ margin: '0 10px' }}
          type="button"
        >
          Rio de Janeiro
        </button>
        <button
          onClick={() => handleButtonClick(saoPaulo, saoPauloBounds, 13)}
          style={{ margin: '0 10px' }}
          type="button"
        >
          São Paulo
        </button>
        <button
          onClick={() => handleButtonClick(initialPosition, initialBounds, 5)}
          style={{ margin: '0 10px' }}
          type="button"
        >
          Visualização Inicial
        </button>
      </div>
      <div style={{ height: '90vh' }}>
        <MapContainer
          center={position}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          whenReady={(mapInstance) => {
            mapRef.current = mapInstance.target;
            mapInstance.target.flyToBounds(initialBounds, { maxZoom: 5 });
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>Você está aqui</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
