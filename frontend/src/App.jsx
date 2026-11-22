import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SoilToCrop from './pages/SoilToCrop';
import SoilDetail from './pages/SoilDetail';
import CropToSoil from './pages/CropToSoil';
import CropDetail from './pages/CropDetail';
import TestYourSoil from './pages/TestYourSoil';
import LiveMonitoring from './pages/LiveMonitoring';
import SoilHistory from './pages/SoilHistory';
import CompareSoil from './pages/CompareSoil';
import SoilDatabase from './pages/SoilDatabase';
import Reports from './pages/Reports';
import QueryExplorer from './pages/QueryExplorer';
import AboutProject from './pages/AboutProject';
import Login from './pages/Login';
import Register from './pages/Register';

// 6 New Agronomic Intelligence Pages (Single Sensor Compatible)
import SmartIrrigation from './pages/SmartIrrigation';
import FertilizerPrescription from './pages/FertilizerPrescription';
import DiseaseRadar from './pages/DiseaseRadar';
import MandiEconomics from './pages/MandiEconomics';
import SoilHealthCardPage from './pages/SoilHealthCardPage';
import FarmHeatmap from './pages/FarmHeatmap';
import CropScheduleAlerts from './pages/CropScheduleAlerts';
import FarmManagement from './pages/FarmManagement';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="soil-to-crop" element={<SoilToCrop />} />
              <Route path="soil-to-crop/:id" element={<SoilDetail />} />
              <Route path="crop-to-soil" element={<CropToSoil />} />
              <Route path="crop-to-soil/:id" element={<CropDetail />} />
              <Route path="test-your-soil" element={<TestYourSoil />} />
              <Route path="live-monitoring" element={<LiveMonitoring />} />
              <Route path="soil-history" element={<SoilHistory />} />
              <Route path="compare-soil" element={<CompareSoil />} />
              <Route path="soil-database" element={<SoilDatabase />} />
              <Route path="reports" element={<Reports />} />
              <Route path="query-explorer" element={<QueryExplorer />} />
              <Route path="about" element={<AboutProject />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              <Route path="smart-irrigation" element={<SmartIrrigation />} />
              <Route path="fertilizer-prescription" element={<FertilizerPrescription />} />
              <Route path="disease-radar" element={<DiseaseRadar />} />
              <Route path="mandi-economics" element={<MandiEconomics />} />
              <Route path="soil-health-card" element={<SoilHealthCardPage />} />
              <Route path="farm-heatmap" element={<FarmHeatmap />} />
              <Route path="crop-schedule" element={<CropScheduleAlerts />} />
              <Route path="farm-management" element={<FarmManagement />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
