/*
 * Arduino LED Control for Electio
 * 
 * This sketch receives RGB color values via Serial and 
 * controls an LED panel/strip to match the background color
 * of the Electio web application.
 * 
 * Hardware requirements:
 * - Arduino (Uno, Mega, Nano, etc.)
 * - RGB LED strip/panel (WS2812B/NeoPixel recommended)
 * - 5V power supply (suitable for your LED configuration)
 * - Optional: Level shifter if using 5V LEDs with 3.3V Arduino
 */

#include <Adafruit_NeoPixel.h>

// Which pin on the Arduino is connected to the NeoPixels?
#define LED_PIN     6  // Change to the pin you're using

// How many NeoPixels are attached to the Arduino?
#define LED_COUNT  30  // Change to match your setup

// NeoPixel brightness, 0 (min) to 255 (max)
#define BRIGHTNESS 150  // Adjust based on your preference

// Declare our NeoPixel strip object:
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// Variables to store the most recent RGB values
int currentRed = 0;
int currentGreen = 0;
int currentBlue = 0;

// Buffer for incoming serial data
String inputBuffer = "";
boolean newData = false;

void setup() {
  // Initialize serial port
  Serial.begin(9600);
  Serial.println("Electio LED Controller ready");
  
  // Initialize LED strip
  strip.begin();
  strip.setBrightness(BRIGHTNESS);
  strip.show(); // Initialize all pixels to 'off'
  
  // Show startup sequence
  startupAnimation();
}

void loop() {
  // Read incoming serial data
  readSerialData();
  
  // Process new RGB values if received
  if (newData) {
    // Update all LEDs with the new color
    setAllPixels(currentRed, currentGreen, currentBlue);
    
    // Reset flag
    newData = false;
    
    // Print confirmation
    Serial.print("Color set to RGB: ");
    Serial.print(currentRed);
    Serial.print(",");
    Serial.print(currentGreen);
    Serial.print(",");
    Serial.println(currentBlue);
  }
  
  // Small delay to avoid overwhelming the serial port
  delay(10);
}

// Read and parse incoming serial data
void readSerialData() {
  while (Serial.available() > 0) {
    char inChar = (char)Serial.read();
    
    // Process message when newline received
    if (inChar == '\n') {
      parseColorData(inputBuffer);
      inputBuffer = "";
    } else {
      // Add character to buffer
      inputBuffer += inChar;
    }
  }
}

// Parse RGB values from input string
void parseColorData(String data) {
  // Expected format: "R,G,B" where R,G,B are 0-255 values
  
  int firstComma = data.indexOf(',');
  int secondComma = data.indexOf(',', firstComma + 1);
  
  if (firstComma > 0 && secondComma > firstComma) {
    String redStr = data.substring(0, firstComma);
    String greenStr = data.substring(firstComma + 1, secondComma);
    String blueStr = data.substring(secondComma + 1);
    
    // Convert strings to integers
    int r = redStr.toInt();
    int g = greenStr.toInt();
    int b = blueStr.toInt();
    
    // Validate range
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      currentRed = r;
      currentGreen = g;
      currentBlue = b;
      newData = true;
    }
  }
}

// Set all pixels to the same color
void setAllPixels(int red, int green, int blue) {
  for (int i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(red, green, blue));
  }
  strip.show();
}

// Startup animation
void startupAnimation() {
  // Default profile colors from the app
  uint32_t idealistColor = strip.Color(76, 175, 80);     // #4CAF50
  uint32_t loyalistColor = strip.Color(33, 150, 243);    // #2196F3
  uint32_t pragmatistColor = strip.Color(255, 152, 0);   // #FF9800
  uint32_t individualistColor = strip.Color(156, 39, 176); // #9C27B0
  
  // Clear all pixels
  strip.clear();
  strip.show();
  delay(500);
  
  // Sequential lighting of each color
  for (int i = 0; i < strip.numPixels(); i++) {
    if (i < strip.numPixels() / 4) {
      strip.setPixelColor(i, idealistColor);
    } else if (i < strip.numPixels() / 2) {
      strip.setPixelColor(i, loyalistColor);
    } else if (i < 3 * strip.numPixels() / 4) {
      strip.setPixelColor(i, pragmatistColor);
    } else {
      strip.setPixelColor(i, individualistColor);
    }
    strip.show();
    delay(50);
  }
  
  // Flash all pixels
  for (int j = 0; j < 3; j++) {
    strip.clear();
    strip.show();
    delay(200);
    
    for (int i = 0; i < strip.numPixels(); i++) {
      if (i < strip.numPixels() / 4) {
        strip.setPixelColor(i, idealistColor);
      } else if (i < strip.numPixels() / 2) {
        strip.setPixelColor(i, loyalistColor);
      } else if (i < 3 * strip.numPixels() / 4) {
        strip.setPixelColor(i, pragmatistColor);
      } else {
        strip.setPixelColor(i, individualistColor);
      }
    }
    strip.show();
    delay(200);
  }
  
  // Fade to black
  for (int brightness = BRIGHTNESS; brightness >= 0; brightness--) {
    strip.setBrightness(brightness);
    strip.show();
    delay(10);
  }
  
  // Reset brightness
  strip.setBrightness(BRIGHTNESS);
  strip.clear();
  strip.show();
}

// Optional: Additional visualization effects based on profile
void pulseEffect(int red, int green, int blue) {
  // Save current brightness
  int originalBrightness = strip.getBrightness();
  
  // Pulse down and up
  for (int brightness = originalBrightness; brightness >= 20; brightness--) {
    strip.setBrightness(brightness);
    strip.show();
    delay(10);
  }
  
  for (int brightness = 20; brightness <= originalBrightness; brightness++) {
    strip.setBrightness(brightness);
    strip.show();
    delay(10);
  }
  
  // Reset to original brightness
  strip.setBrightness(originalBrightness);
}