// backend/utils/logger.js
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
      SUCCESS: '\x1b[32m' // Green
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${level}] ${timestamp} - ${message}${reset}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }

    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
  }

  static error(message, data = {}) {
    this.log('ERROR', message, data);
  }

  static warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  static info(message, data = {}) {
    this.log('INFO', message, data);
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }

  static success(message, data = {}) {
    this.log('SUCCESS', message, data);
  }
}

module.exports = Logger;
