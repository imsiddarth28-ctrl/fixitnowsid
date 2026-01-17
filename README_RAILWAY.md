# Hybrid Deployment Guide (Railway + Vercel)

For a real-time app like **FixItNow**, the best architecture is to host the **Backend on Railway** (for persistent WebSockets) and the **Frontend on Vercel** (for speed and global CDN).

## Part 1: Deploy Backend to Railway 🚂

1.  **Create Account**: Go to [Railway.app](https://railway.app/).
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Folder**: Point it to the `server/` directory of this repo.
4.  **Variables**: Add these in the Railway "Variables" tab:
    *   `MONGODB_URI`: Your MongoDB Atlas URL.
    *   `JWT_SECRET`: A secure random string.
    *   `PORT`: `5000` (Railway will usually detect this).
5.  **Status**: Once deployed, Railway will give you a public URL (e.g., `https://fixitnow-production.up.railway.app`).

---

## Part 2: Deploy Frontend to Vercel 🔼

1.  **Create Project**: Go to [Vercel](https://vercel.com/new).
2.  **Import Repo**: Select this GitHub repo.
3.  **Config**:
    *   **Framework Preset**: Vite.
    *   **Root Directory**: `client/`.
4.  **Environment Variables**:
    *   Add `VITE_API_URL`: Set this to your **Railway Backend URL** from Part 1.
5.  **Deploy**: Hit deploy!

---

## Why this is better?
-   **Socket.IO Works**: Railway keeps your server running 24/7, so technicians and customers stay connected for live tracking and chat.
-   **Scalability**: Vercel handles the heavy frontend traffic, while Railway handles the real-time logic.
