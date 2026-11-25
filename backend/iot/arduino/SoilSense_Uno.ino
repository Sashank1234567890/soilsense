/**
 * ============================================================================
 * SoilSense-Pro: Dual Sensor Telemetry Firmware
 * Target: Arduino Uno / Nano
 * Sensors:
 *   1. Capacitive Soil Moisture Sensor v1.2 (Pin A0)
 *   2. DS18B20 Waterproof Stainless Steel Temperature Probe (Digital Pin 2)
 * Communication: Newline-delimited JSON over USB Serial @ 9600 baud
 * ============================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

// Pin Configuration
const int MOISTURE_PIN = A0;
const int ONE_WIRE_BUS = 2; // DS18B20 Data wire (Yellow) connected to Digital Pin 2

// LED Status Indicator Pins
const int RED_LED_PIN = 7;    // Red LED: Waterlogging / Moisture Too High (> 65%)
const int GREEN_LED_PIN = 8;  // Green LED: Optimal Moisture Range (<= 65%)
const float HIGH_MOISTURE_THRESHOLD = 65.0; // Moisture threshold percentage for Red LED alert

// Setup OneWire and DallasTemperature instances
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Moisture Calibration: Dry air ~820 (0%), Submerged water ~350 (100%)
const int DRY_ADC_VALUE = 820;
const int WET_ADC_VALUE = 350;

// Device and Plot Identifiers
const char* DEVICE_ID = "DEVICE_001";
const char* PLOT_ID = "PLOT_001";
const unsigned long INTERVAL_MS = 3000; // Read every 3 seconds

unsigned long lastTransmissionTime = 0;

void setup() {
  Serial.begin(9600);
  pinMode(MOISTURE_PIN, INPUT);

  // Configure LED pins
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  // Enable internal pull-up resistor on Pin 2 for OneWire signal stability
  pinMode(ONE_WIRE_BUS, INPUT_PULLUP);

  // Start up the DallasTemperature library
  sensors.begin();
  sensors.setWaitForConversion(true);
}

// 10-sample moving average for moisture to eliminate noise
int readSmoothedADC(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return (int)(sum / 10);
}

// Convert ADC count into 0.0 - 100.0% moisture
float calculateMoisturePercentage(int raw) {
  if (raw >= DRY_ADC_VALUE) return 0.0;
  if (raw <= WET_ADC_VALUE) return 100.0;
  float pct = ((float)(DRY_ADC_VALUE - raw) / (float)(DRY_ADC_VALUE - WET_ADC_VALUE)) * 100.0;
  if (pct < 0.0) pct = 0.0;
  if (pct > 100.0) pct = 100.0;
  return pct;
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastTransmissionTime >= INTERVAL_MS) {
    lastTransmissionTime = currentTime;

    // 1. Read Soil Moisture
    int rawMoisture = readSmoothedADC(MOISTURE_PIN);
    float moisturePct = calculateMoisturePercentage(rawMoisture);

    // 2. Read DS18B20 Temperature
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    // 3. LED Logic:
    // If moisture is high (> 65%), Red LED ON (Warning/Overwatered) and Green OFF
    // If moisture is normal (<= 65%), Green LED ON (Safe/Optimal) and Red OFF
    bool isMoistureHigh = (moisturePct >= HIGH_MOISTURE_THRESHOLD);
    if (isMoistureHigh) {
      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(GREEN_LED_PIN, LOW);
    } else {
      digitalWrite(RED_LED_PIN, LOW);
      digitalWrite(GREEN_LED_PIN, HIGH);
    }

    // 4. Construct and transmit strict JSON line
    Serial.print(F("{\"deviceId\":\""));
    Serial.print(DEVICE_ID);
    Serial.print(F("\",\"plotId\":\""));
    Serial.print(PLOT_ID);
    Serial.print(F("\",\"rawValue\":"));
    Serial.print(rawMoisture);
    Serial.print(F(",\"moisturePercentage\":"));
    Serial.print(moisturePct, 1);

    // Valid DS18B20 temperature range (-55C to +125C, -127C means disconnected)
    if (tempC > -55.0 && tempC < 125.0) {
      Serial.print(F(",\"temperature\":"));
      Serial.print(tempC, 1);
    } else {
      Serial.print(F(",\"temperature\":null"));
    }

    Serial.print(F(",\"ledStatus\":\""));
    Serial.print(isMoistureHigh ? F("RED_ALERT") : F("GREEN_OPTIMAL"));
    Serial.print(F("\",\"source\":\"hardware\",\"ingestionId\":\"DEV_"));
    Serial.print(currentTime);
    Serial.println(F("\"}"));
  }
}
