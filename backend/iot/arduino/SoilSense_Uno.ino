/**
 * ============================================================================
 * SoilSense-Pro: Complete IoT Telemetry Firmware
 * Target: Arduino Uno / Nano
 * 
 * ======================= EXACT ARDUINO PIN MAPPING ==========================
 * 1. SOIL MOISTURE SENSOR (Capacitive v1.2):
 *    - VCC    -> Arduino 5V (or 3.3V)
 *    - GND    -> Arduino GND
 *    - AOUT   -> Arduino Analog Pin A0
 * 
 * 2. TEMPERATURE SENSOR (DS18B20 Waterproof Stainless Steel Probe):
 *    - RED wire    (VCC)  -> Arduino 5V
 *    - BLACK wire  (GND)  -> Arduino GND
 *    - YELLOW wire (DATA) -> Arduino Digital Pin 2
 *    - 4.7kΩ Resistor     -> Between YELLOW (Pin 2) and RED (5V)
 * 
 * 3. DUAL LED STATUS INDICATORS:
 *    - RED LED   (+) -> 220Ω Resistor -> Arduino Digital Pin 7 (High Moisture Alert > 65%)
 *    - RED LED   (-) -> Arduino GND
 *    - GREEN LED (+) -> 220Ω Resistor -> Arduino Digital Pin 8 (Optimal Moisture <= 65%)
 *    - GREEN LED (-) -> Arduino GND
 * ============================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

// --- PIN DEFINITIONS ---
const int MOISTURE_PIN   = A0; // Capacitive Moisture Sensor Signal (Analog Pin A0)
const int ONE_WIRE_BUS   = 2;  // DS18B20 Temperature Data Wire (Digital Pin 2)
const int RED_LED_PIN    = 7;  // Red LED: Waterlogging / High Moisture Alert (Digital Pin 7)
const int GREEN_LED_PIN  = 8;  // Green LED: Safe & Optimal Moisture (Digital Pin 8)

// --- THRESHOLDS ---
const float HIGH_MOISTURE_THRESHOLD = 65.0; // Moisture threshold percentage for Red LED
const float HIGH_TEMP_THRESHOLD     = 40.0; // Extreme Heat alert (°C)
const float LOW_TEMP_THRESHOLD      = 5.0;  // Frost / Freezing alert (°C)

// OneWire and DallasTemperature instances
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Moisture Calibration: Dry Air ~820 (0%), Submerged in Water ~350 (100%)
const int DRY_ADC_VALUE = 820;
const int WET_ADC_VALUE = 350;

// Identifiers & Timing
const char* DEVICE_ID = "DEVICE_001";
const char* PLOT_ID   = "PLOT_001";
const unsigned long INTERVAL_MS = 3000; // Telemetry transmission every 3 seconds

unsigned long lastTransmissionTime = 0;

void setup() {
  Serial.begin(9600);

  // Configure Pin Modes
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  // Enable internal pull-up on Pin 2
  pinMode(ONE_WIRE_BUS, INPUT_PULLUP);

  // Initialize DS18B20 library
  sensors.begin();
  sensors.setWaitForConversion(true);

  // Self-Test Diagnostic Print on Boot
  delay(500);
  int detectedCount = sensors.getDeviceCount();
  Serial.println(F("{\"system\":\"SoilSense Uno\",\"status\":\"BOOT_OK\"}"));
  if (detectedCount == 0) {
    Serial.println(F("{\"warning\":\"DS18B20_NOT_FOUND\",\"action\":\"Check Pin 2 and 4.7k resistor between Pin 2 & 5V\"}"));
  }
}

// 10-sample moving average for moisture to eliminate analog noise
int readSmoothedADC(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return (int)(sum / 10);
}

// Convert raw ADC (820 down to 350) into 0.0% to 100.0%
float calculateMoisturePercentage(int raw) {
  if (raw >= DRY_ADC_VALUE) return 0.0;
  if (raw <= WET_ADC_VALUE) return 100.0;
  float pct = ((float)(DRY_ADC_VALUE - raw) / (float)(DRY_ADC_VALUE - WET_ADC_VALUE)) * 100.0;
  if (pct < 0.0) pct = 0.0;
  if (pct > 100.0) pct = 100.0;
  return pct;
}

// Read DS18B20 temperature
float readDS18B20Temperature() {
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  return temp; // Returns actual temp, or -127.0 if disconnected
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastTransmissionTime >= INTERVAL_MS) {
    lastTransmissionTime = currentTime;

    // 1. Read Soil Moisture (Analog Pin A0)
    int rawMoisture = readSmoothedADC(MOISTURE_PIN);
    float moisturePct = calculateMoisturePercentage(rawMoisture);

    // 2. Read Soil Temperature (Digital Pin 2)
    float rawTemp = readDS18B20Temperature();
    bool hasValidTemp = (rawTemp > -50.0 && rawTemp < 125.0 && rawTemp != 85.0);

    // 3. LED Logic:
    // If moisture is high (> 65%), or temperature is critical (> 40C or < 5C), Red LED ON (Alert)
    // If moisture and temperature are normal, Green LED ON (Safe/Optimal)
    bool isMoistureHigh = (moisturePct >= HIGH_MOISTURE_THRESHOLD);
    bool isTempCritical = hasValidTemp && (rawTemp >= HIGH_TEMP_THRESHOLD || rawTemp <= LOW_TEMP_THRESHOLD);

    if (isMoistureHigh || isTempCritical) {
      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(GREEN_LED_PIN, LOW);
    } else {
      digitalWrite(RED_LED_PIN, LOW);
      digitalWrite(GREEN_LED_PIN, HIGH);
    }

    // 4. Construct and transmit strict JSON line over USB Serial
    Serial.print(F("{\"deviceId\":\""));
    Serial.print(DEVICE_ID);
    Serial.print(F("\",\"plotId\":\""));
    Serial.print(PLOT_ID);
    Serial.print(F("\",\"rawValue\":"));
    Serial.print(rawMoisture);
    Serial.print(F(",\"moisturePercentage\":"));
    Serial.print(moisturePct, 1);

    // Temperature in Celsius
    if (hasValidTemp) {
      Serial.print(F(",\"temperature\":"));
      Serial.print(rawTemp, 1);
    } else {
      Serial.print(F(",\"temperature\":null,\"rawTemp\":"));
      Serial.print(rawTemp, 1);
    }

    Serial.print(F(",\"ledStatus\":\""));
    Serial.print((isMoistureHigh || isTempCritical) ? F("RED_ALERT") : F("GREEN_OPTIMAL"));
    Serial.print(F("\",\"source\":\"hardware\",\"ingestionId\":\"DEV_"));
    Serial.print(currentTime);
    Serial.println(F("\"}"));
  }
}
