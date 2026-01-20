# Google Maps API Setup for FixItNow

## Overview
The FixItNow application uses Google Maps API for real-time job tracking and location services.

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional, for address lookup)
4. Go to "Credentials" and create an API key
5. (Optional but recommended) Restrict your API key:
   - Set application restrictions (HTTP referrers)
   - Add your domain (e.g., `localhost:5173/*` for development)
   - Set API restrictions to only the APIs you need

### 2. Configure the API Key

#### Option 1: Environment Variable (Recommended for Production)
1. Create a `.env` file in the `client` directory:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. Update `index.html` to use the environment variable:
   ```html
   <script>
     window.GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
   </script>
   <script src="https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&libraries=places"></script>
   ```

#### Option 2: Direct Replacement (Quick Setup)
1. Open `client/index.html`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places"></script>
   ```

### 3. Testing

After setup, the map should load automatically in the ActiveJobTracking component. If you see a "Map Loading..." message, check:
- Browser console for errors
- API key is correct
- Required APIs are enabled in Google Cloud Console
- No billing issues (Google Maps requires billing to be enabled)

## Features Using Google Maps

- **Real-time Tracking**: View technician location on the map during active jobs
- **Dark Theme**: Custom styled map matching the app's dark aesthetic
- **Smooth Animations**: Marker animations and map transitions
- **Location Services**: Geocoding and place search (if enabled)

## Fallback Behavior

If Google Maps fails to load:
- A fallback UI is displayed with a map icon
- The app continues to function normally
- Job tracking data is still available in the HUD panel

## Cost Considerations

Google Maps API has a free tier:
- $200 free credit per month
- Covers approximately 28,000 map loads
- Monitor usage in Google Cloud Console

## Security Best Practices

1. **Never commit API keys to version control**
2. Use environment variables for production
3. Restrict API keys by domain/IP
4. Enable only required APIs
5. Set up billing alerts in Google Cloud Console

## Troubleshooting

### Map not loading
- Check browser console for errors
- Verify API key is correct
- Ensure billing is enabled in Google Cloud Console
- Check if APIs are enabled

### "This page can't load Google Maps correctly"
- API key restrictions may be too strict
- Billing not enabled
- API not enabled in Google Cloud Console

### Performance issues
- Reduce map update frequency
- Use clustering for multiple markers
- Optimize map styles

## Support

For issues related to:
- **Google Maps API**: [Google Maps Platform Support](https://developers.google.com/maps/support)
- **FixItNow App**: Check the main README or contact support
