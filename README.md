# Multiplayer Tic Tac Toe

A real-time multiplayer tic-tac-toe game built with Node.js, Express, and Socket.IO. Perfect for hosting on EC2 and playing with friends!

## Features

- Real-time multiplayer gameplay
- Custom game rooms with shareable Game IDs
- Responsive design that works on desktop and mobile
- Automatic reconnection handling
- Clean, modern UI

## Quick Start

### Local Development

1. **Install Node.js** (if not already installed):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and go to `http://localhost:3000`

### EC2 Deployment

1. **Connect to your EC2 instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone/upload your project**:
   ```bash
   git clone <your-repo-url>
   cd demo-gm
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Open port 3000** in your EC2 Security Group:
   - Go to AWS Console → EC2 → Security Groups
   - Select your instance's security group
   - Add inbound rule: Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0

6. **Start the server**:
   ```bash
   npm start
   ```

7. **Access the game**:
   - Open `http://your-ec2-public-ip:3000` in your browser
   - Share this URL with friends to play together!

### Running with PM2 (Recommended for production)

1. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

2. **Start the app**:
   ```bash
   pm2 start server.js --name "tic-tac-toe"
   ```

3. **Save PM2 configuration**:
   ```bash
   pm2 save
   pm2 startup
   ```

## How to Play

1. **Create or Join Game**: Enter a Game ID or leave empty for a random one
2. **Share Game ID**: Give the Game ID to your friend
3. **Wait for Player**: Game starts when both players join
4. **Take Turns**: Players X and O take turns clicking empty cells
5. **Win or Draw**: First player to get 3 in a row wins!

## Development

- **Start development server**: `npm run dev` (with nodemon for auto-restart)
- **Production server**: `npm start`

## Troubleshooting

### Port Issues
If port 3000 is busy, change it in `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001 or any available port
```

### Firewall Issues
Make sure your EC2 security group allows inbound traffic on your chosen port.

### Connection Issues
- Check that the server is running: `pm2 status` or `ps aux | grep node`
- Verify your EC2 public IP is correct
- Ensure your security group rules are properly configured