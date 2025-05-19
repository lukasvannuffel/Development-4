// arduinoBridge.js
// This file handles the communication between the web app and Arduino

class ArduinoBridge {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readLoopPromise = null;
    this.connected = false;
  }

  // Check if Web Serial API is supported
  isSupported() {
    return 'serial' in navigator;
  }

  // Connect to Arduino
  async connect() {
    if (!this.isSupported()) {
      console.error('Web Serial API is not supported in this browser');
      return false;
    }

    try {
      // Request a port from the user
      this.port = await navigator.serial.requestPort();
      
      // Open the port with proper settings for Arduino
      await this.port.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      // Set up writer
      this.writer = this.port.writable.getWriter();
      
      // Set up reader and start listening
      this.startReadLoop();
      
      this.connected = true;
      console.log('Connected to Arduino');
      return true;
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      return false;
    }
  }

  // Start reading from Arduino
  startReadLoop() {
    if (!this.port) return;
    
    const textDecoder = new TextDecoder();
    let readBuffer = '';
    
    this.readLoopPromise = (async () => {
      while (this.port && this.port.readable) {
        try {
          const reader = this.port.readable.getReader();
          
          try {
            while (true) {
              const { value, done } = await reader.read();
              
              if (done) {
                break;
              }
              
              // Decode the received bytes
              const text = textDecoder.decode(value);
              readBuffer += text;
              
              // Process complete lines
              const lines = readBuffer.split('\n');
              if (lines.length > 1) {
                for (let i = 0; i < lines.length - 1; i++) {
                  const line = lines[i].trim();
                  if (line) {
                    console.log('Received from Arduino:', line);
                    // You can emit events or call callbacks here
                  }
                }
                readBuffer = lines[lines.length - 1];
              }
            }
          } catch (error) {
            console.error('Error reading from Arduino:', error);
          } finally {
            reader.releaseLock();
          }
        } catch (error) {
          console.error('Error acquiring reader lock:', error);
          break;
        }
      }
    })();
  }

  // Send color values to Arduino
  async sendColor(color) {
    if (!this.writer || !this.connected) {
      console.error('Not connected to Arduino');
      return false;
    }
    
    try {
      // Parse hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Create a message format that Arduino code expects
      const message = `${r},${g},${b}\n`;
      
      // Encode and send
      const encoder = new TextEncoder();
      await this.writer.write(encoder.encode(message));
      
      console.log(`Sent to Arduino: ${message.trim()}`);
      return true;
    } catch (error) {
      console.error('Error sending color to Arduino:', error);
      return false;
    }
  }

  // Disconnect from Arduino
  async disconnect() {
    if (!this.port) return;
    
    try {
      // Release writer
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
      
      // Wait for read loop to finish
      if (this.readLoopPromise) {
        await this.readLoopPromise;
      }
      
      // Close the port
      await this.port.close();
      this.port = null;
      this.connected = false;
      console.log('Disconnected from Arduino');
    } catch (error) {
      console.error('Error disconnecting from Arduino:', error);
    }
  }

  // Quick pulse/fade effect for transitions
  async pulseEffect() {
    if (!this.connected) return false;
    
    try {
      // Send a command to trigger the pulse effect
      const message = 'PULSE\n';
      const encoder = new TextEncoder();
      await this.writer.write(encoder.encode(message));
      return true;
    } catch (error) {
      console.error('Error sending pulse effect to Arduino:', error);
      return false;
    }
  }
}

export default ArduinoBridge;