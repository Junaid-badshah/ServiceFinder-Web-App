# ServiceFinder 🔧

A full-stack service booking platform connecting customers with service providers.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Spring Boot 3.4.1 + Spring Security + JWT
- Database: MySQL 8 (Indexed Schema)
- Cache: Redis (TTL: 10 minutes)
- Container: Docker

## Features
- Customer/Provider/Admin role-based access
- Profile picture upload (camera capture)
- Phone OTP verification
- Change password
- Provider dashboard with request management
- Admin panel for user management

## Database Schema (Indexed)

### Tables
- users — id, name, email, phone, password, role, profile_picture
- providers — id, userId, service, location, experience, rate
- services — id, name, icon, color, active
- service_requests — id, user_id, provider_id, status, description

### Custom Indexes
- users: idx_email (unique)
- providers: idx_service, idx_location, idx_service_location, idx_user_id
- service_requests: idx_status, idx_provider_status, idx_user_id_sr

### Verify Indexes
SHOW INDEX FROM users;
SHOW INDEX FROM providers;
SHOW INDEX FROM service_requests;

## Redis Caching

### What is Cached
- Provider list (providers::all) — TTL 10 minutes
- Provider details (providers::id-X)
- Provider search (providers::search-X-Y)

### Cache Invalidation
Cache automatically clear hoti hai jab provider add/update/delete ho.

### Setup Redis (Docker)
docker run -d --name redis -p 6379:6379 redis:7

### Verify Cache
docker exec -it redis redis-cli
keys *
get providers::all

## Backup & Restore Procedure

### MySQL Backup
docker exec mysql mysqldump -u root -proot servicefinder > ~/backups/servicefinder-$(date +%Y%m%d).sql

### MySQL Restore
docker exec -i mysql mysql -u root -proot servicefinder < ~/backups/servicefinder-20261006.sql

### Redis Backup
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb ~/backups/redis-$(date +%Y%m%d).rdb

### Redis Restore
docker cp ~/backups/redis-20261006.rdb redis:/data/dump.rdb
docker restart redis

## How to Run

### 1. Start MySQL + Redis
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=servicefinder -p 3306:3306 mysql:8
docker run -d --name redis -p 6379:6379 redis:7

### 2. Start Backend
cd ServiceFinder-Backend
./mvnw spring-boot:run

### 3. Start Frontend
cd ServiceFinder-Frontend
npm install
npm run dev

### 4. Open Browser
http://localhost:5173

## Author
Junaid Badshah
GitHub: https://github.com/Junaid-badshah
