# Quick Setup: Google Maps API

## Immediate Setup (Development)

1. **Get API Key**: Visit https://console.cloud.google.com/
2. **Enable APIs**: 
   - Maps JavaScript API
   - Places API
3. **Copy Your Key**: e.g., `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
4. **Update index.html**: 
   - Open `client/index.html`
   - Find line with `YOUR_GOOGLE_MAPS_API_KEY`
   - Replace with your actual key

## Example

**Before:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

**After:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places"></script>
```

## Important Notes

⚠️ **Billing Required**: Google Maps requires a billing account (includes $200 free credit/month)

⚠️ **Never Commit**: Don't commit your API key to Git! Add to `.gitignore`

✅ **Test**: After setup, refresh your app and check if maps load

## Troubleshooting

**Map not loading?**
- Check browser console for errors
- Verify billing is enabled
- Confirm APIs are enabled
- Check API key is correct

**Need more help?** See `GOOGLE_MAPS_SETUP.md` for detailed instructions.
