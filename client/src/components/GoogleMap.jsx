import { useEffect, useRef, useState } from 'react';
import { subscribeToEvent } from '../socket';

const GoogleMap = ({ job, user, showLiveTracking = true }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const technicianMarkerRef = useRef(null);
    const customerMarkerRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const [mapError, setMapError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [technicianLocation, setTechnicianLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [distance, setDistance] = useState(null);

    // Initialize map
    useEffect(() => {
        if (!window.google || !window.google.maps) {
            setMapError(true);
            setErrorMessage('Google Maps API not loaded. Please check your API key configuration.');
            console.error('Google Maps API not loaded');
            return;
        }

        const customerLat = job?.location?.latitude || job?.location?.lat || 28.6139;
        const customerLng = job?.location?.longitude || job?.location?.lng || 77.2090;

        try {
            if (!mapInstance.current && mapRef.current) {
                // Initialize map centered on customer location
                mapInstance.current = new window.google.maps.Map(mapRef.current, {
                    center: { lat: customerLat, lng: customerLng },
                    zoom: 14,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#212121" }] },
                        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
                        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
                        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                    ],
                    disableDefaultUI: true,
                    zoomControl: false,
                    gestureHandling: 'greedy'
                });

                // Add Traffic Layer
                const trafficLayer = new window.google.maps.TrafficLayer();
                trafficLayer.setMap(mapInstance.current);

                // Add customer marker (destination)
                customerMarkerRef.current = new window.google.maps.Marker({
                    position: { lat: customerLat, lng: customerLng },
                    map: mapInstance.current,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 4
                    },
                    title: 'Customer Location',
                    animation: window.google.maps.Animation.DROP
                });

                // Add info window for customer
                const customerInfoWindow = new window.google.maps.InfoWindow({
                    content: `<div style="color: #000; padding: 0.5rem; font-weight: 600;">
                        📍 Customer Location<br/>
                        <span style="font-size: 0.8rem; color: #666;">${job?.location?.address || 'Destination'}</span>
                    </div>`
                });
                customerMarkerRef.current.addListener('click', () => {
                    customerInfoWindow.open(mapInstance.current, customerMarkerRef.current);
                });

                setMapError(false);
            }
        } catch (error) {
            console.error('Google Maps initialization error:', error);
            setMapError(true);
            setErrorMessage(error.message || 'Failed to initialize Google Maps');
        }
    }, [job]);

    // Real-time technician location tracking
    useEffect(() => {
        if (!job?._id || !mapInstance.current || !showLiveTracking) return;

        // Subscribe to technician location updates
        const unsubscribe = subscribeToEvent(`job-${job._id}`, 'technician_location_update', (data) => {
            console.log('Technician location update:', data);

            const { latitude, longitude, timestamp } = data;
            setTechnicianLocation({ lat: latitude, lng: longitude, timestamp });

            // Update or create technician marker
            if (technicianMarkerRef.current) {
                // Smooth animation to new position
                const newPos = { lat: latitude, lng: longitude };
                animateMarker(technicianMarkerRef.current, newPos);
            } else {
                // Create technician marker
                technicianMarkerRef.current = new window.google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: mapInstance.current,
                    icon: {
                        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                        scale: 2,
                        anchor: new window.google.maps.Point(12, 22)
                    },
                    title: 'Technician Location',
                    animation: window.google.maps.Animation.DROP
                });

                // Add info window for technician
                const techInfoWindow = new window.google.maps.InfoWindow({
                    content: `<div style="color: #000; padding: 0.5rem; font-weight: 600;">
                        🔧 Technician<br/>
                        <span style="font-size: 0.8rem; color: #666;">${job?.technicianId?.name || 'On the way'}</span>
                    </div>`
                });
                technicianMarkerRef.current.addListener('click', () => {
                    techInfoWindow.open(mapInstance.current, technicianMarkerRef.current);
                });
            }

            // Calculate and display route
            if (customerMarkerRef.current) {
                calculateRoute(
                    { lat: latitude, lng: longitude },
                    customerMarkerRef.current.getPosition().toJSON()
                );
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [job?._id, showLiveTracking]);

    // Smooth marker animation
    const animateMarker = (marker, newPosition) => {
        const startPosition = marker.getPosition();
        const deltaLat = (newPosition.lat - startPosition.lat()) / 60;
        const deltaLng = (newPosition.lng - startPosition.lng()) / 60;
        let step = 0;

        const animate = () => {
            if (step < 60) {
                const lat = startPosition.lat() + deltaLat * step;
                const lng = startPosition.lng() + deltaLng * step;
                marker.setPosition({ lat, lng });
                step++;
                requestAnimationFrame(animate);
            } else {
                marker.setPosition(newPosition);
            }
        };
        animate();
    };

    // Calculate route and ETA
    const calculateRoute = (origin, destination) => {
        if (!window.google?.maps?.DirectionsService) return;

        const directionsService = new window.google.maps.DirectionsService();
        if (!directionsRendererRef.current) {
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                map: mapInstance.current,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#000000',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                    icons: [{
                        icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
                        offset: '100%',
                        repeat: '100px'
                    }]
                }
            });
        }

        directionsService.route(
            {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: 'bestguess'
                }
            },
            (result, status) => {
                if (status === 'OK') {
                    directionsRendererRef.current.setDirections(result);

                    const route = result.routes[0];
                    const leg = route.legs[0];

                    setDistance(leg.distance.text);
                    setEta(leg.duration.text);

                    // Adjust map bounds to show entire route
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(origin);
                    bounds.extend(destination);
                    mapInstance.current.fitBounds(bounds);

                    // Add some padding
                    mapInstance.current.setZoom(mapInstance.current.getZoom() - 0.5);
                } else {
                    console.error('Directions request failed:', status);
                }
            }
        );
    };

    // Simulate technician location updates (for testing - remove in production)
    useEffect(() => {
        if (!showLiveTracking || user?.role !== 'customer') return;

        // Simulate location updates every 5 seconds for testing
        const interval = setInterval(() => {
            const customerLat = job?.location?.latitude || job?.location?.lat || 28.6139;
            const customerLng = job?.location?.longitude || job?.location?.lng || 77.2090;

            // Random nearby location (within ~1km radius)
            const randomLat = customerLat + (Math.random() - 0.5) * 0.01;
            const randomLng = customerLng + (Math.random() - 0.5) * 0.01;

            // Trigger location update event (this would come from backend in production)
            if (window.dispatchEvent) {
                const event = new CustomEvent('technician_location_update', {
                    detail: {
                        latitude: randomLat,
                        longitude: randomLng,
                        timestamp: new Date().toISOString()
                    }
                });
                // Simulate Pusher event
                setTechnicianLocation({ lat: randomLat, lng: randomLng, timestamp: new Date().toISOString() });

                if (technicianMarkerRef.current) {
                    animateMarker(technicianMarkerRef.current, { lat: randomLat, lng: randomLng });
                    calculateRoute(
                        { lat: randomLat, lng: randomLng },
                        { lat: customerLat, lng: customerLng }
                    );
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [showLiveTracking, user?.role, job]);

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
                color: 'var(--text-muted)',
                padding: '2rem'
            }}>
                <div style={{ fontSize: '3rem' }}>🗺️</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>Map Unavailable</div>
                <div style={{ fontSize: '0.8rem', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>
                    {errorMessage}
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#3b82f6'
                }}>
                    Using fallback coordinates: {job?.location?.address || 'Default Location'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#050505' }} />

            {/* Live Tracking Info Overlay */}
            {showLiveTracking && technicianLocation && user?.role === 'customer' && (
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'rgba(15, 15, 15, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1rem 1.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    color: 'white',
                    minWidth: '200px',
                    zIndex: 5
                }}>
                    <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        LIVE TRACKING
                    </div>
                    {eta && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>
                                ETA
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>
                                {eta}
                            </div>
                        </div>
                    )}
                    {distance && (
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>
                                Distance
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {distance}
                            </div>
                        </div>
                    )}
                    <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.65rem',
                        color: 'rgba(255,255,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#10b981',
                            animation: 'pulse 2s infinite'
                        }} />
                        Updating in real-time
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleMap;
