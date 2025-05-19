// arduinoSetup.js
// A utility file with more detailed examples of Arduino connection

/**
 * This file provides more detailed examples and explanations for Arduino integration.
 * It's meant as a reference for developers who want to understand the WebSerial integration better.
 */

// Utility function to convert hex color to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return { r, g, b };
}

// Utility function to convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Arduino Connection Example
 * This is a more verbose version with additional explanations
 */
class DetailedArduinoConnection {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readLoopPromise = null;
    this.isReading = false;
    this.isConnected = false;
    
    // Event listeners for connection changes
    this.connectionListeners = [];
    
    // Buffer for incoming data
    this.buffer = '';
    
    // Check if WebSerial is supported
    this.supported = 'serial' in navigator;
    
    // Auto-reconnect settings
    this.autoReconnect = false;
    this.reconnectInterval = 5000; // 5 seconds
    this.reconnectTimeout = null;
  }
  
  /**
   * Add a connection status change listener
   * @param {Function} callback - Function to call on connection status change
   */
  addConnectionListener(callback) {
    if (typeof callback === 'function') {
      this.connectionListeners.push(callback);
    }
  }
  
  /**
   * Remove a connection listener
   * @param {Function} callback - The callback to remove
   */
  removeConnectionListener(callback) {
    const index = this.connectionListeners.indexOf(callback);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all connection listeners of a status change
   * @param {boolean} connected - Current connection status
   */
  notifyConnectionListeners(connected) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
  
  /**
   * Check if WebSerial API is supported
   * @returns {boolean} True if supported, false otherwise
   */
  isSupported() {
    return this.supported;
  }
  
  /**
   * Connect to an Arduino device
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>} True if connected successfully
   */
  async connect(options = {}) {
    const defaultOptions = {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 255,
      autoConnect: false
    };
    
    const connectionOptions = { ...defaultOptions, ...options };
    
    if (!this.isSupported()) {
      console.error('WebSerial API is not supported in this browser');
      return false;
    }
    
    try {
      // If already connected, disconnect first
      if (this.isConnected) {
        await this.disconnect();
      }
      
      // Request a port from the user
      // This will show a browser dialog for the user to select their Arduino
      this.port = await navigator.serial.requestPort();
      
      // Open the serial port with the specified options
      await this.port.open(connectionOptions);
      
      // Set up writer for sending data to Arduino
      this.writer = this.port.writable.getWriter();
      
      // Start the reading loop to receive data from Arduino
      this.startReadLoop();
      
      // Update connection status
      this.isConnected = true;
      this.notifyConnectionListeners(true);
      
      // Set auto-reconnect if enabled
      this.autoReconnect = connectionOptions.autoConnect;
      
      console.log('Successfully connected to Arduino');
      return true;
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      this.isConnected = false;
      this.notifyConnectionListeners(false);
      return false;
    }
  }
  
  /**
   * Start reading data from Arduino
   * This sets up a continuous reading loop that processes
   * incoming data from the Arduino
   */
  startReadLoop() {
    if (!this.port || !this.port.readable || this.isReading) return;
    
    const textDecoder = new TextDecoder();
    this.isReading = true;
    
    this.readLoopPromise = (async () => {
      while (this.port && this.port.readable && this.isReading) {
        try {
          this.reader = this.port.readable.getReader();
          
          try {
            while (true) {
              const { value, done } = await this.reader.read();
              
              if (done) {
                break;
              }
              
              // Process incoming data
              if (value) {
                const text = textDecoder.decode(value);
                this.processIncomingData(text);
              }
            }
          } catch (error) {
            console.error('Error reading from Arduino:', error);
          } finally {
            // Always release the reader lock when done
            this.reader.releaseLock();
            this.reader = null;
          }
        } catch (error) {
          console.error('Error acquiring reader lock:', error);
          break;
        }
      }
      
      this.isReading = false;
      
      // If auto-reconnect is enabled and we're not intentionally disconnecting
      if (this.autoReconnect && this.port) {
        console.log('Connection lost. Attempting to reconnect...');
        this.reconnectTimeout = setTimeout(() => {
          this.reconnect();
        }, this.reconnectInterval);
      }
    })();
  }
  
  /**
   * Process incoming data from Arduino
   * @param {string} text - The received text
   */
  processIncomingData(text) {
    // Add to buffer
    this.buffer += text;
    
    // Process complete lines
    const lines = this.buffer.split('\n');
    
    // If we have at least one complete line
    if (lines.length > 1) {
      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          console.log('Received from Arduino:', line);
          // Here you could add additional processing or callbacks
        }
      }
      
      // Keep the incomplete line in the buffer
      this.buffer = lines[lines.length - 1];
    }
  }
  
  /**
   * Send data to Arduino
   * @param {string|Uint8Array} data - The data to send
   * @returns {Promise<boolean>} True if sent successfully
   */
  async send(data) {
    if (!this.writer || !this.isConnected) {
      console.error('Not connected to Arduino');
      return false;
    }
    
    try {
      const encoder = new TextEncoder();
      let dataToSend;
      
      if (typeof data === 'string') {
        // Ensure the string ends with a newline
        if (!data.endsWith('\n')) {
          data += '\n';
        }
        dataToSend = encoder.encode(data);
      } else if (data instanceof Uint8Array) {
        dataToSend = data;
      } else {
        throw new Error('Data must be a string or Uint8Array');
      }
      
      await this.writer.write(dataToSend);
      return true;
    } catch (error) {
      console.error('Error sending data to Arduino:', error);
      return false;
    }
  }
  
  /**
   * Send color to Arduino
   * @param {string} hexColor - Color in hex format (#RRGGBB)
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendColor(hexColor) {
    if (!this.isConnected) {
      console.error('Not connected to Arduino');
      return false;
    }
    
    try {
      // Convert hex color to RGB
      const { r, g, b } = hexToRgb(hexColor);
      
      // Create the message in the format expected by Arduino
      const message = `${r},${g},${b}\n`;
      
      // Send the message
      const result = await this.send(message);
      
      if (result) {
        console.log(`Sent color to Arduino: R=${r}, G=${g}, B=${b}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending color to Arduino:', error);
      return false;
    }
  }
  
  /**
   * Send a command to trigger a specific effect on Arduino
   * @param {string} effect - The effect name
   * @param {Object} params - Additional parameters
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendEffect(effect, params = {}) {
    if (!this.isConnected) {
      console.error('Not connected to Arduino');
      return false;
    }
    
    try {
      // Build the effect command
      let command = `EFFECT:${effect}`;
      
      // Add any parameters
      if (Object.keys(params).length > 0) {
        command += `:${JSON.stringify(params)}`;
      }
      
      // Send the command
      const result = await this.send(command);
      
      if (result) {
        console.log(`Sent effect to Arduino: ${effect}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending effect to Arduino:', error);
      return false;
    }
  }
  
  /**
   * Attempt to reconnect to Arduino
   * @returns {Promise<boolean>} True if reconnected successfully
   */
  async reconnect() {
    if (this.isConnected) return true;
    
    try {
      // If we already have a port, try to reopen it
      if (this.port) {
        await this.port.open({
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          flowControl: 'none'
        });
        
        // Set up writer
        this.writer = this.port.writable.getWriter();
        
        // Start read loop
        this.startReadLoop();
        
        this.isConnected = true;
        this.notifyConnectionListeners(true);
        console.log('Successfully reconnected to Arduino');
        return true;
      } else {
        // Need to request a new port
        return await this.connect();
      }
    } catch (error) {
      console.error('Error reconnecting to Arduino:', error);
      
      // Schedule another reconnect attempt
      if (this.autoReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnect();
        }, this.reconnectInterval);
      }
      
      return false;
    }
  }
  
  /**
   * Disconnect from Arduino
   * @returns {Promise<void>}
   */
  async disconnect() {
    // Cancel any pending reconnect
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isReading = false;
    this.autoReconnect = false;
    
    try {
      // Release the writer
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
      
      // Release the reader
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
      
      // Wait for the read loop to finish
      if (this.readLoopPromise) {
        await this.readLoopPromise;
      }
      
      // Close the port
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      
      this.isConnected = false;
      this.notifyConnectionListeners(false);
      console.log('Disconnected from Arduino');
    } catch (error) {
      console.error('Error disconnecting from Arduino:', error);
    }
  }
}

/**
 * Usage Example:
 * 
 * // Create the connection
 * const arduino = new DetailedArduinoConnection();
 * 
 * // Check if WebSerial is supported
 * if (!arduino.isSupported()) {
 *   alert('WebSerial is not supported in this browser. Please use Chrome, Edge, or Opera.');
 * }
 * 
 * // Connect to Arduino when needed
 * async function connectToArduino() {
 *   const connected = await arduino.connect();
 *   if (connected) {
 *     // Success! Do something with the connection
 *     arduino.sendColor('#FF0000'); // Send red color
 *   } else {
 *     // Connection failed
 *     console.error('Could not connect to Arduino');
 *   }
 * }
 * 
 * // Add a listener for connection changes
 * arduino.addConnectionListener((connected) => {
 *   if (connected) {
 *     console.log('Arduino connected!');
 *   } else {
 *     console.log('Arduino disconnected!');
 *   }
 * });
 * 
 * // Disconnect when done
 * function cleanup() {
 *   arduino.disconnect();
 * }
 */

export { DetailedArduinoConnection, hexToRgb, rgbToHex };