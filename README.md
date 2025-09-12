# Language Acquisition Monitor App

This project contains a Dockerized setup for:
- Frontend (React + Vite, served by Nginx)
- Backend (Node.js + Express)
- Database (PostgreSQL)

## Running

1. SSH into your Debian EC2 instance.
2. Install Docker + Docker Compose plugin.
3. Upload this project or clone from your repo.
4. Run:
   docker compose up -d --build

## Ports
- Frontend: http://<EC2_IP>:4000
- Backend API: http://<EC2_IP>:4001
