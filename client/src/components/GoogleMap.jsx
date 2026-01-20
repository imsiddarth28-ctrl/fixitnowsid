import { useEffect, useRef, useState } from 'react';

const GoogleMap = ({ job, user }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        // Check if Google Maps is loaded
        if (!window.google || !window.google.maps) {
            setMapError(true);
            console.error('Google Maps API not loaded');
            return;
        }

        const lat = job?.location?.latitude || job?.location?.lat || 28.6139; // Default to Delhi
        const lng = job?.location?.longitude || job?.location?.lng || 77.2090;

        if (!mapInstance.current && mapRef.current) {
            // Initialize map
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 15,
                styles: [
                    {
                        "elementType": "geometry",
                        "stylers": [{ "color": "#212121" }]
                    },
                    {
                        "elementType": "labels.icon",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#757575" }]
                    },
                    {
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#212121" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#2c2c2c" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#000000" }]
                    }
                ],
                disableDefaultUI: true,
                zoomControl: false
            });

            // Add marker
            markerRef.current = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapInstance.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                },
                animation: window.google.maps.Animation.DROP
            });
        } else if (mapInstance.current && markerRef.current) {
            // Update position
            const newPos = { lat, lng };
            mapInstance.current.setCenter(newPos);
            markerRef.current.setPosition(newPos);
        }
    }, [job]);

    if (mapError) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{ fontSize: '3rem' }}>🗺️</div>
                <div style={{ fontWeight: 700 }}>Map Loading...</div>
                <div style={{ fontSize: '0.8rem' }}>Using fallback coordinates</div>
            </div>
        );
    }

    return <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#050505' }} />;
};

export default GoogleMap;
