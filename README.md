# ServiceFinder 🔧

A full-stack service booking platform connecting customers with service providers.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS (served via Nginx)
- **Backend:** Spring Boot 3.4.1 + Spring Security + JWT
- **Database:** MySQL 8 (Indexed Schema)
- **Cache:** Redis (TTL: 10 minutes)
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (auto test, build, publish to GHCR)

## Features

### Authentication
- **Multi-method Signup/Login:**
  - Phone OTP (demo OTP printed on console)
  - Email OTP (real email via Gmail SMTP)
  - Google Sign-In (OAuth2)
- **Forgot Password:** Reset via Email OTP
- **Role-based access:** Customer, Provider, Admin

### Customer Features
- Browse and search providers by service and location
- Send service requests with location, date, and time
- Track request status (Pending, Accepted, Rejected)
- Profile management (picture upload, edit name/phone, change password)

### Provider Features
- Dashboard with all incoming requests
- Accept/Reject/Delete requests
- Multi-provider support (multiple services per user)
- Real-time notification badges for pending requests

### Admin Features
- Manage customers, providers, and services
- View all requests and platform statistics

### Technical Features
- **Indexed Database Schema** for fast queries
- **Redis Caching** for provider listings
- **Docker Compose** for one-command full-stack deployment
- **CI/CD Pipeline** with GitHub Actions
- **Backup & Restore** procedures documented

## Quick Start (Docker Compose) 🚀

**Teen aasan commands mein poora stack chalayein:**

### Step 1: Repository Clone Karein

\`\`\`bash
git clone https://github.com/Junaid-badshah/ServiceFinder-Web-App.git
cd ServiceFinder-Web-App
\`\`\`

### Step 2: Docker Compose Se Chalayein

\`\`\`bash
sudo docker compose up -d
\`\`\`

Wait karein 1-2 minutes (services start hone tak)

### Step 3: Browser Mein UI Dekhein

**Ab apne browser mein khol lein:**

\`\`\`
http://localhost:5173
\`\`\`

Ya terminal mein yeh chalayein (auto-open):

**Linux:**
\`\`\`bash
xdg-open http://localhost:5173
\`\`\`

**Mac:**
\`\`\`bash
open http://localhost:5173
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
Start-Process http://localhost:5173
\`\`\`

### Step 4: Login Karein

| Role | Email | Password |
|------|-------|----------|
| Customer | 03125756192@customer.local | raza123 |
| Provider | test.provider@test.com | test123 |
| Admin | admin@test.com | admin123 |

### Stack Band Karne Ke Liye

\`\`\`bash
sudo docker compose down
\`\`\`

### Logs Dekhne Ke Liye

\`\`\`bash
sudo docker compose logs -f
\`\`\`

```bash
git clone git@github.com:Junaid-badshah/ServiceFinder-Web-App.git
cd ServiceFinder-Web-App
sudo docker compose up -d
