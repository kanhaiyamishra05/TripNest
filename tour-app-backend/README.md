# TripNest - Backend API Service

This is the backend API service for the TripNest platform, built using Spring Boot, Spring Security, JPA Hibernate, and PostgreSQL.

## Features
- **REST APIs**: Full CRUD operations for locations, lodging, transport, and tour management.
- **Authentication**: JWT-based token authentication and Google OAuth2 social login.
- **Security**: Method-level role-based authorization (ROLE_ADMIN, ROLE_CUSTOMER).
- **Payment Processing**: Integrated Stripe payment backend.
- **Image Uploads**: Dynamic image hosting utilizing Cloudinary.
- **API Documentation**: Automated OpenAPI Swagger documentation.

## Running the Service

### Properties Setup
Configure database and third-party APIs in your `src/main/resources/application-dev.properties` and `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/TripNestDB
spring.datasource.username=postgres
spring.datasource.password=your_db_password
```

### Build & Run
Compile and run the Spring Boot server:
```bash
./mvnw spring-boot:run
```

API Server runs at: `http://localhost:8080`
Swagger Docs UI: `http://localhost:8080/swagger-ui/index.html`
