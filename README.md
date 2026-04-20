# IP Check Dashboard

Realtime Nginx access log monitoring app built with Next.js, MongoDB, Socket.IO, and a custom Node.js server.

## Features

- Reads an Nginx `access.log` stream in real time via `tail -F`
- Extracts IP, endpoint, method, status, and country
- Stores request events in MongoDB
- Detects IPs exceeding the configured requests-per-minute threshold
- Sends Telegram alerts for suspicious activity
- Exposes REST endpoints:
  - `GET /requests`
  - `POST /block-ip`
- Publishes realtime updates with Socket.IO
- Includes a simple browser dashboard with live logs and one-click block actions
- Blocks IPs via `iptables`

## Setup

1. Copy `.env.example` to `.env`
2. Fill in MongoDB and Telegram settings
3. Install dependencies with `npm install`
4. Run in development with `npm run dev`

## Production notes

- This service assumes a Linux host with `tail` and `iptables`
- The process must have permission to read the Nginx log file and execute firewall rules
- For production, run behind a process manager such as `systemd` or `pm2`
- If multiple app instances are used, move rate-limit state to a shared store such as Redis
# ip-blocker
