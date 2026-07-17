# TripNest - Tour & Travel Management System

TripNest is a premium, full-featured web application designed to streamline tour management for administrators and provide customers with an intuitive, responsive interface to explore and book travel plans.

The system ensures secure and efficient data handling for destinations, lodging, transport, and bookings, backed by modern security and payment integrations.

---

### 🌐 Live Deployments
*   **Live Web Application (Vercel)**: [https://tripnest-tours.vercel.app](https://tripnest-tours.vercel.app)
*   **Live REST API (Render)**: [https://tripnest-backend-xakc.onrender.com](https://tripnest-backend-xakc.onrender.com)
*   **API Documentation (Swagger UI)**: [https://tripnest-backend-xakc.onrender.com/swagger-ui/index.html](https://tripnest-backend-xakc.onrender.com/swagger-ui/index.html)

---

## 🚀 Key Features

### 👤 Customer Features
*   **Secure Authentication**: Register and log in securely. Supports Google OAuth2 social login.
*   **Interactive Exploration**: Browse tours with advanced filter criteria (location, price range, lodging rating, transport types).
*   **Booking Engine**: Real-time ticket availability check and seamless reservation.
*   **Razorpay Payments**: Safe and secure UPI, card, and net banking transactions integrated directly into the booking flow.
*   **WhatsApp Support**: Immediate click-to-chat WhatsApp integration for tour support.

### 🔑 Administrator Control Panel
*   **Dashboard**: Monitor active bookings, ticket sales, and availability.
*   **Location Management**: Add, update, and manage travel destinations.
*   **Lodging Management**: Manage hotel/lodging partners (details, address, and ratings).
*   **Transport Management**: Configure available transport methods (buses, flights, train journeys).
*   **Tour Planner**: Combine locations, lodging, and transport into cohesive tour packages.

---

## 🛠️ Technology Stack

### Backend
*   **Core**: Java 21, Spring Boot 3.3.x, Spring Data JPA
*   **Security**: Spring Security, JWT (JSON Web Tokens), OAuth2
*   **Database**: PostgreSQL
*   **Media**: Cloudinary API (for dynamic image hosting)
*   **Payments**: Razorpay API
*   **APIs**: Swagger OpenAPI 3.x

### Frontend
*   **Framework**: React 18 (Vite-based build system)
*   **State Management**: Redux Toolkit & React-Redux
*   **Styling**: Tailwind CSS & Lucide Icons

---

## 📦 Project Structure

```text
tripnest/
├── tour-app-backend/       # Spring Boot Application (Java)
│   ├── src/main/java/      # Source code (Controllers, Services, Repos, Entities)
│   ├── src/main/resources/ # Properties, SQL scripts
│   └── pom.xml             # Maven configuration
└── tours_frontend/         # React Application (JavaScript)
    ├── src/                # Components, Redux state, Routing
    ├── index.html          # Frontend entry point
    └── package.json        # NPM dependencies
```

---

## 🔧 Installation & Setup

### 1. Prerequisites
Make sure you have the following installed:
- **Java JDK 21** or later
- **Node.js** (v18 or later)
- **PostgreSQL Database Server**
- Accounts for **Cloudinary** and **Razorpay** (for API keys)

---

### 2. Database Setup
Create a PostgreSQL database named `TripNestDB`:
```sql
CREATE DATABASE "TripNestDB";
```

---

### 3. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd tour-app-backend
   ```
2. Configure environment variables on your system, or set up placeholders inside `src/main/resources/application.properties` and `application-dev.properties` to avoid exposing secrets:
   ```properties
   # Set the following variables in your environment or active profile:
   # - DB_URL (default: jdbc:postgresql://localhost:5432/TripNestDB)
   # - DB_USERNAME (default: postgres)
   # - DB_PASSWORD (default: your local password)
   # - GOOGLE_CLIENT_ID
   # - GOOGLE_CLIENT_SECRET
   # - CLOUDINARY_CLOUD_NAME
   # - CLOUDINARY_API_KEY
   # - CLOUDINARY_API_SECRET
   # - RAZORPAY_KEY_ID
   # - RAZORPAY_KEY_SECRET
   ```
3. Build and run the backend using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend API will start at: `http://localhost:8080`

---

### 4. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd tours_frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `tours_frontend` directory:
   ```env
   VITE_BASE_URL=http://localhost:8080
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:5173`

---

## 📖 API Documentation & Testing

- **Local Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **Live Swagger UI**: [https://tripnest-backend-xakc.onrender.com/swagger-ui/index.html](https://tripnest-backend-xakc.onrender.com/swagger-ui/index.html)
