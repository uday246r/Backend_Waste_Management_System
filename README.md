# Backend_Waste_Management_System

## Environment Setup

1. Navigate to `env/` and duplicate `example.env` as `.env`.
2. Fill in each key with the values for your deployment.
3. Never commit the `.env` file—it's already ignored via `.gitignore`.

### Required variables

| Key | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay API key id |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `CLIENT_URL` | URL allowed by CORS for API + socket |
| `SOCKET_ORIGIN` | (Optional) Override for socket.io origin |
| `PORT` | Port for the Express server (defaults to `4000`) |