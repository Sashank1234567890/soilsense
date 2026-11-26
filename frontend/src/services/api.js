import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

const attachToken = (config) => {
  const token = localStorage.getItem('soilsense_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
axios.interceptors.request.use(attachToken, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API Interceptor] 401 Unauthorized encountered, clearing stale token.');
      localStorage.removeItem('soilsense_token');
    }
    return Promise.reject(error);
  }
);

export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');
export const switchDemoProfile = (role) => api.post('/auth/demo-switch', { role });
export const getAllAccounts = () => api.get(`/auth/accounts?_t=${Date.now()}`);
export const switchAccount = (payload) => api.post('/auth/switch-account', payload);
export const deleteAccount = (id) => api.delete(`/auth/accounts/${id}`);

export const getCrops = (params) => api.get('/crops', { params });
export const searchCrops = (q, category) => api.get('/crops/search', { params: { q, category } });
export const getCropById = (id) => api.get(`/crops/${id}`);

export const getSoilTypes = () => api.get('/soil-types');
export const searchSoilTypes = (q) => api.get('/soil-types/search', { params: { q } });
export const getSoilTypeById = (id) => api.get(`/soil-types/${id}`);
export const getSoilProfiles = () => api.get('/soil-profiles');
export const createSoilTest = (data) => api.post('/soil-tests', data);
export const getSoilTests = (params) => api.get('/soil-tests', { params });
export const getSoilTestById = (id) => api.get(`/soil-tests/${id}`);
export const analyseSoil = (data) => api.post('/soil/analyse', data);
export const classifySoil = (data) => api.post('/soil/classify', data);
export const compareSoil = (data) => api.post('/soil/compare', data);

export const evaluateAllCrops = (soilTestId) => api.post('/recommendations', { soilTestId });
export const evaluateCropSpecific = (soilTestId, cropId) => api.post('/recommendations/crop-specific', { soilTestId, cropId });
export const getRecommendationById = (id) => api.get(`/recommendations/${id}`);
export const getRecommendationByTestId = (soilTestId) => api.get(`/recommendations/soil/${soilTestId}`);

export const createImprovementPlan = (data) => api.post('/soil/improvement', data);
export const getImprovementPlanById = (id) => api.get(`/soil/improvement/${id}`);
export const getImprovementByTestId = (soilTestId) => api.get(`/soil/improvement/soil/${soilTestId}`);

export const getDevices = () => api.get('/devices');
export const getDeviceById = (id) => api.get(`/devices/${id}`);
export const getDeviceReadings = (id, limit = 30) => api.get(`/devices/${id}/readings`, { params: { limit } });
export const getLatestReading = (deviceId) => api.get(`/sensor/latest/${deviceId}`);
export const ingestSensorReading = (data) => api.post('/sensor/readings', data);
export const getAlerts = () => api.get('/alerts');
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);
export const createAlert = (data) => api.post('/alerts', data);
export const getIoTStatus = () => api.get('/iot/status');

export const getReports = () => api.get('/reports');
export const getReportById = (id) => api.get(`/reports/${id}`);
export const createReport = (soilTestId) => api.post('/reports', { soilTestId });
export const getReportPDFUrl = (id) => `/api/reports/${id}/pdf`;

export const getPlotSoilHistory = (plotId) => api.get(`/history/soil/${plotId}`);
export const getDeviceMoistureHistory = (deviceId, hours = 24) => api.get(`/history/moisture/${deviceId}`, { params: { hours } });

export const getPredefinedQueries = () => api.get('/dbms/queries');
export const executeDBMSQuery = (queryId) => api.post('/dbms/execute', { queryId });
export const getDatabaseStats = () => api.get('/dbms/stats');
export const runTransactionDemo = (data) => api.post('/dbms/transaction-demo', data);

export default api;
