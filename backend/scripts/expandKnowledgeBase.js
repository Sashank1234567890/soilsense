const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Crop = require('../models/Crop');
const SoilType = require('../models/SoilType');
const SoilProfile = require('../models/SoilProfile');
const SoilTest = require('../models/SoilTest');
const User = require('../models/User');
const Plot = require('../models/Plot');
const { generateSoilReport } = require('../services/reportService');
const { analyzeSoilCondition } = require('../services/soilAnalysisService');

dotenv.config();

const newCrops = [
  {
    name: "Bajra (Pearl Millet)",
    scientificName: "Pennisetum glaucum",
    category: "Cereal",
    description: "Extremely drought-hardy millet cultivated primarily in arid and semi-arid tracts of Rajasthan, Gujarat, and Haryana with minimal water requirement.",
    image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.5, optimalMin: 6.5, optimalMax: 8.0 },
      moisture: { min: 20, max: 50, optimalMin: 30, optimalMax: 42 },
      temperature: { min: 20, max: 40, optimalMin: 28, optimalMax: 35 },
      nitrogen: { min: 40, max: 90, optimalMin: 60, optimalMax: 80 },
      phosphorus: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      texture: ["Sandy Loam", "Sand", "Loam"],
      drainage: ["Excessive", "Well-drained"],
      organicMatter: { min: 0.2, optimalMin: 0.5 }
    },
    parameterWeights: { pH: 0.15, moisture: 0.30, temperature: 0.20, nitrogen: 0.15, phosphorus: 0.10, potassium: 0.05, texture: 0.05 },
    suitableSoilTypes: ["Desert Soil", "Sandy Soil", "Alluvial Soil"],
    suitableRegions: ["Rajasthan", "Gujarat", "Haryana", "Maharashtra", "Uttar Pradesh"],
    growingSeasons: ["Kharif", "Zaid"],
    irrigationRequirements: "Requires only 1-2 protective irrigations during prolonged dry spells at flowering or grain filling.",
    fertilizerConsiderations: "N:P:K ratio 80:40:40 kg/ha. Basal application of 50% N + full P and K."
  },
  {
    name: "Jowar (Sorghum)",
    scientificName: "Sorghum bicolor",
    category: "Cereal",
    description: "Major dual-purpose grain and fodder crop thriving in drought conditions across Maharashtra, Karnataka, and Telangana.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.5, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 25, max: 55, optimalMin: 35, optimalMax: 48 },
      temperature: { min: 18, max: 38, optimalMin: 25, optimalMax: 32 },
      nitrogen: { min: 50, max: 100, optimalMin: 70, optimalMax: 90 },
      phosphorus: { min: 25, max: 60, optimalMin: 35, optimalMax: 45 },
      potassium: { min: 25, max: 60, optimalMin: 35, optimalMax: 45 },
      texture: ["Clay Loam", "Loam", "Clay"],
      drainage: ["Well-drained", "Moderate"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: { pH: 0.16, moisture: 0.26, temperature: 0.20, nitrogen: 0.16, phosphorus: 0.10, potassium: 0.06, texture: 0.06 },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Red Soil"],
    suitableRegions: ["Maharashtra", "Karnataka", "Telangana", "Madhya Pradesh", "Rajasthan"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Drought resistant; responds well to 2-3 supplemental irrigations at knee-high and boot stages."
  },
  {
    name: "Ragi (Finger Millet)",
    scientificName: "Eleusine coracana",
    category: "Cereal",
    description: "Nutritious calcium-rich staple food crop of Karnataka and Tamil Nadu; highly tolerant of acidic and degraded red soils.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.0, max: 7.8, optimalMin: 5.5, optimalMax: 6.8 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 16, max: 35, optimalMin: 22, optimalMax: 30 },
      nitrogen: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      phosphorus: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 20, max: 50, optimalMin: 25, optimalMax: 35 },
      texture: ["Red Loam", "Sandy Loam", "Lateritic Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.7 }
    },
    parameterWeights: { pH: 0.22, moisture: 0.22, temperature: 0.18, nitrogen: 0.16, phosphorus: 0.10, potassium: 0.06, texture: 0.06 },
    suitableSoilTypes: ["Red Soil", "Laterite Soil", "Loamy Soil"],
    suitableRegions: ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Odisha", "Uttarakhand"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Rainfed in hilly tracts; 3-4 irrigations yield exceptional tillering in plains."
  },
  {
    name: "Tur / Arhar (Pigeon Pea)",
    scientificName: "Cajanus cajan",
    category: "Pulse",
    description: "Deep-rooted major pulse crop that enriches soil through atmospheric nitrogen fixation; essential protein source across India.",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.2, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 28, max: 55, optimalMin: 35, optimalMax: 48 },
      temperature: { min: 18, max: 36, optimalMin: 24, optimalMax: 32 },
      nitrogen: { min: 20, max: 50, optimalMin: 25, optimalMax: 35 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      potassium: { min: 25, max: 60, optimalMin: 35, optimalMax: 45 },
      texture: ["Loam", "Sandy Loam", "Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.24, temperature: 0.18, phosphorus: 0.20, nitrogen: 0.08, potassium: 0.06, texture: 0.06 },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Red Soil"],
    suitableRegions: ["Maharashtra", "Madhya Pradesh", "Karnataka", "Uttar Pradesh", "Gujarat"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Sensitive to waterlogging. Critical irrigation needed at flowering and pod filling stages."
  },
  {
    name: "Moong (Green Gram)",
    scientificName: "Vigna radiata",
    category: "Pulse",
    description: "Short-duration (60-70 days) pulse crop ideal for crop rotation between Rabi and Kharif; enriches soil fertility.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.2, max: 7.8, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 30, max: 55, optimalMin: 38, optimalMax: 48 },
      temperature: { min: 22, max: 38, optimalMin: 28, optimalMax: 34 },
      nitrogen: { min: 15, max: 40, optimalMin: 20, optimalMax: 30 },
      phosphorus: { min: 35, max: 70, optimalMin: 45, optimalMax: 60 },
      potassium: { min: 20, max: 50, optimalMin: 25, optimalMax: 40 },
      texture: ["Loam", "Sandy Loam", "Silt Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 0.9 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.22, temperature: 0.20, phosphorus: 0.22, nitrogen: 0.08, potassium: 0.05, texture: 0.05 },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Rajasthan", "Punjab", "Haryana", "Madhya Pradesh", "Bihar"],
    growingSeasons: ["Kharif", "Zaid"],
    irrigationRequirements: "2-3 light irrigations for summer/Zaid crop; largely rainfed in Kharif."
  },
  {
    name: "Urad (Black Gram)",
    scientificName: "Vigna mungo",
    category: "Pulse",
    description: "Nutritious black gram pulse, key ingredient in South Indian cuisine (idli, dosa) and North Indian dal makhani.",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 32, max: 58, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 22, max: 36, optimalMin: 26, optimalMax: 32 },
      nitrogen: { min: 15, max: 40, optimalMin: 20, optimalMax: 30 },
      phosphorus: { min: 35, max: 70, optimalMin: 45, optimalMax: 60 },
      potassium: { min: 20, max: 50, optimalMin: 25, optimalMax: 40 },
      texture: ["Loam", "Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 0.8 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.24, temperature: 0.18, phosphorus: 0.22, nitrogen: 0.08, potassium: 0.05, texture: 0.05 },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Loamy Soil"],
    suitableRegions: ["Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh", "Tamil Nadu", "Maharashtra"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Irrigate at branching and pod development for high yield."
  },
  {
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    category: "Oilseed",
    description: "Commercial edible oilseed with bright yellow blooms, highly valued for polyunsaturated fatty acids and drought tolerance.",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.2, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 52 },
      temperature: { min: 18, max: 35, optimalMin: 22, optimalMax: 30 },
      nitrogen: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 30, max: 70, optimalMin: 40, optimalMax: 55 },
      texture: ["Loam", "Sandy Loam", "Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 0.9 }
    },
    parameterWeights: { pH: 0.16, moisture: 0.24, temperature: 0.20, nitrogen: 0.16, phosphorus: 0.12, potassium: 0.07, texture: 0.05 },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Red Soil"],
    suitableRegions: ["Karnataka", "Maharashtra", "Andhra Pradesh", "Punjab", "Haryana"],
    growingSeasons: ["Kharif", "Rabi", "Zaid"],
    irrigationRequirements: "Sensitive to water deficit at bud initiation, flowering, and seed filling."
  },
  {
    name: "Onion",
    scientificName: "Allium cepa",
    category: "Vegetable",
    description: "Indispensable vegetable and bulb crop grown across Maharashtra (Nashik), Madhya Pradesh, and Karnataka.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.5, optimalMax: 7.0 },
      moisture: { min: 40, max: 70, optimalMin: 50, optimalMax: 62 },
      temperature: { min: 13, max: 32, optimalMin: 18, optimalMax: 26 },
      nitrogen: { min: 80, max: 150, optimalMin: 100, optimalMax: 120 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 50, max: 100, optimalMin: 60, optimalMax: 85 },
      texture: ["Sandy Loam", "Silt Loam", "Friable Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.8, optimalMin: 1.4 }
    },
    parameterWeights: { pH: 0.20, moisture: 0.26, temperature: 0.18, nitrogen: 0.14, phosphorus: 0.10, potassium: 0.08, texture: 0.04 },
    suitableSoilTypes: ["Alluvial Soil", "Red Soil", "Loamy Soil"],
    suitableRegions: ["Maharashtra", "Madhya Pradesh", "Karnataka", "Gujarat", "Bihar"],
    growingSeasons: ["Rabi", "Kharif"],
    irrigationRequirements: "Requires frequent light irrigations; stop 10-15 days before harvest to enhance curing."
  },
  {
    name: "Garlic",
    scientificName: "Allium sativum",
    category: "Spice",
    description: "Valuable pungent spice and medicinal bulb crop grown in Madhya Pradesh, Gujarat, and Rajasthan.",
    image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 38, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 12, max: 30, optimalMin: 16, optimalMax: 24 },
      nitrogen: { min: 70, max: 130, optimalMin: 90, optimalMax: 110 },
      phosphorus: { min: 40, max: 75, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      texture: ["Loam", "Sandy Loam", "Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.8, optimalMin: 1.2 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.24, temperature: 0.20, nitrogen: 0.16, phosphorus: 0.10, potassium: 0.07, texture: 0.05 },
    suitableSoilTypes: ["Loamy Soil", "Alluvial Soil", "Black Soil"],
    suitableRegions: ["Madhya Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Light irrigations every 8-10 days in winter; withdraw before maturity for clove firmness."
  },
  {
    name: "Ginger",
    scientificName: "Zingiber officinale",
    category: "Spice",
    description: "High-value aromatic rhizome crop requiring warm humid climates, rich organic loams, and partial shade.",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 7.2, optimalMin: 6.0, optimalMax: 6.8 },
      moisture: { min: 50, max: 80, optimalMin: 60, optimalMax: 75 },
      temperature: { min: 20, max: 35, optimalMin: 24, optimalMax: 30 },
      nitrogen: { min: 60, max: 120, optimalMin: 75, optimalMax: 95 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Sandy Loam", "Clay Loam", "Rich Humus Loam"],
      drainage: ["Well-drained", "No waterlogging"],
      organicMatter: { min: 1.2, optimalMin: 2.0 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.26, temperature: 0.18, potassium: 0.16, nitrogen: 0.10, phosphorus: 0.08, texture: 0.04 },
    suitableSoilTypes: ["Laterite Soil", "Red Loam", "Alluvial Soil"],
    suitableRegions: ["Kerala", "Assam", "Sikkim", "Meghalaya", "Odisha", "Karnataka"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "High water requirement; drip irrigation with mulching delivers optimal rhizome expansion."
  },
  {
    name: "Turmeric",
    scientificName: "Curcuma longa",
    category: "Spice",
    description: "Golden spice and medicinal rhizome crop; India is the world's leading producer, consumer, and exporter.",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 7.5, optimalMin: 6.0, optimalMax: 7.0 },
      moisture: { min: 45, max: 75, optimalMin: 55, optimalMax: 68 },
      temperature: { min: 20, max: 36, optimalMin: 25, optimalMax: 32 },
      nitrogen: { min: 50, max: 100, optimalMin: 60, optimalMax: 85 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 60, max: 130, optimalMin: 80, optimalMax: 110 },
      texture: ["Loam", "Clay Loam", "Alluvial Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 1.0, optimalMin: 1.8 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.24, temperature: 0.18, potassium: 0.18, nitrogen: 0.10, phosphorus: 0.08, texture: 0.04 },
    suitableSoilTypes: ["Red Soil", "Alluvial Soil", "Laterite Soil"],
    suitableRegions: ["Telangana", "Maharashtra", "Tamil Nadu", "Andhra Pradesh", "Odisha"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "15-20 irrigations throughout the 8-9 month growing period depending on soil texture."
  },
  {
    name: "Chilli (Hot Pepper)",
    scientificName: "Capsicum annuum",
    category: "Spice",
    description: "Major commercial cash spice widely cultivated in Andhra Pradesh (Guntur), Telangana, and Madhya Pradesh.",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 18, max: 35, optimalMin: 22, optimalMax: 30 },
      nitrogen: { min: 80, max: 160, optimalMin: 110, optimalMax: 140 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 50, max: 100, optimalMin: 65, optimalMax: 85 },
      texture: ["Sandy Loam", "Clay Loam", "Black Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.24, temperature: 0.20, nitrogen: 0.16, phosphorus: 0.10, potassium: 0.07, texture: 0.05 },
    suitableSoilTypes: ["Black Soil", "Red Soil", "Alluvial Soil"],
    suitableRegions: ["Andhra Pradesh", "Telangana", "Madhya Pradesh", "Karnataka", "West Bengal"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Avoid water stagnation which causes fruit rot and wilt; drip fertigation is optimal."
  },
  {
    name: "Jute (Golden Fiber)",
    scientificName: "Corchorus olitorius",
    category: "Fiber Crop",
    description: "Biodegradable natural fiber crop cultivated in the humid alluvial plains of West Bengal, Bihar, and Assam.",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.8, max: 7.6, optimalMin: 6.2, optimalMax: 7.0 },
      moisture: { min: 55, max: 85, optimalMin: 65, optimalMax: 80 },
      temperature: { min: 24, max: 38, optimalMin: 28, optimalMax: 35 },
      nitrogen: { min: 60, max: 100, optimalMin: 70, optimalMax: 85 },
      phosphorus: { min: 25, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      texture: ["Silt Loam", "Alluvial Loam", "Clay Loam"],
      drainage: ["Moderate", "Tolerates saturation"],
      organicMatter: { min: 0.6, optimalMin: 1.0 }
    },
    parameterWeights: { pH: 0.16, moisture: 0.30, temperature: 0.22, nitrogen: 0.16, phosphorus: 0.08, potassium: 0.04, texture: 0.04 },
    suitableSoilTypes: ["Alluvial Soil", "Clay Soil", "Loamy Soil"],
    suitableRegions: ["West Bengal", "Bihar", "Assam", "Odisha"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Requires abundant water for growth and clean slow-moving water for post-harvest retting."
  },
  {
    name: "Tea",
    scientificName: "Camellia sinensis",
    category: "Plantation",
    description: "Perennial plantation beverage crop thriving on sloping acidic lateritic soils in Assam and Nilgiri hills.",
    image: "https://images.unsplash.com/photo-1546853020-ca4909aef454?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 4.5, max: 5.8, optimalMin: 4.8, optimalMax: 5.5 },
      moisture: { min: 55, max: 85, optimalMin: 65, optimalMax: 75 },
      temperature: { min: 14, max: 32, optimalMin: 18, optimalMax: 28 },
      nitrogen: { min: 80, max: 150, optimalMin: 100, optimalMax: 130 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 50, max: 100, optimalMin: 70, optimalMax: 90 },
      texture: ["Friable Loam", "Sandy Loam", "Humus Rich Loam"],
      drainage: ["Very well-drained", "Sloping"],
      organicMatter: { min: 1.5, optimalMin: 2.5 }
    },
    parameterWeights: { pH: 0.28, moisture: 0.24, temperature: 0.18, nitrogen: 0.14, potassium: 0.08, phosphorus: 0.04, texture: 0.04 },
    suitableSoilTypes: ["Laterite Soil", "Mountain Soil", "Red Soil"],
    suitableRegions: ["Assam", "West Bengal (Darjeeling)", "Tamil Nadu (Nilgiris)", "Kerala", "Himachal Pradesh"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Well-distributed rainfall of 150-250 cm; sprinkler irrigation in dry spring months."
  },
  {
    name: "Coffee",
    scientificName: "Coffea arabica",
    category: "Plantation",
    description: "High-value shade-grown plantation beverage cultivated in the Western Ghats (Coorg, Chikmagalur, Wayanad).",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 6.8, optimalMin: 6.0, optimalMax: 6.5 },
      moisture: { min: 50, max: 80, optimalMin: 60, optimalMax: 70 },
      temperature: { min: 15, max: 30, optimalMin: 18, optimalMax: 25 },
      nitrogen: { min: 70, max: 130, optimalMin: 90, optimalMax: 110 },
      phosphorus: { min: 35, max: 70, optimalMin: 45, optimalMax: 55 },
      potassium: { min: 70, max: 140, optimalMin: 90, optimalMax: 120 },
      texture: ["Rich Loam", "Humus Clay Loam", "Volcanic Loam"],
      drainage: ["Deep well-drained"],
      organicMatter: { min: 1.5, optimalMin: 3.0 }
    },
    parameterWeights: { pH: 0.22, moisture: 0.24, temperature: 0.20, potassium: 0.16, nitrogen: 0.10, phosphorus: 0.04, texture: 0.04 },
    suitableSoilTypes: ["Laterite Soil", "Red Soil", "Mountain Soil"],
    suitableRegions: ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Blossom and backing sprinkler irrigations during March-April are critical for berry setting."
  },
  {
    name: "Banana",
    scientificName: "Musa acuminata",
    category: "Fruit",
    description: "Major commercial fruit crop requiring tropical warmth, rich organic loams, and constant moisture availability.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 50, max: 85, optimalMin: 65, optimalMax: 78 },
      temperature: { min: 18, max: 38, optimalMin: 25, optimalMax: 32 },
      nitrogen: { min: 100, max: 220, optimalMin: 140, optimalMax: 180 },
      phosphorus: { min: 50, max: 100, optimalMin: 65, optimalMax: 85 },
      potassium: { min: 120, max: 250, optimalMin: 160, optimalMax: 220 },
      texture: ["Clay Loam", "Alluvial Loam", "Sandy Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 1.0, optimalMin: 2.0 }
    },
    parameterWeights: { pH: 0.16, moisture: 0.26, temperature: 0.20, potassium: 0.18, nitrogen: 0.12, phosphorus: 0.05, texture: 0.03 },
    suitableSoilTypes: ["Alluvial Soil", "Black Soil", "Loamy Soil"],
    suitableRegions: ["Maharashtra", "Tamil Nadu", "Gujarat", "Andhra Pradesh", "Kerala"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Heavy water feeder; drip fertigation provides up to 40% water savings and superior bunch weight."
  },
  {
    name: "Mango",
    scientificName: "Mangifera indica",
    category: "Fruit",
    description: "The King of Fruits and national fruit of India, grown extensively in Uttar Pradesh, Andhra Pradesh, and Maharashtra.",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 30, max: 65, optimalMin: 40, optimalMax: 55 },
      temperature: { min: 15, max: 42, optimalMin: 24, optimalMax: 34 },
      nitrogen: { min: 50, max: 120, optimalMin: 70, optimalMax: 95 },
      phosphorus: { min: 30, max: 70, optimalMin: 40, optimalMax: 55 },
      potassium: { min: 60, max: 140, optimalMin: 80, optimalMax: 110 },
      texture: ["Deep Loam", "Alluvial Loam", "Red Sandy Loam"],
      drainage: ["Deep well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: { pH: 0.18, moisture: 0.22, temperature: 0.22, potassium: 0.16, nitrogen: 0.12, phosphorus: 0.06, texture: 0.04 },
    suitableSoilTypes: ["Alluvial Soil", "Red Soil", "Loamy Soil"],
    suitableRegions: ["Uttar Pradesh", "Andhra Pradesh", "Maharashtra (Alphonso)", "Bihar", "Gujarat"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Stop irrigation 2-3 months prior to flowering to promote floral bud differentiation."
  },
  {
    name: "Carrot",
    scientificName: "Daucus carota",
    category: "Vegetable",
    description: "Cool-season root vegetable requiring deep friable soil free from stones or hard pans for straight root development.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.2, optimalMax: 7.0 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 58 },
      temperature: { min: 10, max: 26, optimalMin: 15, optimalMax: 20 },
      nitrogen: { min: 60, max: 110, optimalMin: 75, optimalMax: 95 },
      phosphorus: { min: 35, max: 70, optimalMin: 45, optimalMax: 60 },
      potassium: { min: 50, max: 110, optimalMin: 70, optimalMax: 90 },
      texture: ["Deep Sandy Loam", "Silt Loam"],
      drainage: ["Very well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: { pH: 0.20, moisture: 0.24, temperature: 0.20, potassium: 0.16, nitrogen: 0.10, phosphorus: 0.05, texture: 0.05 },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Sandy Soil"],
    suitableRegions: ["Punjab", "Haryana", "Uttar Pradesh", "Karnataka (Ooty)"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Consistent soil moisture prevents root cracking and bitterness."
  }
];

const newSoilTypes = [
  {
    name: "Silt Loam Floodplain Soil",
    classification: "Inceptisols",
    texture: ["Silt Loam", "Fine Alluvial"],
    typicalPH: { min: 6.5, max: 7.8, median: 7.2 },
    drainage: "Moderate to Well-drained",
    shortDescription: "Fertile alluvial deposition along active river meanders and floodplains of the Ganges, Yamuna, and Brahmaputra.",
    characteristics: [
      "Exceptional silt fraction (50-70%)",
      "High natural moisture retention capacity",
      "High nitrogen responsiveness"
    ],
    geographicDistribution: ["Uttar Pradesh", "Bihar", "West Bengal", "Assam"],
    agriculturalApplications: ["Cereal cultivation", "Intensive multi-cropping", "Commercial vegetable farming"]
  },
  {
    name: "Tarai Sub-Himalayan Soil",
    classification: "Mollisols",
    texture: ["Clay Loam", "Silt Loam"],
    typicalPH: { min: 6.2, max: 7.5, median: 6.8 },
    drainage: "Moderate",
    shortDescription: "Rich, humus-heavy sub-Himalayan belt characterized by high natural water tables and exceptional fertility.",
    characteristics: [
      "High organic carbon (2.0 - 4.0%)",
      "Perennial high water table",
      "Exceptional biomass productivity"
    ],
    geographicDistribution: ["Uttarakhand", "Uttar Pradesh", "Bihar"],
    agriculturalApplications: ["Sugarcane intensive belt", "Basmati rice production", "Agro-forestry"]
  },
  {
    name: "Coastal Sandy Alluvium",
    classification: "Entisols",
    texture: ["Sand", "Sandy Loam"],
    typicalPH: { min: 6.0, max: 8.2, median: 7.4 },
    drainage: "Excessive",
    shortDescription: "Marine-alluvial transition soils along the Coromandel, Malabar, and Konkan coasts.",
    characteristics: [
      "High infiltration rate",
      "Low cation exchange capacity",
      "Excellent soil aeration"
    ],
    geographicDistribution: ["Tamil Nadu", "Andhra Pradesh", "Odisha", "Kerala", "Goa"],
    agriculturalApplications: ["Plantation crops (Coconut, Cashew)", "Groundnut cultivation", "Coastal horticulture"]
  },
  {
    name: "Red Loamy Soil",
    classification: "Alfisols",
    texture: ["Sandy Clay Loam", "Red Loam"],
    typicalPH: { min: 5.5, max: 7.0, median: 6.2 },
    drainage: "Well-drained",
    shortDescription: "Weathered crystalline and metamorphic granitic soil widespread across Southern and Eastern India.",
    characteristics: [
      "High ferric oxide content giving red coloration",
      "Low nitrogen and phosphorus reserves",
      "Highly responsive to irrigation and phosphatic fertilizers"
    ],
    geographicDistribution: ["Tamil Nadu", "Karnataka", "Telangana", "Andhra Pradesh", "Odisha"],
    agriculturalApplications: ["Millets (Ragi, Jowar)", "Pulses (Tur, Urad)", "Oilseeds (Groundnut, Sunflower)"]
  },
  {
    name: "Mixed Red and Black Soil",
    classification: "Alfisol-Vertisol Transition",
    texture: ["Clay Loam", "Medium Clay"],
    typicalPH: { min: 6.5, max: 8.0, median: 7.3 },
    drainage: "Moderate",
    shortDescription: "Transition soil occurring where Deccan trap basalt meets crystalline granitic terrain.",
    characteristics: [
      "Moderate swelling and cracking properties",
      "Balanced moisture retention without waterlogging",
      "Good mineral reserve"
    ],
    geographicDistribution: ["Madhya Pradesh", "Maharashtra", "Karnataka", "Uttar Pradesh"],
    agriculturalApplications: ["Soybean-Wheat cropping systems", "Cotton cultivation", "Gram and oilseeds"]
  }
];

async function runExpansion() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[Expansion] Connected to MongoDB.');

    // 1. Expand Crops
    console.log('[Expansion] Seeding additional Indian crops...');
    for (const cropData of newCrops) {
      const exists = await Crop.findOne({ name: cropData.name });
      if (!exists) {
        await Crop.create(cropData);
        console.log(` + Added crop: ${cropData.name}`);
      }
    }
    const totalCrops = await Crop.countDocuments();
    console.log(`[Expansion] Total crops in database: ${totalCrops}`);

    // 2. Expand Soil Types
    console.log('[Expansion] Seeding additional Soil Types...');
    for (const soilData of newSoilTypes) {
      const exists = await SoilType.findOne({ name: soilData.name });
      if (!exists) {
        await SoilType.create(soilData);
        console.log(` + Added soil type: ${soilData.name}`);
      }
    }
    const totalSoils = await SoilType.countDocuments();
    console.log(`[Expansion] Total soil types in database: ${totalSoils}`);

    // 3. Backfill Tested Data for All Existing Users
    const users = await User.find({});
    console.log(`[Expansion] Checking tested data for ${users.length} users...`);

    for (const u of users) {
      const testCount = await SoilTest.countDocuments({ userId: u._id });
      if (testCount < 3) {
        console.log(`Seeding rich tested data for user: ${u.name} (${u.email})...`);

        // Create Plots if none exist
        const plotAId = `PLOT_${u._id.toString().slice(-4).toUpperCase()}_01`;
        const plotBId = `PLOT_${u._id.toString().slice(-4).toUpperCase()}_02`;

        await Plot.findOneAndUpdate(
          { plotId: plotAId },
          {
            plotId: plotAId,
            name: `${u.plotName || 'Primary Parcel'} (Block A)`,
            owner: u._id,
            areaAcres: 4.2,
            assignedDeviceId: 'DEVICE_001',
            location: {
              state: u.state || 'Punjab',
              district: u.district || 'Ludhiana',
              village: u.village || 'Jagraon'
            }
          },
          { upsert: true, new: true }
        );

        await Plot.findOneAndUpdate(
          { plotId: plotBId },
          {
            plotId: plotBId,
            name: 'South Sector (Block B)',
            owner: u._id,
            areaAcres: 2.8,
            assignedDeviceId: 'DEVICE_001',
            location: {
              state: u.state || 'Punjab',
              district: u.district || 'Ludhiana',
              village: u.village || 'Jagraon'
            }
          },
          { upsert: true, new: true }
        );

        // Test 1: Recent IoT Sensor Probe (2 days ago)
        const t1 = await SoilTest.create({
          testId: `TEST_${Date.now()}_101`,
          userId: u._id,
          plotId: plotAId,
          deviceId: 'DEVICE_001',
          testKind: 'general',
          overallSource: 'hardware',
          values: {
            moisture: 47.5,
            temperature: 23.0,
            pH: 7.1,
            nitrogen: 118,
            phosphorus: 54,
            potassium: 50,
            texture: 'Loam',
            organicMatter: 1.1
          },
          parameterSources: {
            moisture: 'hardware',
            temperature: 'hardware',
            pH: 'reference',
            nitrogen: 'reference',
            phosphorus: 'reference',
            potassium: 'reference',
            texture: 'user_provided'
          },
          location: {
            state: u.state || 'Punjab',
            district: u.district || 'Ludhiana',
            village: u.village || 'Jagraon',
            plotName: `${u.plotName || 'Field'} (Block A)`
          },
          timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000)
        });
        await generateSoilReport(t1._id);

        // Test 2: Field Sensor Telemetry (18 days ago)
        const t2 = await SoilTest.create({
          testId: `TEST_${Date.now()}_102`,
          userId: u._id,
          plotId: plotBId,
          deviceId: 'DEVICE_001',
          testKind: 'general',
          overallSource: 'simulation',
          values: {
            moisture: 36.0,
            temperature: 21.5,
            pH: 7.6,
            nitrogen: 88,
            phosphorus: 44,
            potassium: 48,
            texture: 'Clay Loam',
            organicMatter: 0.8
          },
          parameterSources: {
            moisture: 'simulation',
            temperature: 'simulation',
            pH: 'reference',
            nitrogen: 'reference',
            phosphorus: 'reference',
            potassium: 'reference',
            texture: 'user_provided'
          },
          location: {
            state: u.state || 'Punjab',
            district: u.district || 'Ludhiana',
            village: u.village || 'Jagraon',
            plotName: 'South Sector (Block B)'
          },
          timestamp: new Date(Date.now() - 18 * 24 * 3600 * 1000)
        });
        await generateSoilReport(t2._id);

        // Test 3: Seasonal Pre-Sowing Baseline (45 days ago)
        const t3 = await SoilTest.create({
          testId: `TEST_${Date.now()}_103`,
          userId: u._id,
          plotId: plotAId,
          deviceId: 'DEVICE_001',
          testKind: 'general',
          overallSource: 'hardware',
          values: {
            moisture: 52.0,
            temperature: 25.5,
            pH: 6.9,
            nitrogen: 125,
            phosphorus: 58,
            potassium: 52,
            texture: 'Loam',
            organicMatter: 1.2
          },
          parameterSources: {
            moisture: 'hardware',
            temperature: 'hardware',
            pH: 'reference',
            nitrogen: 'reference',
            phosphorus: 'reference',
            potassium: 'reference',
            texture: 'user_provided'
          },
          location: {
            state: u.state || 'Punjab',
            district: u.district || 'Ludhiana',
            village: u.village || 'Jagraon',
            plotName: `${u.plotName || 'Field'} (Block A)`
          },
          timestamp: new Date(Date.now() - 45 * 24 * 3600 * 1000)
        });
        await generateSoilReport(t3._id);

        console.log(` ✓ Successfully seeded 3 tests and reports for ${u.name}`);
      }
    }

    console.log('[Expansion] Database expansion and user tested data backfill COMPLETE.');
    process.exit(0);
  } catch (err) {
    console.error('[Expansion Error]:', err);
    process.exit(1);
  }
}

runExpansion();
