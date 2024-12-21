# Inventory Management App

A modern inventory management application for tracking products, sales, and profits with image storage capabilities.

## Features

- User authentication (signup/login)
- Product management with detailed information
- Automatic profit margin calculation
- Image storage with dimension detection
- Hashtag management system
- Modern UI/UX design

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js/Express
- Database: MongoDB
- Authentication & Storage: Firebase
- Image Processing: TensorFlow.js (for dimension detection)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase account
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Create a `.env` file in the server directory:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Create a `.env` file in the client directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
