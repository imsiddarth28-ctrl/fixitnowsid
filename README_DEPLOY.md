# Deploying FixItNow to Vercel

The project has been refactored to be **Vercel-ready**. The backend now supports serverless connection pooling for MongoDB and graceful handling of Socket.IO limitations.

## Step 1: Environment Variables
You MUST set the following Environment Variables in your Vercel Project Settings:

### Backend (Server)
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure string for token signing.
- `PUSHER_APP_ID`: From your Pusher Dashboard.
- `PUSHER_KEY`: From your Pusher Dashboard.
- `PUSHER_SECRET`: From your Pusher Dashboard.
- `PUSHER_CLUSTER`: From your Pusher Dashboard (e.g., `mt1`).

### Frontend (Client)
- `VITE_API_URL`: Your backend URL.
- `VITE_PUSHER_KEY`: Same as above.
- `VITE_PUSHER_CLUSTER`: Same as above.

## Note on Real-Time Features
The app has been refactored to use **Pusher**, which is 100% compatible with Vercel's serverless environment. All features (Live Tracking, Chat, Alerts) will work perfectly on Vercel!
