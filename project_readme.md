# 🔐 Block Secure - MetaMask Authentication App

A modern, secure Web3 authentication application that enables users to connect and authenticate using their MetaMask wallet. Built with React, Node.js, and blockchain technology for seamless decentralized identity management.

<!-- ![Block Secure Demo](https://via.placeholder.com/800x400/0f172a/4299e1?text=Block+Secure+Demo) -->

## ✨ Features

### 🔑 **Authentication & Security**

- **MetaMask Integration** - Seamless wallet connection and authentication
- **Signature-based Login** - Cryptographic signature verification for secure access
- **JWT + Refresh Tokens** - Secure session management with automatic token refresh
- **Rate Limiting** - Protection against brute force attacks
- **Address Validation** - Comprehensive Ethereum address format validation

### 🎨 **User Experience**

- **Professional UI** - Modern blockchain-themed interface with smooth animations
- **Real-time Status** - Live connection status and network information
- **Responsive Design** - Optimized for desktop and mobile devices
- **Error Handling** - Comprehensive error boundaries and user-friendly messages
- **Loading States** - Intuitive loading indicators and progress feedback

### 🔒 **Security Features**

- **Nonce-based Authentication** - Prevents replay attacks
- **Input Sanitization** - Protection against injection attacks
- **CORS Configuration** - Secure cross-origin resource sharing
- **Security Headers** - Helmet.js for enhanced security
- **Session Management** - Secure token storage and automatic cleanup

### 🌐 **Network Support**

- Ethereum Mainnet
- Goerli & Sepolia Testnets
- Polygon (Mainnet & Mumbai)
- BSC (Mainnet & Testnet)
- Avalanche (Mainnet & Fuji)
- Optimism & Arbitrum

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern React with hooks and functional components
- **CSS3** - Custom styling with CSS variables and modern layouts
- **Axios** - HTTP client with interceptors for API communication
- **Web3.js** - Ethereum blockchain interaction

### **Backend**

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Crypto** - Node.js crypto module for secure random generation

### **Development Tools**

- **Create React App** - React development environment
- **Nodemon** - Development server with hot reload
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **MetaMask** browser extension
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/metamask-login-app.git
cd metamask-login-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd metamask-login-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Environment Configuration

#### Backend `.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/metamask-login
# or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/metamask-login

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=1h

# Ethereum Node (optional - for advanced features)
ETH_NODE_URL=https://mainnet.infura.io/v3/your-project-id

# Server Configuration
PORT=8000
NODE_ENV=development
```

#### Frontend `.env`

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api

# Blockchain Configuration (optional)
REACT_APP_CHAIN_ID=1
REACT_APP_NETWORK_NAME=Ethereum Mainnet

# Development
REACT_APP_ENV=development
```

### 5. Start the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

#### Start Frontend Development Server

```bash
cd metamask-login-app
npm start
```

Visit `http://localhost:3000` to see the application in action!

## 📚 Usage Guide

### 1. **Connect Wallet**

- Click "Connect MetaMask" button
- Approve connection in MetaMask popup
- Your wallet address will be displayed

### 2. **Authenticate**

- After connecting, click to sign authentication message
- Sign the message in MetaMask
- You'll be authenticated and receive session tokens

### 3. **Session Management**

- Tokens are automatically refreshed
- Sessions persist across browser refreshes
- Use logout button to end session securely

## 🏗️ Project Structure

```
metamask-login-app/
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   │   ├── auth.js        # Authentication logic
│   │   └── users.js       # User management
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # JWT authentication
│   │   ├── rateLimiter.js # Rate limiting
│   │   └── validators.js  # Input validation
│   ├── models/           # MongoDB models
│   │   ├── User.js       # User schema
│   │   └── RefreshToken.js # Token schema
│   ├── routes/           # API routes
│   │   ├── auth.js       # Auth endpoints
│   │   └── users.js      # User endpoints
│   ├── utils/            # Utility functions
│   │   └── crypto.js     # Cryptographic functions
│   ├── .env.example      # Environment template
│   ├── package.json      # Dependencies
│   └── server.js         # Express server
│
├── metamask-login-app/     # React frontend
│   ├── public/            # Static files
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── BrandLogo.js
│   │   │   ├── Button.js
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── NetworkIndicator.js
│   │   │   ├── StatusMessage.js
│   │   │   └── WalletConnect.js
│   │   ├── config/        # Configuration
│   │   │   ├── apiConfig.js
│   │   │   └── constants.js
│   │   ├── pages/         # Page components
│   │   │   └── LoginPage.js
│   │   ├── styles/        # CSS styling
│   │   │   ├── components/ # Component styles
│   │   │   ├── global.css  # Global styles
│   │   │   ├── index.css   # Main CSS imports
│   │   │   └── theme.css   # CSS variables
│   │   ├── utils/         # Utility functions
│   │   │   ├── api.js      # API client
│   │   │   ├── auth.js     # Auth helpers
│   │   │   ├── logger.js   # Logging utility
│   │   │   └── navigation.js # Navigation helpers
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   ├── .env.example       # Environment template
│   └── package.json       # Dependencies
│
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

#### Backend

```bash
npm run dev        # Start with nodemon (development)
npm start          # Start production server
npm test           # Run tests
```

### Code Style Guidelines

- **ES6+** features and modern JavaScript
- **Functional components** with React hooks
- **Async/await** for asynchronous operations
- **Error boundaries** for component error handling
- **Consistent naming** conventions (camelCase)
- **Comprehensive comments** for complex logic

### Adding New Features

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow existing patterns**

   - Use existing component structure
   - Follow CSS naming conventions
   - Add proper error handling

3. **Test thoroughly**

   - Test with different wallet states
   - Test error scenarios
   - Test responsive design

4. **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update API documentation

## 🔐 Security Considerations

### Best Practices Implemented

- **Never store private keys** - Only public addresses are stored
- **Signature verification** - All authentication uses cryptographic signatures
- **Rate limiting** - Protection against brute force attacks
- **Input validation** - All inputs are sanitized and validated
- **Secure token storage** - JWTs with proper expiration
- **HTTPS enforcement** - Secure communication in production

### Security Checklist

- [ ] Environment variables are properly configured
- [ ] Database connection is secured
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive information
- [ ] CORS is properly configured
- [ ] Security headers are enabled

## 🐛 Troubleshooting

### Common Issues

#### MetaMask Not Detected

```javascript
// Check if MetaMask is installed
if (typeof window.ethereum === "undefined") {
  console.error("MetaMask not installed");
}
```

#### Connection Issues

1. **Check network configuration**
2. **Verify environment variables**
3. **Ensure MongoDB is running**
4. **Check browser console for errors**

#### Authentication Failures

1. **Verify wallet has ETH for gas**
2. **Check signature format**
3. **Ensure nonce is current**
4. **Verify network compatibility**

### Error Codes

| Code                  | Description              | Solution                  |
| --------------------- | ------------------------ | ------------------------- |
| `MISSING_FIELDS`      | Required fields missing  | Check request body        |
| `INVALID_ADDRESS`     | Invalid Ethereum address | Validate address format   |
| `USER_NOT_FOUND`      | User doesn't exist       | Call find-or-create first |
| `SIGNATURE_MISMATCH`  | Invalid signature        | Re-sign message           |
| `RATE_LIMIT_EXCEEDED` | Too many requests        | Wait and retry            |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure backward compatibility
- Add proper error handling

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MetaMask** for wallet integration
- **React Community** for excellent tooling
- **Web3 Community** for blockchain standards
- **MongoDB** for database solutions

## 📞 Support

If you encounter any issues or have questions:

1. **Check troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create new issue** with detailed description
4. **Join our Discord** for community support

## 🚀 Roadmap

### Version 2.0 (Coming Soon)

- [ ] Multi-wallet support (WalletConnect, Coinbase)
- [ ] User profiles and preferences
- [ ] Transaction history
- [ ] Enhanced security features

### Version 3.0 (Future)

- [ ] Mobile app (React Native)
- [ ] Hardware wallet support
- [ ] Advanced analytics
- [ ] Enterprise features

---

**Built with 💀**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Powered by Ethereum](https://img.shields.io/badge/Powered%20by-Ethereum-627EEA?style=flat-square&logo=ethereum)](https://ethereum.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
