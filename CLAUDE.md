# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multiplayer tic-tac-toe web application built with Node.js, Express, and Socket.IO. It's designed to be easily deployed on EC2 instances for playing with friends over the internet.

## Technology Stack

- **Backend**: Node.js with Express server
- **Real-time Communication**: Socket.IO for multiplayer functionality
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Process Management**: PM2 (recommended for production)

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

### Testing Locally
```bash
# Start the server
npm start

# Open browser to http://localhost:3000
# Open another browser/tab to test multiplayer functionality
```

## Deployment to EC2

### Prerequisites
```bash
# Install Node.js on EC2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for production (recommended)
sudo npm install -g pm2
```

### Deployment Commands
```bash
# Install dependencies
npm install

# Start with PM2 (production)
pm2 start server.js --name "tic-tac-toe"
pm2 save
pm2 startup

# Or start directly (development)
npm start
```

### Important Configuration
- **Port**: Default is 3000, configurable via `PORT` environment variable
- **Security Group**: Must allow inbound traffic on port 3000 (or chosen port)
- **Network Binding**: Server binds to `0.0.0.0` to accept external connections

## Architecture

### Backend Structure
- `server.js` - Main Express server with Socket.IO integration
- Game state management with in-memory storage
- Real-time multiplayer communication

### Frontend Structure  
- `public/index.html` - Main game interface
- `public/style.css` - Responsive styling with gradient design
- `public/script.js` - Client-side game logic and Socket.IO communication

### Game Flow
1. Players join games using shareable Game IDs
2. Real-time synchronization of game state
3. Turn-based gameplay with win/tie detection
4. Automatic reconnection handling

## Security Configuration

### Git Leaks Protection
- **Pre-commit hook**: `.git/hooks/git-leaks-pre-commit.sh` - Scans staged changes
- **Pre-push hook**: `.git/hooks/git-leaks.sh` - Scans commits before pushing

```bash
# Manual security scanning
gitleaks detect -s ./ --log-level=debug --log-opts=-1 -v
gitleaks protect --staged -v --exit-code=100
```

## Troubleshooting

### Port Conflicts
Change port in `server.js` if 3000 is occupied:
```javascript
const PORT = process.env.PORT || 3001;
```

### Connection Issues
- Verify EC2 security group allows inbound traffic on chosen port
- Check server status: `pm2 status` or `ps aux | grep node`
- Ensure correct public IP is used for external access