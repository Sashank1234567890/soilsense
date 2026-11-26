#include <OneWire.h>
#include <DallasTemperature.h>

const int MOISTURE_PIN       = A0;
const int TEMPERATURE_PIN    = 2;
const int RED_LED_PIN        = 7;
const int GREEN_LED_PIN      = 8;

const float HIGH_MOISTURE_THRESHOLD = 65.0;
const float LOW_MOISTURE_THRESHOLD  = 25.0;
const float HIGH_TEMP_THRESHOLD     = 40.0;
const float LOW_TEMP_THRESHOLD      = 5.0;

OneWire oneWire(TEMPERATURE_PIN);
DallasTemperature sensors(&oneWire);

const int DRY_ADC_VALUE = 570;
const int WET_ADC_VALUE = 240;

const char* DEVICE_ID = "DEVICE_001";
const char* PLOT_ID   = "PLOT_001";
const unsigned long INTERVAL_MS = 3000;

unsigned long lastTransmissionTime = 0;

void setup() {
  Serial.begin(9600);

  pinMode(MOISTURE_PIN, INPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  pinMode(TEMPERATURE_PIN, INPUT_PULLUP);

  sensors.begin();
  sensors.setWaitForConversion(true);

  delay(500);
  int detectedCount = sensors.getDeviceCount();
  Serial.println(F("{\"system\":\"SoilSense Uno\",\"status\":\"BOOT_OK\"}"));
  if (detectedCount == 0) {
    Serial.println(F("{\"warning\":\"DS18B20_NOT_FOUND\",\"action\":\"Check Pin 2 and 4.7k resistor between Pin 2 & 3.3V\"}"));
  }
}

int readSmoothedADC(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return (int)(sum / 10);
}

float calculateMoisturePercentage(int raw) {
  if (raw >= DRY_ADC_VALUE) return 0.0;
  if (raw <= WET_ADC_VALUE) return 100.0;
  float pct = ((float)(DRY_ADC_VALUE - raw) / (float)(DRY_ADC_VALUE - WET_ADC_VALUE)) * 100.0;
  if (pct < 0.0) pct = 0.0;
  if (pct > 100.0) pct = 100.0;
  return pct;
}

float readTemperatureCelsius() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  return tempC;
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastTransmissionTime >= INTERVAL_MS) {
    lastTransmissionTime = currentTime;

    int rawMoisture = readSmoothedADC(MOISTURE_PIN);
    float moisturePct = calculateMoisturePercentage(rawMoisture);

    float tempCelsius = readTemperatureCelsius();
    bool hasValidTemp = (tempCelsius > -50.0 && tempCelsius < 125.0 && tempCelsius != 85.0);

    bool isMoistureTooHigh = (moisturePct >= HIGH_MOISTURE_THRESHOLD);
    bool isMoistureTooLow  = (moisturePct <= LOW_MOISTURE_THRESHOLD);
    bool isMoistureDanger  = (isMoistureTooHigh || isMoistureTooLow);
    bool isTempCritical    = hasValidTemp && (tempCelsius >= HIGH_TEMP_THRESHOLD || tempCelsius <= LOW_TEMP_THRESHOLD);

    if (isMoistureDanger || isTempCritical) {
      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(GREEN_LED_PIN, LOW);
    } else {
      digitalWrite(RED_LED_PIN, LOW);
      digitalWrite(GREEN_LED_PIN, HIGH);
    }

    Serial.print(F("{\"deviceId\":\""));
    Serial.print(DEVICE_ID);
    Serial.print(F("\",\"plotId\":\""));
    Serial.print(PLOT_ID);
    Serial.print(F("\",\"rawValue\":"));
    Serial.print(rawMoisture);
    Serial.print(F(",\"moisturePercentage\":"));
    Serial.print(moisturePct, 1);

    if (hasValidTemp) {
      Serial.print(F(",\"temperature\":"));
      Serial.print(tempCelsius, 1);
      Serial.print(F(",\"temperatureCelsius\":"));
      Serial.print(tempCelsius, 1);
      Serial.print(F(",\"tempUnit\":\"Celsius\""));
    } else {
      Serial.print(F(",\"temperature\":null,\"rawTempCelsius\":"));
      Serial.print(tempCelsius, 1);
    }

    Serial.print(F(",\"ledStatus\":\""));
    Serial.print((isMoistureDanger || isTempCritical) ? F("RED_ALERT") : F("GREEN_OPTIMAL"));
    Serial.print(F("\",\"source\":\"hardware\",\"ingestionId\":\"DEV_"));
    Serial.print(currentTime);
    Serial.println(F("\"}"));
  }
}
