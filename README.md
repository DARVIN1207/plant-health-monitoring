# Plant Health Monitoring & Smart Farming Dashboard

A comprehensive full-stack web application for monitoring plant health, managing agricultural data, and providing intelligent recommendations for smart farming operations.

## 🌱 Project Overview

This application enables real-time monitoring of plant health metrics, tracks growth patterns, manages agricultural recommendations, and provides alerts for farmers and agronomists. The system features role-based access control with different permissions for Farmers (read-only) and Agronomists (full access).

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3** - Modern responsive design with green/organic theme
- **JavaScript (Vanilla)** - Client-side interactivity and API communication
- **Chart.js** - Interactive charts for data visualization
- **Responsive Design** - Mobile-friendly interface

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight database for data storage
- **JWT (JSON Web Tokens)** - Secure authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
PLANT HEALTH MONITORING/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── db_init.js             # Database initialization & seed data
│   ├── database/
│   │   └── plant_monitoring.db  # SQLite database (auto-created)
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   └── database.js        # Database connection & query helpers
│   └── routes/
│       ├── auth.js            # Authentication routes
│       ├── plants.js          # Plant CRUD routes
│       ├── healthLogs.js      # Health log routes
│       ├── recommendations.js # Recommendation routes
│       └── alerts.js          # Alert routes
├── frontend/
│   ├── index.html             # Login page
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── api.js             # API utility functions
│   └── pages/
│       ├── farmer_dashboard.html        # Farmer dashboard with charts
│       ├── farmer_recommendations.html  # Farmer recommendations/alerts view
│       ├── agronomist_dashboard.html    # Agronomist plant list
│       └── plant_detail.html            # Plant detail & CRUD page
└── README.md                  # This file
```

## 🗄️ Database Schema

### Tables

1. **plants**
   - `plant_id` (PK)
   - `plant_name`
   - `species`
   - `age_days`
   - `location`
   - `farmer_name`
   - `notes`

2. **plant_health_logs**
   - `log_id` (PK)
   - `plant_id` (FK)
   - `log_date`
   - `soil_moisture`, `soil_ph`, `temperature`, `humidity`
   - `sunlight_lux`
   - `nutrient_n`, `nutrient_p`, `nutrient_k`
   - `growth_height_cm`
   - `disease_risk`

3. **agronomists**
   - `agronomist_id` (PK)
   - `username` (UNIQUE)
   - `password` (hashed)
   - `full_name`, `specialization`, `phone`, `email`

4. **recommendations**
   - `rec_id` (PK)
   - `plant_id` (FK)
   - `agronomist_id` (FK)
   - `advice_text`
   - `created_at`

5. **alerts**
   - `alert_id` (PK)
   - `plant_id` (FK)
   - `message`
   - `status` (active/resolved)
   - `created_at`

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- A modern web browser

### Step 1: Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

This will install all required packages:
- express
- sqlite3
- jsonwebtoken
- bcryptjs
- cors
- dotenv

### Step 2: Initialize Database

Run the database initialization script to create the database, tables, and seed data:

```bash
npm run init-db
```

This will:
- Create the SQLite database file at `backend/database/plant_monitoring.db`
- Create all required tables
- Seed the database with:
  - 200 plants with random data
  - 20 agronomist accounts (agro01-agro20)
  - 1 farmer account (farmer001)
  - 7-14 days of health logs per plant
  - Random recommendations and alerts

**Note:** The script may take a few minutes to complete due to the large amount of seed data.

### Step 3: Start the Backend Server

Start the Express server:

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:
```
Connected to SQLite database
Server running on http://localhost:3000
Frontend available at http://localhost:3000
```

### Step 4: Access the Frontend

You have two options to access the frontend:

#### Option A: Using the Backend Server (Recommended)
The backend server serves the frontend files statically. Simply open:
```
http://localhost:3000
```

#### Option B: Using Live Server (VS Code)
1. Open the project in VS Code
2. Install the "Live Server" extension if not already installed
3. Right-click on `frontend/index.html`
4. Select "Open with Live Server"
5. Make sure the backend server is running on port 3000

**Important:** If using Live Server, the frontend will run on a different port (usually 5500), but API calls will still go to `http://localhost:3000/api`. Ensure CORS is enabled (it is by default).

## 🔐 Authentication

### JWT Token Storage
- Tokens are stored in `localStorage`
- Tokens expire after 24 hours
- Token is automatically sent with API requests via `Authorization: Bearer <token>` header

### Demo Credentials

#### Farmer Account (Read-Only Access)
- **Username:** `farmer001`
- **Password:** `pwd001`
- **Access:** View dashboard, charts, recommendations, and alerts (no editing)

