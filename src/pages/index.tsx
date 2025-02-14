/* eslint-disable global-require */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import {
  LatLngExpression,
  LatLngBoundsExpression,
  LeafletEvent,
} from 'leaflet';

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
  const [restaurants, setRestaurants] = useState<
    Array<{ id: number; name: string; position: LatLngExpression }>
  >([]);
  const [rioCount, setRioCount] = useState<number>(0);
  const [spCount, setSpCount] = useState<number>(0);
  const [countsLoaded, setCountsLoaded] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<string>('initial');
  const [loading, setLoading] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

  // Spinner usando Tailwind CSS
  const spinner = (
    <div
      className="w-4 h-4 border-2 border-gray-300
     border-t-gray-900 rounded-full animate-spin mx-auto"
    />
  );

  const fetchRestaurants = async (lat: number, lon: number) => {
    const query = `[out:json];
      node[amenity=restaurant](around:50000,${lat},${lon});
      out body;`;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await response.json();
    return data.elements.map((el: any) => ({
      id: el.id,
      name: el.tags && el.tags.name ? el.tags.name : `Restaurante ${el.id}`,
      position: [el.lat, el.lon] as LatLngExpression,
    }));
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const rioRestaurants = await fetchRestaurants(
          (rioDeJaneiro as [number, number])[0],
          (rioDeJaneiro as [number, number])[1],
        );
        setRioCount(rioRestaurants.length);

        const spRestaurants = await fetchRestaurants(
          (saoPaulo as [number, number])[0],
          (saoPaulo as [number, number])[1],
        );
        setSpCount(spRestaurants.length);
        setCountsLoaded(true);
      } catch (error) {
        console.error('Erro ao buscar contagens:', error);
      }
    };
    fetchCounts();
  }, []);

  const restaurantIcon = useMemo(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      return new L.Icon({
        iconUrl: '/restaurant.svg',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });
    }
    return null;
  }, []);

  const handleButtonClick = async (
    newPosition: LatLngExpression,
    bounds: LatLngBoundsExpression,
    zoom: number,
    city: string,
  ) => {
    setPosition(newPosition);
    setActiveCity(city);
    if (mapRef.current) {
      mapRef.current.flyToBounds(bounds, { maxZoom: zoom });
    }
    if (city === 'initial') {
      setRestaurants([]);
      setLoading(false);
    } else {
      setLoading(true);
      const [lat, lon] =
        city === 'rio'
          ? (rioDeJaneiro as [number, number])
          : (saoPaulo as [number, number]);
      try {
        const fetchedRestaurants = await fetchRestaurants(lat, lon);
        setRestaurants(fetchedRestaurants);
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
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
      <div className="flex justify-center items-end p-2 bg-gray-100 gap-5">
        <div className="text-center">
          <div className="font-bold">Rio de Janeiro</div>
          <div>
            {(() => {
              if ((activeCity === 'rio' && loading) || !countsLoaded) {
                return spinner;
              }
              if (rioCount > 0) {
                return `${rioCount} restaurantes`;
              }
              return '';
            })()}
          </div>
          <button
            onClick={() =>
              handleButtonClick(rioDeJaneiro, rioDeJaneiroBounds, 13, 'rio')
            }
            type="button"
            className="mt-2 px-3 py-1 bg-blue-500
             hover:bg-blue-600 text-white rounded"
          >
            Rio de Janeiro
          </button>
        </div>
        <div className="text-center">
          <div className="font-bold">São Paulo</div>
          <div>
            {(() => {
              if ((activeCity === 'sp' && loading) || !countsLoaded) {
                return spinner;
              }
              if (spCount > 0) {
                return `${spCount} restaurantes`;
              }
              return '';
            })()}
          </div>
          <button
            onClick={() =>
              handleButtonClick(saoPaulo, saoPauloBounds, 13, 'sp')
            }
            type="button"
            className="mt-2 px-3 py-1 bg-blue-500
             hover:bg-blue-600 text-white rounded"
          >
            São Paulo
          </button>
        </div>
        <div className="text-center">
          <div className="font-bold">Visualização Inicial</div>
          <div>{/* Sem número */}</div>
          <button
            onClick={() =>
              handleButtonClick(initialPosition, initialBounds, 5, 'initial')
            }
            type="button"
            className="mt-2 px-3 py-1 bg-blue-500
             hover:bg-blue-600 text-white rounded"
          >
            Visualização Inicial
          </button>
        </div>
      </div>
      <div className="h-[90vh]">
        <MapContainer
          center={position}
          zoom={5}
          className="h-full w-full"
          whenReady={
            ((mapInstance: LeafletEvent) => {
              mapRef.current = mapInstance.target;
              mapInstance.target.flyToBounds(initialBounds, { maxZoom: 5 });
            }) as unknown as () => void
          }
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
          {restaurantIcon &&
            restaurants.length > 0 &&
            restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={restaurant.position}
                icon={restaurantIcon}
              >
                <Popup>{restaurant.name}</Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}
