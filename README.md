# ServiceFinder

Full-stack service booking platform connecting customers with service providers.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Spring Boot 4.1.1 + Spring Security + JWT
- Database: MySQL 8

## Features
- Customer: register, browse providers, send requests
- Provider: register, accept/reject requests, dashboard
- Admin: manage users, view all requests, stats

## Setup

### Database
mysql -u root -p < ServiceFinder-Database/backup_20260930.sql

### Backend
cd ServiceFinder-Backend/ServiceFinder-Backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run

### Frontend
cd ServiceFinder-Frontend
npm install
npm run dev

## Test Accounts
| Role | Email/Phone | Password |
|---|---|---|
| Admin | admin@test.com | admin123 |
| Provider | test.provider@test.com | test123 |
| Customer | 03125756192 | test123 |

## Author
Junaid Badshah
