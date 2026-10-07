# ServiceFinder 🔧

A full-stack service booking platform connecting customers with service providers.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS (Nginx)
- **Backend:** Spring Boot 3.4.1 + Spring Security + JWT
- **Database:** MySQL 8 (Indexed Schema)
- **Cache:** Redis (TTL: 10 minutes)
- **Container:** Docker + Docker Compose

## Features
- Customer/Provider/Admin role-based access
- Profile picture upload (camera capture)
- Phone OTP verification
- Change password
- Provider dashboard with request management
- Admin panel for user management
- Multi-provider support (multiple services per user)
- Real-time notification badges

## Quick Start (Docker Compose)

**Ek command mein poora stack chalayein:**

```bash
git clone git@github.com:Junaid-badshah/ServiceFinder-Web-App.git
cd ServiceFinder-Web-App
sudo docker compose up -d
