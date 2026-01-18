import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks/drags to update position
const LocationMarker = ({ position, setPosition }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

// Component to Recenter Map
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    // Default to a central location (e.g., Hyd/India or generic) if no initial
    const [position, setPosition] = useState(initialLocation || { lat: 17.3850, lng: 78.4867 });
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Get Current Location
    const handleGetCurrentLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setPosition(newPos);
                    onLocationSelect(newPos);
                    setLoadingLocation(false);
                },
                (err) => {
                    console.error("Error getting location", err);
                    alert("Could not get your location. Please ensure GPS is enabled.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoadingLocation(false);
        }
    };

    // Update parent when position changes
    useEffect(() => {
        if (onLocationSelect) {
            onLocationSelect(position);
        }
    }, [position]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <RecenterMap lat={position.lat} lng={position.lng} />
            </MapContainer>

            {/* Locate Me Button */}
            <button
                onClick={handleGetCurrentLocation}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                disabled={loadingLocation}
                title="Use My Current Location"
            >
                {loadingLocation ? (
                    <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                ) : (
                    <Navigation size={24} color="var(--primary)" fill={loadingLocation ? "none" : "currentColor"} style={{ opacity: 0.8 }} />
                )}
            </button>

            {/* Instruction Overlay */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'rgba(255,255,255,0.9)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                pointerEvents: 'none'
            }}>
                Tap map to set location
            </div>
        </div>
    );
};

export default LocationPicker;