#### Agronomist Account (Full Access)
- **Username:** `agro01`
- **Password:** `pass01`
- **Access:** Full CRUD access to plants, health logs, recommendations, and alerts

Additional agronomist accounts: `agro02` through `agro20` (password format: `pass02`, `pass03`, etc.)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login and receive JWT token

### Plants
- `GET /api/plants` - Get all plants (with optional query params: search, species, location)
- `GET /api/plants/:id` - Get specific plant details
- `POST /api/plants` - Create new plant (Agronomist only)
- `PUT /api/plants/:id` - Update plant (Agronomist only)

### Health Logs
- `GET /api/healthlogs/:plant_id` - Get health logs for a plant (optional query: days)
- `POST /api/healthlogs/:plant_id` - Create new health log (Agronomist only)

### Recommendations
- `GET /api/recommendations/:plant_id` - Get recommendations for a plant
- `POST /api/recommendations` - Create recommendation (Agronomist only)

### Alerts
- `GET /api/alerts/:plant_id` - Get alerts for a plant (optional query: status)
- `POST /api/alerts` - Create alert (Agronomist only)

## 👥 User Roles

### Farmer (Read-Only)
- ✅ View dashboard with plant health charts
- ✅ View plant vitals and growth history
- ✅ View recommendations and alerts
- ❌ Cannot add/edit plants or upload logs

### Agronomist (Full Access)
- ✅ All Farmer permissions, plus:
- ✅ Add and edit plants
- ✅ Upload daily health logs
- ✅ Create recommendations
- ✅ Create and manage alerts
- ✅ Full CRUD access to all resources

## 📊 Dashboard Features

### Farmer Dashboard
- **Plant Selection:** Dropdown to select any plant
- **Soil Moisture Trend:** 7-day line chart
- **Temperature Trend:** Line chart showing temperature over time
- **Nutrient Levels:** Bar chart showing NPK values
- **Growth Height:** Line chart tracking plant growth
- **Disease Risk Gauge:** Doughnut chart showing current risk level
- **Plant Vitals Overview:** Current readings display

### Agronomist Dashboard
- **Plant List:** Grid view of all plants with search and filters
- **Add/Edit Plants:** Modal forms for plant management
- **Plant Detail Page:** 
  - View and edit plant information
  - Upload health logs with comprehensive form
  - View health logs history in table format
  - Manage recommendations
  - Manage alerts

## 🎨 UI Features

- **Modern Green Theme:** Agricultural color scheme with gradients
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Interactive Charts:** Powered by Chart.js for data visualization
- **Smooth Animations:** Fade-in effects and transitions
- **Card-based Layout:** Clean, organized information display
- **Search & Filters:** Easy plant discovery and filtering

## 🐛 Troubleshooting

### Database Issues
- If database initialization fails, delete `backend/database/plant_monitoring.db` and run `npm run init-db` again
- Ensure you have write permissions in the `backend/database` directory

### Port Already in Use
- If port 3000 is already in use, set a different port:
  ```bash
  PORT=3001 npm start
  ```
- Update `API_BASE_URL` in `frontend/js/api.js` if using a different port

### CORS Errors
- CORS is enabled by default in the backend
- If you encounter CORS issues, check that the backend server is running
- Ensure API calls use the correct base URL

### Authentication Issues
- Clear browser localStorage if tokens are corrupted:
  ```javascript
  localStorage.clear();
  ```
- Check browser console for error messages

### Charts Not Displaying
- Ensure Chart.js CDN is loaded (check network tab)
- Verify health log data exists for the selected plant
- Check browser console for JavaScript errors

## 📝 Seed Data Details

The seed data includes:
- **200 Plants:** Random names, species, locations, and farmers
- **20 Agronomists:** Usernames agro01-agro20
- **1 Farmer:** Username farmer001
- **7-14 Health Logs per Plant:** Realistic values for all metrics
- **Random Recommendations:** 70% of plants have recommendations
- **Random Alerts:** 30% of plants have alerts

All data uses realistic ranges:
- Soil Moisture: 20-80%
- Soil pH: 5.5-7.5
- Temperature: 18-36°C
- Humidity: 40-90%
- Sunlight: 2,000-80,000 lux
- Nutrients (N/P/K): 20-300
- Growth Height: 10-250 cm
- Disease Risk: 0-100%

## 🔒 Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Role-based access control on the backend
- SQL injection protection via parameterized queries
- Input validation on both frontend and backend

## 📄 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

Feel free to extend this project with additional features such as:
- Real-time data updates via WebSockets
- Export functionality for reports
- Email notifications for alerts
- Mobile app integration
- Advanced analytics and predictions

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console for errors
3. Check server logs for backend errors
4. Verify database initialization completed successfully

---

**Happy Farming! 🌾🌱**


