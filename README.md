# 🌱 SoilSense-Pro: Precision Soil Intelligence & Agronomic Advisory Platform

> **Completely Independent Project** (`soilsense-pro`)  
> **Dedicated Database**: `soilsense_pro_db` on MongoDB (Old `soilsense` database left 100% untouched)  
> **Hardware Target**: **100% SAME IOT HARDWARE** (Arduino Uno + Capacitive Moisture Sensor v1.2 on Analog Pin **A0**)

---

## ⚡ Quick Start & Run Guide

### 1. Database
MongoDB runs on port `27017` with replica set `rs0`:
```bash
mongod --dbpath ./mongodb-data --replSet rs0 --port 27017 --fork --logpath ./logs/mongod.log
```

### 2. Backend API Server (Port 5002)
```bash
cd backend
npm start
# Server runs on: http://localhost:5002
```

### 3. Frontend Web Application (Port 5174)
```bash
cd frontend
npm run dev
# Open in browser: http://localhost:5174
```

---

## 🌐 Bilingual Language Switcher (English & हिन्दी)
In the top header bar, click the **`🌐 [ 🇮🇳 हिन्दी (Hindi) | 🇬🇧 English ]`** button to instantly translate the entire platform without reloading.

---

## 🌾 All 11 Original Features (100% Retained)
1. **Soil to Crop**: Indian soil catalog, pH filters, ICAR suitability tiers.
2. **Crop to Soil**: Crop physiological requirements & *"TEST MY SOIL FOR THIS CROP"* button.
3. **Test Your Soil**: 4 ingestion modes (*Simulation, IoT Device, Manual Lab Entry, Registered Profile*) with 7-section diagnostic reports.
4. **Live Monitoring**: Real-time streaming charts from the A0 capacitive probe.
5. **Soil History**: Historical test records and moisture trends.
6. **Compare Soil**: Side-by-side comparison of multiple soil samples or plots.
7. **Soil Database**: 16 Indian Soil Series (NBSS&LUP benchmark reference data).
8. **PDF Reports**: Comprehensive downloadable analysis reports.
9. **Database Explorer**: MongoDB aggregations & live indexing benchmarks (`explain("executionStats")`).
10. **About Project**: NIT Delhi course information and hardware checklist.
11. **User Authentication & Role Switcher**: Farmer, Agronomist, and Student demo accounts.

---

## ⚡ 6 New Agronomic Intelligence Features (No Extra Hardware!)
1. **💧 Smart Irrigation & Rain-Suppression**: Calculates water deficit in **Liters per Acre** using Penman-Monteith Evapotranspiration ($ET_0$). Automatically defers irrigation if rain $\ge 5\text{ mm}$ is forecasted in 24 hours.
2. **🧪 ICAR Precision Fertilizer Hub**: Interactive growth timeline ([Sowing] ➔ [Vegetative] ➔ [Flowering] ➔ [Harvest]). Calculates split doses of **Urea (46% N)**, **DAP**, and **MOP** (kg/acre) plus organic Neem Cake to reduce nitrogen leaching.
3. **🦠 Disease & Hypoxia Radar**: Detects when moisture stays above 80% for > 48 hours in warm soil, warning against root rot (*Pythium, Rhizoctonia*) with remedial trenching guides.
4. **📈 Mandi Market Economics**: Fuses live Agmarknet / e-NAM wholesale crop prices with input costs to calculate **Net Farm Profit (₹/Acre)**.
5. **📜 Govt Soil Health Card (SHC)**: Ministry of Agriculture **12-parameter format** with printable layout and digital QR verification hash.
6. **🗺️ 2D Farm Moisture Heatmap**: Spatial 2D grid visualizer tracking moisture across field depressions.

---

## 🔌 Connecting Physical Arduino Hardware (When Ready)
1. Flash `backend/iot/arduino/SoilSense_Uno.ino` to your Arduino Uno using the Arduino IDE.
2. Wiring:
   * **Sensor VCC** ➔ Arduino **3.3V** (or 5V)
   * **Sensor GND** ➔ Arduino **GND**
   * **Sensor Signal (AOUT)** ➔ Arduino **Analog Pin A0**
3. Connect Arduino to USB.
4. Run the Node.js serial bridge:
   ```bash
   cd backend
   npm run bridge
   ```
   The backend will immediately switch from simulation mode to live hardware streaming!
