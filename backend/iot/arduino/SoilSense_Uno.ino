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
const int RED_LED_PIN = 7;    // Red LED: Waterlogging / Moisture Too High (> 65%) or Temp Alert
const int GREEN_LED_PIN = 8;  // Green LED: Optimal Moisture Range (<= 65%) and Healthy Temp
const float HIGH_MOISTURE_THRESHOLD = 65.0; // Moisture threshold percentage for Red LED alert
const float HIGH_TEMP_THRESHOLD = 40.0;     // High temperature alert (°C)
const float LOW_TEMP_THRESHOLD = 5.0;       // Frost / freezing risk alert (°C)

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

  // Enable internal pull-up resistor on Pin 2 for OneWire signal stability (along with external 4.7k resistor)
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

// Read DS18B20 temperature with disconnection and error filtering (-127C filter)
float readDS18B20Temperature() {
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);

  // DS18B20 error codes:
  // -127.0 C = DEVICE_DISCONNECTED_C (wire loose or missing 4.7k pull-up resistor)
  // +85.0 C  = Sensor powered on but conversion didn't complete
  if (temp == DEVICE_DISCONNECTED_C || temp == 85.0 || temp < -55.0 || temp > 125.0) {
    return -999.0; // Invalid / disconnected
  }
  return temp;
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastTransmissionTime >= INTERVAL_MS) {
    lastTransmissionTime = currentTime;

    // 1. Read Soil Moisture (Analog Pin A0)
    int rawMoisture = readSmoothedADC(MOISTURE_PIN);
    float moisturePct = calculateMoisturePercentage(rawMoisture);

    // 2. Read DS18B20 Soil Temperature (Digital Pin 2 with 4.7k pull-up)
    float tempC = readDS18B20Temperature();
    bool hasValidTemp = (tempC > -900.0);

    // 3. LED Logic:
    // If moisture is high (> 65%), or temperature is critical (> 40C or < 5C), Red LED ON (Alert)
    // If moisture and temperature are normal, Green LED ON (Safe/Optimal)
    bool isMoistureHigh = (moisturePct >= HIGH_MOISTURE_THRESHOLD);
    bool isTempCritical = hasValidTemp && (tempC >= HIGH_TEMP_THRESHOLD || tempC <= LOW_TEMP_THRESHOLD);

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
      Serial.print(tempC, 1);
    } else {
      Serial.print(F(",\"temperature\":null"));
    }

    Serial.print(F(",\"ledStatus\":\""));
    Serial.print((isMoistureHigh || isTempCritical) ? F("RED_ALERT") : F("GREEN_OPTIMAL"));
    Serial.print(F("\",\"source\":\"hardware\",\"ingestionId\":\"DEV_"));
    Serial.print(currentTime);
    Serial.println(F("\"}"));
  }
}
