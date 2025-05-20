class ArduinoBridge {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readLoopActive = false;
  }

  // Check if Web Serial API is supported
  isSupported() {
    return 'serial' in navigator;
  }

  // Connect to the Arduino
  async connect() {
    if (!this.isSupported()) {
      console.error('Web Serial API is not supported in this browser');
      return false;
    }

    try {
      // Request port access
      this.port = await navigator.serial.requestPort();
      
      // Open the port with correct baud rate (matching Arduino)
      await this.port.open({ baudRate: 9600 });
      
      // Create reader and writer
      this.writer = this.port.writable.getWriter();
      
      // Start the read loop to receive responses
      this.startReadLoop();
      
      console.log('Connected to Arduino');
      return true;
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      return false;
    }
  }

  // Disconnect from the Arduino
  async disconnect() {
    try {
      this.readLoopActive = false;
      
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }
      
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
      
      if (this.port && this.port.readable) {
        await this.port.close();
        this.port = null;
      }
      
      console.log('Disconnected from Arduino');
      return true;
    } catch (error) {
      console.error('Error disconnecting from Arduino:', error);
      return false;
    }
  }

  // Start a read loop to receive messages from Arduino
  async startReadLoop() {
    if (!this.port || !this.port.readable) {
      console.error('Cannot start read loop: port is not open');
      return;
    }

    this.readLoopActive = true;
    
    try {
      this.reader = this.port.readable.getReader();
      
      while (this.readLoopActive) {
        const { value, done } = await this.reader.read();
        
        if (done) {
          // Reader has been canceled
          break;
        }
        
        // Process the received data
        if (value) {
          const textDecoder = new TextDecoder();
          const message = textDecoder.decode(value);
          console.log('Received from Arduino:', message);
        }
      }
    } catch (error) {
      console.error('Error in read loop:', error);
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  // Send data to Arduino
  async sendData(data) {
    if (!this.writer) {
      console.error('Cannot send data: writer is not available');
      return false;
    }
    
    try {
      const encoder = new TextEncoder();
      const dataWithNewline = data + '\n';
      await this.writer.write(encoder.encode(dataWithNewline));
      return true;
    } catch (error) {
      console.error('Error sending data to Arduino:', error);
      return false;
    }
  }

  // Convert hex color to RGB and send to Arduino
  async sendColor(hexColor) {
    // Remove the hash if present
    hexColor = hexColor.replace(/^#/, '');

    // Convert hex to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Send RGB values as comma-separated string
    return this.sendData(`${r},${g},${b}`);
  }
}

export default ArduinoBridge;