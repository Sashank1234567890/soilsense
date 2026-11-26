const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Crop = require('../models/Crop');

dotenv.config();

const indianCrops = [
  {
    name: "Wheat",
    scientificName: "Triticum aestivum",
    category: "Cereal",
    description: "The primary winter (Rabi) staple food grain of Northern and Central India; requires cool growing periods and bright sunshine during ripening.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.2, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 10, max: 28, optimalMin: 15, optimalMax: 22 },
      nitrogen: { min: 80, max: 150, optimalMin: 100, optimalMax: 120 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      texture: ["Loam", "Clay Loam", "Silt Loam", "Alluvial Loam"],
      drainage: ["Well-drained", "Moderate"],
      organicMatter: { min: 0.5, optimalMin: 1.0 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.20,
      nitrogen: 0.15,
      phosphorus: 0.10,
      potassium: 0.05,
      texture: 0.05,
      drainage: 0.03
    },
    suitableSoilTypes: ["Alluvial Soil", "Black Soil", "Loamy Soil"],
    suitableRegions: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "4-6 irrigations corresponding to Crown Root Initiation (CRI), tillering, jointing, flowering, milking, and dough stages.",
    fertilizerConsiderations: "Recommended N:P:K ratio 120:60:40 kg/ha. Apply 50% N + full P and K as basal, balance N in two top dressings.",
    cultivationInfo: "Optimum sowing time: 1st to 3rd week of November. Seed rate: 100 kg/ha for normal sowing.",
    referenceSources: [
      { title: "Package of Practices for Rabi Crops", organization: "Punjab Agricultural University (PAU) & ICAR", year: 2021 },
      { title: "Wheat Production Technology in India", organization: "ICAR-Indian Institute of Wheat & Barley Research (IIWBR) Karnal", year: 2020 }
    ]
  },
  {
    name: "Rice",
    scientificName: "Oryza sativa",
    category: "Cereal",
    description: "The most vital Kharif food grain crop of India, requiring high water immersion or saturation, warm temperatures, and humid conditions.",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.0, max: 7.8, optimalMin: 5.5, optimalMax: 6.8 },
      moisture: { min: 60, max: 95, optimalMin: 70, optimalMax: 90 },
      temperature: { min: 20, max: 38, optimalMin: 25, optimalMax: 33 },
      nitrogen: { min: 80, max: 150, optimalMin: 100, optimalMax: 130 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 30, max: 70, optimalMin: 40, optimalMax: 60 },
      texture: ["Clay", "Clay Loam", "Silty Clay", "Fine Alluvial"],
      drainage: ["Slow", "Poor", "Moderate"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: {
      pH: 0.12,
      moisture: 0.35,
      temperature: 0.18,
      nitrogen: 0.15,
      phosphorus: 0.08,
      potassium: 0.05,
      texture: 0.04,
      drainage: 0.03
    },
    suitableSoilTypes: ["Alluvial Soil", "Clay Soil", "Peaty and Organic Soil"],
    suitableRegions: ["West Bengal", "Uttar Pradesh", "Punjab", "Andhra Pradesh", "Odisha", "Tamil Nadu", "Bihar", "Chhattisgarh"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Standing water of 2-5 cm maintained during vegetative and tillering stages; drainage 10 days before harvest.",
    fertilizerConsiderations: "NPK 100-120:50-60:40-50 kg/ha with Zinc Sulfate (25 kg/ha) to prevent Khaira disease.",
    cultivationInfo: "Nursery preparation in May-June followed by 21-25 day old seedling transplantation.",
    referenceSources: [
      { title: "Rice Knowledge Management Portal (RKMP)", organization: "ICAR-National Rice Research Institute (NRRI) Cuttack", year: 2022 }
    ]
  },
  {
    name: "Maize",
    scientificName: "Zea mays",
    category: "Cereal",
    description: "Known as the 'Queen of Cereals' due to its high genetic yield potential; extremely sensitive to both waterlogging and drought stress.",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.8, max: 7.8, optimalMin: 6.2, optimalMax: 7.2 },
      moisture: { min: 40, max: 70, optimalMin: 50, optimalMax: 65 },
      temperature: { min: 18, max: 35, optimalMin: 22, optimalMax: 30 },
      nitrogen: { min: 100, max: 180, optimalMin: 120, optimalMax: 150 },
      phosphorus: { min: 40, max: 80, optimalMin: 60, optimalMax: 70 },
      potassium: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      texture: ["Loam", "Sandy Loam", "Silt Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 1.0 }
    },
    parameterWeights: {
      pH: 0.15,
      moisture: 0.25,
      temperature: 0.15,
      nitrogen: 0.20,
      phosphorus: 0.10,
      potassium: 0.05,
      texture: 0.05,
      drainage: 0.05
    },
    suitableSoilTypes: ["Loamy Soil", "Alluvial Soil", "Red Soil"],
    suitableRegions: ["Karnataka", "Madhya Pradesh", "Bihar", "Tamil Nadu", "Telangana", "Maharashtra", "Rajasthan"],
    growingSeasons: ["Kharif", "Rabi", "Zaid"],
    irrigationRequirements: "Critical stages: Tasseling and silking stages; standing water for >12 hours causes irreversible root damage.",
    fertilizerConsiderations: "Requires 120:60:40 kg N:P:K per hectare. Heavy feeder of nitrogen.",
    cultivationInfo: "Spacing 60 x 20 cm, plant population ~66,000 plants/ha.",
    referenceSources: [
      { title: "Maize Cultivation in India: Technical Bulletin", organization: "ICAR-Indian Institute of Maize Research (IIMR) Ludhiana", year: 2021 }
    ]
  },
  {
    name: "Cotton",
    scientificName: "Gossypium hirsutum",
    category: "Fiber Crop",
    description: "Major commercial fiber crop of India; thrives in deep black soils capable of retaining subsoil moisture through dry periods.",
    image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.5, max: 8.5, optimalMin: 7.0, optimalMax: 8.0 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 21, max: 36, optimalMin: 25, optimalMax: 32 },
      nitrogen: { min: 80, max: 160, optimalMin: 100, optimalMax: 120 },
      phosphorus: { min: 30, max: 70, optimalMin: 45, optimalMax: 60 },
      potassium: { min: 30, max: 80, optimalMin: 50, optimalMax: 70 },
      texture: ["Clay", "Clay Loam", "Deep Black Clay"],
      drainage: ["Well-drained to Moderate"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.22,
      temperature: 0.22,
      nitrogen: 0.15,
      phosphorus: 0.08,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.03
    },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil"],
    suitableRegions: ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Karnataka", "Punjab", "Haryana"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Square formation, flowering, and boll development are critical stages. Avoid irrigation near boll opening.",
    fertilizerConsiderations: "NPK 120:60:60 kg/ha for Bt hybrids. Potassium spray (2% KNO3) at boll filling improves fiber length.",
    cultivationInfo: "Requires 180-200 frost-free days with warm days and cool nights during boll development.",
    referenceSources: [
      { title: "Bt Cotton Agronomy and Nutrient Management", organization: "ICAR-Central Institute for Cotton Research (CICR) Nagpur", year: 2020 }
    ]
  },
  {
    name: "Sugarcane",
    scientificName: "Saccharum officinarum",
    category: "Cash Crop",
    description: "Perennial grass grown across tropical and subtropical India as the primary source of sugar, jaggery, and ethanol feedstock.",
    image: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.2, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 50, max: 80, optimalMin: 60, optimalMax: 75 },
      temperature: { min: 20, max: 38, optimalMin: 28, optimalMax: 34 },
      nitrogen: { min: 150, max: 280, optimalMin: 200, optimalMax: 250 },
      phosphorus: { min: 50, max: 100, optimalMin: 60, optimalMax: 80 },
      potassium: { min: 60, max: 150, optimalMin: 80, optimalMax: 120 },
      texture: ["Loam", "Clay Loam", "Alluvial Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: {
      pH: 0.15,
      moisture: 0.28,
      temperature: 0.18,
      nitrogen: 0.18,
      phosphorus: 0.08,
      potassium: 0.08,
      texture: 0.03,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Black Soil", "Loamy Soil"],
    suitableRegions: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Bihar", "Gujarat", "Andhra Pradesh"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Water requirement 1500-2500 mm. Requires irrigation every 8-10 days in summer and 15-20 days in winter.",
    fertilizerConsiderations: "Heavy feeder: 250:80:120 kg N:P:K per hectare in multiple split doses; micronutrients like iron and sulfur essential.",
    cultivationInfo: "Planting through three-budded setts in trenches; earthing up essential at 90-120 days.",
    referenceSources: [
      { title: "Sugarcane Production Technologies in India", organization: "ICAR-Indian Institute of Sugarcane Research (IISR) Lucknow", year: 2021 }
    ]
  },
  {
    name: "Mustard",
    scientificName: "Brassica juncea",
    category: "Oilseed",
    description: "Major Rabi oilseed crop of North and North-Western India; known for low water requirement and adaptability to lighter soils.",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.4, optimalMin: 6.5, optimalMax: 7.8 },
      moisture: { min: 25, max: 55, optimalMin: 35, optimalMax: 45 },
      temperature: { min: 10, max: 26, optimalMin: 15, optimalMax: 20 },
      nitrogen: { min: 60, max: 100, optimalMin: 70, optimalMax: 90 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      texture: ["Sandy Loam", "Loam", "Light Alluvial"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.22,
      temperature: 0.20,
      nitrogen: 0.15,
      phosphorus: 0.10,
      potassium: 0.05,
      texture: 0.05,
      drainage: 0.05
    },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Sandy Soil", "Desert Soil"],
    suitableRegions: ["Rajasthan", "Madhya Pradesh", "Haryana", "Uttar Pradesh", "West Bengal", "Gujarat"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "2-3 irrigations: Flowering (30-35 DAS) and pod filling (60-65 DAS) are crucial.",
    fertilizerConsiderations: "NPK 80:40:40 kg/ha plus 20-30 kg/ha elemental Sulfur for oil content synthesis.",
    cultivationInfo: "Optimum sowing temperature 25-26°C (mid October). Seed rate 4-5 kg/ha.",
    referenceSources: [
      { title: "Rapeseed-Mustard Production Technology", organization: "ICAR-Directorate of Rapeseed-Mustard Research (DRMR) Bharatpur", year: 2021 }
    ]
  },
  {
    name: "Potato",
    scientificName: "Solanum tuberosum",
    category: "Tuber",
    description: "High-yielding horticultural tuber crop requiring loose, friable soils that offer no resistance to underground tuber enlargement.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.2, max: 7.2, optimalMin: 5.5, optimalMax: 6.5 },
      moisture: { min: 45, max: 75, optimalMin: 55, optimalMax: 65 },
      temperature: { min: 14, max: 25, optimalMin: 16, optimalMax: 20 },
      nitrogen: { min: 120, max: 200, optimalMin: 140, optimalMax: 160 },
      phosphorus: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      potassium: { min: 80, max: 160, optimalMin: 100, optimalMax: 130 },
      texture: ["Sandy Loam", "Loam", "Friable Silt Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.8, optimalMin: 1.5 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.22,
      temperature: 0.20,
      nitrogen: 0.14,
      phosphorus: 0.10,
      potassium: 0.10,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Loamy Soil", "Alluvial Soil", "Mountain Soil"],
    suitableRegions: ["Uttar Pradesh", "West Bengal", "Bihar", "Gujarat", "Punjab", "Madhya Pradesh"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Light and frequent irrigations (every 7-10 days). Tuberization stage must never experience water stress.",
    fertilizerConsiderations: "Heavy feeder: 150:100:120 kg N:P:K per hectare. Potassium sulfate (SOP) preferred over MOP for starch quality.",
    cultivationInfo: "Earthing-up operation at 30-35 days prevents greening of exposed tubers (solanine development).",
    referenceSources: [
      { title: "Potato Cultivation in Indo-Gangetic Plains", organization: "ICAR-Central Potato Research Institute (CPRI) Shimla", year: 2020 }
    ]
  },
  {
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    category: "Vegetable",
    description: "Versatile warm-season vegetable grown extensively across India; highly vulnerable to waterlogging, bacterial wilt, and blossom end rot.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.2, optimalMax: 6.8 },
      moisture: { min: 40, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 18, max: 32, optimalMin: 21, optimalMax: 26 },
      nitrogen: { min: 90, max: 150, optimalMin: 100, optimalMax: 120 },
      phosphorus: { min: 50, max: 100, optimalMin: 60, optimalMax: 80 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Sandy Loam", "Loam", "Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.22,
      temperature: 0.20,
      nitrogen: 0.12,
      phosphorus: 0.10,
      potassium: 0.10,
      texture: 0.03,
      drainage: 0.03
    },
    suitableSoilTypes: ["Loamy Soil", "Red Soil", "Alluvial Soil"],
    suitableRegions: ["Andhra Pradesh", "Madhya Pradesh", "Karnataka", "Gujarat", "Odisha", "West Bengal", "Maharashtra"],
    growingSeasons: ["Kharif", "Rabi", "Zaid"],
    irrigationRequirements: "Drip irrigation highly recommended to reduce foliage fungal infections; maintain uniform moisture during fruit swelling.",
    fertilizerConsiderations: "NPK 120:80:80 kg/ha. Calcium nitrate spray prevents blossom end rot caused by calcium deficiency.",
    cultivationInfo: "Staking with bamboo poles improves fruit quality and prevents ground contact diseases.",
    referenceSources: [
      { title: "Production Technology of Vegetable Crops", organization: "ICAR-Indian Institute of Vegetable Research (IIVR) Varanasi", year: 2021 }
    ]
  },
  {
    name: "Soybean",
    scientificName: "Glycine max",
    category: "Oilseed",
    description: "The 'Golden Bean' of Central India; dual-purpose pulse and oilseed with 40% protein and 20% oil content, fixing atmospheric nitrogen.",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.2, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 45, max: 75, optimalMin: 55, optimalMax: 65 },
      temperature: { min: 20, max: 35, optimalMin: 25, optimalMax: 30 },
      nitrogen: { min: 20, max: 40, optimalMin: 25, optimalMax: 30 },
      phosphorus: { min: 50, max: 80, optimalMin: 60, optimalMax: 70 },
      potassium: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      texture: ["Clay", "Clay Loam", "Black Soil"],
      drainage: ["Moderate to Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 0.9 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.25,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.15,
      potassium: 0.08,
      texture: 0.03,
      drainage: 0.03
    },
    suitableSoilTypes: ["Black Soil", "Loamy Soil", "Alluvial Soil"],
    suitableRegions: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka", "Telangana"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Largely rainfed; critical dry spell stages are pod initiation and seed filling.",
    fertilizerConsiderations: "NPK 20:60:40 kg/ha. Inoculation with Bradyrhizobium japonicum and PSB recommended.",
    cultivationInfo: "Optimum sowing: June 20 to July 5 after receipt of 100 mm monsoon rainfall.",
    referenceSources: [
      { title: "Soybean Production Technology", organization: "ICAR-Indian Institute of Soybean Research (IISR) Indore", year: 2021 }
    ]
  },
  {
    name: "Groundnut",
    scientificName: "Arachis hypogaea",
    category: "Oilseed",
    description: "An unpredictable legume whose flowers bloom above ground while fertilized pegs push downward to form pods underground.",
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.8, max: 7.5, optimalMin: 6.2, optimalMax: 6.8 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 22, max: 34, optimalMin: 25, optimalMax: 30 },
      nitrogen: { min: 15, max: 30, optimalMin: 20, optimalMax: 25 },
      phosphorus: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 40, max: 80, optimalMin: 50, optimalMax: 60 },
      texture: ["Sandy Loam", "Red Sandy Loam", "Loamy Sand"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.14,
      potassium: 0.10,
      texture: 0.06,
      drainage: 0.04
    },
    suitableSoilTypes: ["Red Soil", "Sandy Soil", "Loamy Soil"],
    suitableRegions: ["Gujarat", "Rajasthan", "Tamil Nadu", "Andhra Pradesh", "Karnataka", "Madhya Pradesh"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Flowering, peg penetration, and pod development are sensitive moisture stages.",
    fertilizerConsiderations: "NPK 20:60:40 kg/ha. Application of Gypsum (400 kg/ha) at 40-45 DAS supplies calcium required for pod filling.",
    cultivationInfo: "Light mechanical intercultural operation only before peg entry; avoid hoeing once pegging begins.",
    referenceSources: [
      { title: "Groundnut Production Technologies", organization: "ICAR-Directorate of Groundnut Research (DGR) Junagadh", year: 2021 }
    ]
  },
  {
    name: "Barley",
    scientificName: "Hordeum vulgare",
    category: "Cereal",
    description: "Highly hardy Rabi cereal with superior tolerance to soil salinity, alkalinity, drought, and low fertility compared to wheat.",
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.5, max: 9.0, optimalMin: 7.0, optimalMax: 8.5 },
      moisture: { min: 25, max: 55, optimalMin: 35, optimalMax: 45 },
      temperature: { min: 10, max: 27, optimalMin: 14, optimalMax: 20 },
      nitrogen: { min: 40, max: 80, optimalMin: 50, optimalMax: 60 },
      phosphorus: { min: 25, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 20, max: 40, optimalMin: 25, optimalMax: 30 },
      texture: ["Loam", "Sandy Loam", "Clay Loam"],
      drainage: ["Well-drained to Moderate"],
      organicMatter: { min: 0.3, optimalMin: 0.7 }
    },
    parameterWeights: {
      pH: 0.22,
      moisture: 0.20,
      temperature: 0.20,
      nitrogen: 0.14,
      phosphorus: 0.10,
      potassium: 0.06,
      texture: 0.04,
      drainage: 0.04
    },
    suitableSoilTypes: ["Saline and Alkaline Soil", "Mountain Soil", "Alluvial Soil", "Loamy Soil"],
    suitableRegions: ["Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Haryana", "Punjab", "Himachal Pradesh"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Low water requirement (2-3 irrigations). Active tillering and boot leaf are critical.",
    fertilizerConsiderations: "NPK 60:30:20 kg/ha for feed barley; lower nitrogen (40 kg/ha) for malt barley to keep grain protein < 10.5%.",
    cultivationInfo: "Can be sown successfully up to late December in marginal and sodic soils where wheat fails.",
    referenceSources: [
      { title: "Barley Cultivation in Sodic and Marginal Lands", organization: "ICAR-IIWBR Karnal", year: 2019 }
    ]
  },
  {
    name: "Chickpea",
    scientificName: "Cicer arietinum",
    category: "Pulse",
    description: "The premier pulse crop of India ('Gram'); thrives in cool, dry climates on conserved deep subsoil moisture, highly sensitive to salinity and waterlogging.",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.2, max: 8.2, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 25, max: 50, optimalMin: 30, optimalMax: 42 },
      temperature: { min: 12, max: 28, optimalMin: 18, optimalMax: 24 },
      nitrogen: { min: 15, max: 30, optimalMin: 20, optimalMax: 25 },
      phosphorus: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 20, max: 40, optimalMin: 25, optimalMax: 30 },
      texture: ["Clay Loam", "Loam", "Deep Black Soil"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.16,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.04
    },
    suitableSoilTypes: ["Black Soil", "Loamy Soil", "Alluvial Soil"],
    suitableRegions: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Gujarat", "Uttar Pradesh", "Karnataka"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "1-2 light irrigations (pre-flowering and pod development). Over-irrigation causes vegetative lodging and Ascochyta blight.",
    fertilizerConsiderations: "NPK 20:50:20 kg/ha plus 20 kg/ha Sulfur. Seed treated with Mesorhizobium ciceri.",
    cultivationInfo: "Nipping / apical bud pinching at 35-40 days stimulates lateral branching and pod yield.",
    referenceSources: [
      { title: "Pulses Production Technologies in India", organization: "ICAR-Indian Institute of Pulses Research (IIPR) Kanpur", year: 2021 }
    ]
  },
  {
    name: "Bajra (Pearl Millet)",
    scientificName: "Pennisetum glaucum",
    category: "Millet",
    description: "Highly drought-hardy coarse grain cereal adapted to arid and semi-arid tracts of Western India with low rainfall.",
    image: "https://images.unsplash.com/photo-1627920769395-534724e54854?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.5, max: 8.5, optimalMin: 7.0, optimalMax: 8.0 },
      moisture: { min: 15, max: 40, optimalMin: 20, optimalMax: 30 },
      temperature: { min: 20, max: 40, optimalMin: 28, optimalMax: 34 },
      nitrogen: { min: 40, max: 90, optimalMin: 60, optimalMax: 80 },
      phosphorus: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 20, max: 50, optimalMin: 25, optimalMax: 40 },
      texture: ["Sandy", "Sandy Loam", "Loam"],
      drainage: ["Excessive", "Well-drained"],
      organicMatter: { min: 0.2, optimalMin: 0.5 }
    },
    parameterWeights: {
      pH: 0.16,
      moisture: 0.26,
      temperature: 0.22,
      nitrogen: 0.14,
      phosphorus: 0.08,
      potassium: 0.06,
      texture: 0.05,
      drainage: 0.03
    },
    suitableSoilTypes: ["Desert Soil", "Sandy Soil", "Red Soil"],
    suitableRegions: ["Rajasthan", "Gujarat", "Haryana", "Maharashtra", "Uttar Pradesh"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Rainfed crop; 1-2 protective irrigations during prolonged dry spells at panicle emergence.",
    fertilizerConsiderations: "NPK 80:40:40 kg/ha for hybrids. Apply half N and all P & K basal.",
    cultivationInfo: "Sowing in July with onset of monsoon. Seed rate 4-5 kg/ha.",
    referenceSources: [
      { title: "Millet Cultivation Guidelines", organization: "ICAR-Indian Institute of Millets Research (IIMR) Hyderabad", year: 2023 }
    ]
  },
  {
    name: "Jowar (Sorghum)",
    scientificName: "Sorghum bicolor",
    category: "Millet",
    description: "Versatile dual-purpose food and fodder crop tolerant to intermittent drought and temporary waterlogging.",
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.5, optimalMin: 6.5, optimalMax: 7.8 },
      moisture: { min: 25, max: 55, optimalMin: 35, optimalMax: 45 },
      temperature: { min: 20, max: 38, optimalMin: 26, optimalMax: 32 },
      nitrogen: { min: 50, max: 100, optimalMin: 70, optimalMax: 90 },
      phosphorus: { min: 25, max: 60, optimalMin: 35, optimalMax: 45 },
      potassium: { min: 25, max: 60, optimalMin: 30, optimalMax: 50 },
      texture: ["Clay Loam", "Loam", "Clay"],
      drainage: ["Well-drained", "Moderate"],
      organicMatter: { min: 0.3, optimalMin: 0.6 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.20,
      nitrogen: 0.15,
      phosphorus: 0.10,
      potassium: 0.05,
      texture: 0.05,
      drainage: 0.03
    },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Loamy Soil"],
    suitableRegions: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Andhra Pradesh", "Telangana"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Usually rainfed in Kharif; Rabi jowar requires 2-3 irrigations (booting, flowering, milk stage).",
    fertilizerConsiderations: "NPK 80:40:40 kg/ha for rainfed; 100:50:50 kg/ha for irrigated conditions.",
    cultivationInfo: "Optimum sowing for Rabi is September-October; Kharif sowing late June.",
    referenceSources: [
      { title: "Sorghum Agronomy Handbooks", organization: "ICAR-IIMR & ICRISAT", year: 2022 }
    ]
  },
  {
    name: "Ragi (Finger Millet)",
    scientificName: "Eleusine coracana",
    category: "Millet",
    description: "Nutri-cereal renowned for high calcium content, grown extensively in southern red lateritic undulating topography.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 7.8, optimalMin: 6.0, optimalMax: 7.0 },
      moisture: { min: 25, max: 60, optimalMin: 35, optimalMax: 50 },
      temperature: { min: 18, max: 35, optimalMin: 24, optimalMax: 30 },
      nitrogen: { min: 40, max: 80, optimalMin: 50, optimalMax: 60 },
      phosphorus: { min: 20, max: 50, optimalMin: 25, optimalMax: 40 },
      potassium: { min: 20, max: 40, optimalMin: 25, optimalMax: 35 },
      texture: ["Red Loam", "Sandy Loam", "Lateritic Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.15,
      phosphorus: 0.10,
      potassium: 0.07,
      texture: 0.05,
      drainage: 0.03
    },
    suitableSoilTypes: ["Red Soil", "Laterite Soil", "Loamy Soil"],
    suitableRegions: ["Karnataka", "Tamil Nadu", "Odisha", "Uttarakhand", "Andhra Pradesh"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Transplanted ragi needs 3-4 light irrigations. Extremely hardy against seasonal droughts.",
    fertilizerConsiderations: "NPK 50:40:25 kg/ha with FYM 5-7 tonnes/ha.",
    cultivationInfo: "Nursery sowing June-July followed by 21-day seedling transplantation.",
    referenceSources: [
      { title: "Package of Practices for Finger Millet", organization: "UAS Bangalore & ICAR", year: 2021 }
    ]
  },
  {
    name: "Jute",
    scientificName: "Corchorus capsularis",
    category: "Cash Crop",
    description: "The 'Golden Fiber' of Eastern India, requiring hot humid deltaic conditions and abundant standing fresh water for retting.",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.4, optimalMax: 7.2 },
      moisture: { min: 60, max: 90, optimalMin: 70, optimalMax: 85 },
      temperature: { min: 24, max: 38, optimalMin: 28, optimalMax: 35 },
      nitrogen: { min: 50, max: 90, optimalMin: 60, optimalMax: 80 },
      phosphorus: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      potassium: { min: 30, max: 70, optimalMin: 40, optimalMax: 60 },
      texture: ["Clay Loam", "Silt Loam", "Alluvial Silt"],
      drainage: ["Moderate", "Poor"],
      organicMatter: { min: 0.5, optimalMin: 1.0 }
    },
    parameterWeights: {
      pH: 0.16,
      moisture: 0.28,
      temperature: 0.22,
      nitrogen: 0.14,
      phosphorus: 0.08,
      potassium: 0.06,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Deltaic Marine Alluvium"],
    suitableRegions: ["West Bengal", "Bihar", "Assam", "Odisha", "Meghalaya"],
    growingSeasons: ["Zaid", "Kharif"],
    irrigationRequirements: "Requires pre-monsoon shower or 1-2 irrigations at germination, then relies on heavy monsoon rains.",
    fertilizerConsiderations: "NPK 60:30:30 kg/ha. Foliar spray of urea (1%) at 35-40 days accelerates vegetative elongation.",
    cultivationInfo: "Harvested at 120-135 days (small pod stage) for premium fiber fineness.",
    referenceSources: [
      { title: "Jute and Allied Fibres Production", organization: "ICAR-CRIJAF Barrackpore", year: 2021 }
    ]
  },
  {
    name: "Tobacco",
    scientificName: "Nicotiana tabacum",
    category: "Cash Crop",
    description: "Commercial cash crop sensitive to soil chlorides and excess salinity; requires controlled soil moisture and light sandy loam.",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 7.5, optimalMin: 6.0, optimalMax: 6.8 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 18, max: 32, optimalMin: 22, optimalMax: 28 },
      nitrogen: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      phosphorus: { min: 30, max: 70, optimalMin: 40, optimalMax: 55 },
      potassium: { min: 50, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Sandy Loam", "Loam", "Fine Sand"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.7 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.12,
      phosphorus: 0.10,
      potassium: 0.14,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Sandy Soil", "Red Soil", "Loamy Soil"],
    suitableRegions: ["Andhra Pradesh", "Gujarat", "Karnataka", "Uttar Pradesh"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Sensitive to waterlogging; 4-6 light furrow irrigations. Saline water impairs combustibility.",
    fertilizerConsiderations: "Sulfate of potash (SOP) strictly preferred over muriate of potash (MOP) to avoid chlorine toxicity.",
    cultivationInfo: "Topping and desuckering done at button stage to channel nutrients into leaf expansion.",
    referenceSources: [
      { title: "Tobacco Production Technology", organization: "ICAR-CTRI Rajahmundry", year: 2020 }
    ]
  },
  {
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    category: "Oilseed",
    description: "Photo-insensitive premium oilseed crop suitable for all seasons; responds vigorously to moisture and boron supplementation.",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.5, max: 8.2, optimalMin: 6.8, optimalMax: 7.8 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 18, max: 34, optimalMin: 22, optimalMax: 28 },
      nitrogen: { min: 60, max: 100, optimalMin: 70, optimalMax: 90 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      potassium: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      texture: ["Clay Loam", "Black Clay", "Loam"],
      drainage: ["Well-drained", "Moderate"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.20,
      nitrogen: 0.15,
      phosphorus: 0.11,
      potassium: 0.06,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Loamy Soil"],
    suitableRegions: ["Karnataka", "Maharashtra", "Andhra Pradesh", "Punjab", "Haryana"],
    growingSeasons: ["Kharif", "Rabi", "Zaid"],
    irrigationRequirements: "4-5 irrigations; critical stages are bud initiation, ray-floret opening, and seed setting.",
    fertilizerConsiderations: "NPK 60:60:40 kg/ha with Boron (Borax @ 2 g/L) foliar spray at ray floret stage to avoid hollow seeds.",
    cultivationInfo: "Maintain row spacing 60 cm x 30 cm. Hand pollination increases seed set by 15-20%.",
    referenceSources: [
      { title: "Sunflower Production Technology", organization: "ICAR-IIOR Hyderabad", year: 2021 }
    ]
  },
  {
    name: "Sesame (Til)",
    scientificName: "Sesamum indicum",
    category: "Oilseed",
    description: "Ancient 'Queen of Oilseeds' tolerant to dry heat but exceptionally vulnerable to standing water and poor drainage.",
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 8.0, optimalMin: 6.2, optimalMax: 7.2 },
      moisture: { min: 20, max: 45, optimalMin: 25, optimalMax: 35 },
      temperature: { min: 25, max: 38, optimalMin: 28, optimalMax: 33 },
      nitrogen: { min: 30, max: 60, optimalMin: 35, optimalMax: 45 },
      phosphorus: { min: 20, max: 40, optimalMin: 25, optimalMax: 35 },
      potassium: { min: 20, max: 40, optimalMin: 20, optimalMax: 30 },
      texture: ["Sandy Loam", "Light Alluvial", "Red Loam"],
      drainage: ["Well-drained", "Rapid"],
      organicMatter: { min: 0.3, optimalMin: 0.6 }
    },
    parameterWeights: {
      pH: 0.16,
      moisture: 0.28,
      temperature: 0.22,
      nitrogen: 0.12,
      phosphorus: 0.10,
      potassium: 0.06,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Sandy Soil", "Red Soil", "Loamy Soil"],
    suitableRegions: ["Gujarat", "West Bengal", "Rajasthan", "Tamil Nadu", "Madhya Pradesh"],
    growingSeasons: ["Kharif", "Zaid"],
    irrigationRequirements: "Requires 1-2 irrigations at critical flowering and capsule development stages; no water stagnation.",
    fertilizerConsiderations: "NPK 40:20:20 kg/ha plus 20 kg Sulfur per ha for oil synthesis.",
    cultivationInfo: "Seed rate 4-5 kg/ha; thin seedlings at 15-20 days to prevent crowding.",
    referenceSources: [
      { title: "Sesame Improvement & Management", organization: "ICAR-AICRP Sesame & Niger, Jabalpur", year: 2022 }
    ]
  },
  {
    name: "Pigeon Pea (Arhar / Tur)",
    scientificName: "Cajanus cajan",
    category: "Pulse",
    description: "Deep-rooted major pulse crop that enriches soil through atmospheric nitrogen fixation (up to 40 kg N/ha) and deep leaf litter fall.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.5, max: 8.2, optimalMin: 7.0, optimalMax: 7.8 },
      moisture: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      temperature: { min: 20, max: 36, optimalMin: 25, optimalMax: 32 },
      nitrogen: { min: 20, max: 40, optimalMin: 25, optimalMax: 30 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 65 },
      potassium: { min: 20, max: 50, optimalMin: 30, optimalMax: 40 },
      texture: ["Clay Loam", "Black Soil", "Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.18,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Loamy Soil"],
    suitableRegions: ["Maharashtra", "Madhya Pradesh", "Karnataka", "Uttar Pradesh", "Gujarat"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Grown as rainfed crop; responsive to 2 protective irrigations at flower initiation and pod fill.",
    fertilizerConsiderations: "NPK 20:50:20 kg/ha with Rhizobium inoculation. Sensitive to zinc deficiency.",
    cultivationInfo: "Intercropped with cotton, soybean, or sorghum. Duration 150-180 days.",
    referenceSources: [
      { title: "Pigeonpea Production Handbooks", organization: "ICAR-IIPR Kanpur", year: 2021 }
    ]
  },
  {
    name: "Green Gram (Moong)",
    scientificName: "Vigna radiata",
    category: "Pulse",
    description: "Short-duration (60-65 days) restorative legume ideally suited for catch-cropping in Rice-Wheat rotation.",
    image: "https://images.unsplash.com/photo-1584947948332-90214a1fa1c4?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.2, max: 7.8, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 25, max: 50, optimalMin: 30, optimalMax: 40 },
      temperature: { min: 22, max: 38, optimalMin: 28, optimalMax: 34 },
      nitrogen: { min: 15, max: 35, optimalMin: 20, optimalMax: 25 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 15, max: 35, optimalMin: 20, optimalMax: 30 },
      texture: ["Loam", "Sandy Loam", "Alluvial Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.18,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Punjab", "Bihar"],
    growingSeasons: ["Zaid", "Kharif"],
    irrigationRequirements: "In Summer/Zaid: 3-4 irrigations at 10-15 day intervals; stop irrigation prior to pod maturity.",
    fertilizerConsiderations: "NPK 20:40:20 kg/ha. Seed treated with Rhizobium and PSB culture.",
    cultivationInfo: "Yellow Mosaic Virus (YMV) resistant varieties like IPM 205-7 (Virat) recommended.",
    referenceSources: [
      { title: "Summer Moong Cultivation in Indo-Gangetic Plains", organization: "PAU Ludhiana & ICAR", year: 2022 }
    ]
  },
  {
    name: "Black Gram (Urad)",
    scientificName: "Vigna mungo",
    category: "Pulse",
    description: "High-protein pulse crop that thrives in warmer climates and provides rich organic green manure when mulched.",
    image: "https://images.unsplash.com/photo-1610450949065-2f4728557253?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.8, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 30, max: 55, optimalMin: 35, optimalMax: 45 },
      temperature: { min: 22, max: 36, optimalMin: 27, optimalMax: 32 },
      nitrogen: { min: 15, max: 35, optimalMin: 20, optimalMax: 25 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 15, max: 35, optimalMin: 20, optimalMax: 30 },
      texture: ["Clay Loam", "Black Cotton Soil", "Loam"],
      drainage: ["Well-drained", "Moderate"],
      organicMatter: { min: 0.4, optimalMin: 0.7 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.18,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Black Soil", "Alluvial Soil", "Red Soil"],
    suitableRegions: ["Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh", "Tamil Nadu", "Maharashtra"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Rainfed in Kharif; 2 irrigations in Rabi/Summer (flowering & pod initiation).",
    fertilizerConsiderations: "NPK 20:40:20 kg/ha with sulfur 20 kg/ha for enhancing methionine amino acid content.",
    cultivationInfo: "Harvest when 80% pods turn black to prevent shattering losses.",
    referenceSources: [
      { title: "Urad Bean Production Practices", organization: "ICAR-IIPR Kanpur", year: 2021 }
    ]
  },
  {
    name: "Lentil (Masoor)",
    scientificName: "Lens culinaris",
    category: "Pulse",
    description: "Hardy cool-season legume with excellent cold tolerance, well adapted to residual moisture in post-paddy fields.",
    image: "https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 8.0, optimalMin: 6.5, optimalMax: 7.5 },
      moisture: { min: 25, max: 50, optimalMin: 35, optimalMax: 45 },
      temperature: { min: 10, max: 26, optimalMin: 16, optimalMax: 22 },
      nitrogen: { min: 15, max: 30, optimalMin: 20, optimalMax: 25 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 15, max: 35, optimalMin: 20, optimalMax: 25 },
      texture: ["Loam", "Clay Loam", "Alluvial Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.4, optimalMin: 0.8 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.08,
      phosphorus: 0.18,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "West Bengal", "Rajasthan"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "1-2 light irrigations (40-45 days and 65-70 days). Avoid waterlogging.",
    fertilizerConsiderations: "NPK 20:40:20 kg/ha. Responds well to Rhizobium leguminosarum inoculation.",
    cultivationInfo: "Broadcasted as relay crop (Utera/Paira) in standing rice 10-15 days before paddy harvest.",
    referenceSources: [
      { title: "Lentil Package of Practices", organization: "ICAR-IIPR & BHU Agri Faculty", year: 2021 }
    ]
  },
  {
    name: "Onion",
    scientificName: "Allium cepa",
    category: "Vegetable",
    description: "High-value bulb crop requiring friable, humus-rich soil for uniform bulb expansion and pungency synthesis.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.5, optimalMax: 7.0 },
      moisture: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      temperature: { min: 12, max: 30, optimalMin: 18, optimalMax: 25 },
      nitrogen: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      phosphorus: { min: 40, max: 80, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 50, max: 100, optimalMin: 60, optimalMax: 80 },
      texture: ["Sandy Loam", "Friable Alluvial Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.6, optimalMin: 1.2 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.14,
      phosphorus: 0.10,
      potassium: 0.10,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Maharashtra", "Madhya Pradesh", "Karnataka", "Gujarat", "Bihar"],
    growingSeasons: ["Rabi", "Kharif"],
    irrigationRequirements: "Shallow root system requires frequent light irrigations (every 7-10 days). Stop watering 10-15 days before harvest.",
    fertilizerConsiderations: "NPK 100:50:50 kg/ha with 30 kg/ha Sulfur to enhance pyruvic acid and storage bulb quality.",
    cultivationInfo: "Transplant 6-7 week nursery seedlings. Neck fall (50%) indicates crop maturity.",
    referenceSources: [
      { title: "Onion and Garlic Production Compendium", organization: "ICAR-Directorate of Onion and Garlic Research (DOGR) Pune", year: 2022 }
    ]
  },
  {
    name: "Chilli",
    scientificName: "Capsicum annuum",
    category: "Spices",
    description: "Major spice crop demanding well-aerated fertile soils with good drainage; intolerant to both water stagnation and prolonged desiccation.",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.5, optimalMax: 7.0 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 18, max: 35, optimalMin: 22, optimalMax: 28 },
      nitrogen: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      phosphorus: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      texture: ["Loam", "Sandy Loam", "Black Clay Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 1.0 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.14,
      phosphorus: 0.10,
      potassium: 0.10,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Black Soil", "Red Soil", "Loamy Soil"],
    suitableRegions: ["Andhra Pradesh", "Telangana", "Madhya Pradesh", "Karnataka", "West Bengal"],
    growingSeasons: ["Kharif", "Rabi"],
    irrigationRequirements: "Drip irrigation recommended. Water stress during flowering induces blossom drop and fruit shedding.",
    fertilizerConsiderations: "NPK 120:60:60 kg/ha with micronutrient sprays of Calcium and Boron to prevent blossom end rot.",
    cultivationInfo: "Transplant 35-day seedlings. Multiple manual pickings as pods turn deep crimson red.",
    referenceSources: [
      { title: "Chilli Cultivation Guidelines", organization: "ICAR-Indian Institute of Spices Research (IISR) Kozhikode", year: 2021 }
    ]
  },
  {
    name: "Garlic",
    scientificName: "Allium sativum",
    category: "Spices",
    description: "Sulphur-rich bulb crop that requires cool winter conditions for vegetative growth followed by warm dry weather for bulb development.",
    image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 6.0, max: 7.5, optimalMin: 6.5, optimalMax: 7.2 },
      moisture: { min: 35, max: 65, optimalMin: 45, optimalMax: 55 },
      temperature: { min: 12, max: 28, optimalMin: 16, optimalMax: 22 },
      nitrogen: { min: 60, max: 100, optimalMin: 75, optimalMax: 90 },
      phosphorus: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 40, max: 80, optimalMin: 50, optimalMax: 70 },
      texture: ["Loam", "Clay Loam", "Alluvial Silt Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.5, optimalMin: 1.0 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.14,
      phosphorus: 0.10,
      potassium: 0.10,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Madhya Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh"],
    growingSeasons: ["Rabi"],
    irrigationRequirements: "Irrigate every 8-10 days during vegetative phase; cease irrigation 10-14 days before harvest.",
    fertilizerConsiderations: "NPK 100:50:50 kg/ha with 40 kg/ha elemental sulfur for allicin concentration.",
    cultivationInfo: "Plant healthy outer cloves at 15 cm x 10 cm spacing. Maturity reached when tops dry and fall over.",
    referenceSources: [
      { title: "Garlic Production Technology", organization: "ICAR-DOGR Pune & NHRDF", year: 2021 }
    ]
  },
  {
    name: "Ginger",
    scientificName: "Zingiber officinale",
    category: "Spices",
    description: "Shade-tolerant rhizomatous spice crop thriving in humid sub-tropical high-rainfall regions with organic lateritic and forest soils.",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 6.8, optimalMin: 5.8, optimalMax: 6.5 },
      moisture: { min: 50, max: 85, optimalMin: 60, optimalMax: 75 },
      temperature: { min: 20, max: 32, optimalMin: 24, optimalMax: 28 },
      nitrogen: { min: 50, max: 100, optimalMin: 75, optimalMax: 90 },
      phosphorus: { min: 40, max: 60, optimalMin: 45, optimalMax: 55 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Sandy Loam", "Red Loam", "Clay Loam"],
      drainage: ["Well-drained", "Rapid"],
      organicMatter: { min: 0.8, optimalMin: 1.5 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.26,
      temperature: 0.18,
      nitrogen: 0.12,
      phosphorus: 0.10,
      potassium: 0.12,
      texture: 0.02,
      drainage: 0.02
    },
    suitableSoilTypes: ["Laterite Soil", "Red Soil", "Sub-Mountain & Terai Soil"],
    suitableRegions: ["Kerala", "Assam", "Meghalaya", "Odisha", "West Bengal", "Karnataka"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "Requires 1500-2500 mm rain or frequent irrigations; mulch with green leaves @ 10-12 t/ha to conserve moisture.",
    fertilizerConsiderations: "NPK 75:50:50 kg/ha along with FYM 25 t/ha and Trichoderma bio-control for soft-rot prevention.",
    cultivationInfo: "Plant 20-25 g mother rhizome bits in raised beds (15 cm high) to avoid rhizome rot.",
    referenceSources: [
      { title: "Ginger Cultivation and Management", organization: "ICAR-IISR Kozhikode", year: 2022 }
    ]
  },
  {
    name: "Turmeric",
    scientificName: "Curcuma longa",
    category: "Spices",
    description: "Golden rhizome spice known for medicinal curcumin, requiring warm humid weather, deep friable loams, and thick organic mulching.",
    image: "https://images.unsplash.com/photo-1615485290449-33ca08571060?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.8, max: 7.5, optimalMin: 6.2, optimalMax: 7.0 },
      moisture: { min: 45, max: 80, optimalMin: 55, optimalMax: 70 },
      temperature: { min: 20, max: 35, optimalMin: 25, optimalMax: 30 },
      nitrogen: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      phosphorus: { min: 40, max: 70, optimalMin: 50, optimalMax: 60 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Loam", "Clay Loam", "Red Loam"],
      drainage: ["Well-drained"],
      organicMatter: { min: 0.7, optimalMin: 1.5 }
    },
    parameterWeights: {
      pH: 0.18,
      moisture: 0.24,
      temperature: 0.18,
      nitrogen: 0.12,
      phosphorus: 0.10,
      potassium: 0.12,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Red Soil", "Alluvial Soil", "Loamy Soil", "Black Soil"],
    suitableRegions: ["Telangana", "Maharashtra", "Tamil Nadu", "Andhra Pradesh", "Odisha"],
    growingSeasons: ["Kharif"],
    irrigationRequirements: "15-20 light irrigations in clay loams depending on weather; critical during rhizome development.",
    fertilizerConsiderations: "NPK 120:60:120 kg/ha. Apply potash in 3 split doses for high rhizome plumpness.",
    cultivationInfo: "Harvested at 7-9 months when leaves turn dry and yellow. Boiling & polishing done post-harvest.",
    referenceSources: [
      { title: "Turmeric Package of Practices", organization: "ICAR-IISR Kozhikode & PJTSAU Hyderabad", year: 2021 }
    ]
  },
  {
    name: "Tea",
    scientificName: "Camellia sinensis",
    category: "Plantation",
    description: "Perennial evergreen plantation shrub requiring acidic, well-aerated hillside soils with no lime or stagnant water.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 4.5, max: 5.8, optimalMin: 4.8, optimalMax: 5.5 },
      moisture: { min: 55, max: 85, optimalMin: 65, optimalMax: 78 },
      temperature: { min: 15, max: 32, optimalMin: 20, optimalMax: 26 },
      nitrogen: { min: 90, max: 160, optimalMin: 110, optimalMax: 140 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Porous Forest Loam", "Lateritic Clay Loam", "Sandy Loam"],
      drainage: ["Rapid", "Well-drained"],
      organicMatter: { min: 1.0, optimalMin: 2.0 }
    },
    parameterWeights: {
      pH: 0.22,
      moisture: 0.22,
      temperature: 0.18,
      nitrogen: 0.16,
      phosphorus: 0.08,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Mountain Soil", "Laterite Soil", "Red Soil"],
    suitableRegions: ["Assam", "West Bengal (Darjeeling)", "Tamil Nadu (Nilgiris)", "Kerala", "Himachal Pradesh"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "High rainfall (1500-2500 mm); supplementary sprinkler irrigation during dry winter months in Northeast plains.",
    fertilizerConsiderations: "NPK 140:40:80 kg/ha in 2-3 split applications along with Zinc Sulphate 1% foliar spray.",
    cultivationInfo: "Contour planting on hill slopes; fine plucking of 'two leaves and a bud'.",
    referenceSources: [
      { title: "Tea Field Management Guide", organization: "Tea Research Association (TRA Tocklai) & ICAR", year: 2020 }
    ]
  },
  {
    name: "Coffee",
    scientificName: "Coffea arabica",
    category: "Plantation",
    description: "High-altitude shade-grown plantation beverage crop that thrives under a canopy of two-tier forest trees in the Western Ghats.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    idealRequirements: {
      pH: { min: 5.5, max: 6.8, optimalMin: 6.0, optimalMax: 6.5 },
      moisture: { min: 50, max: 80, optimalMin: 60, optimalMax: 70 },
      temperature: { min: 15, max: 28, optimalMin: 18, optimalMax: 24 },
      nitrogen: { min: 80, max: 140, optimalMin: 100, optimalMax: 120 },
      phosphorus: { min: 30, max: 60, optimalMin: 40, optimalMax: 50 },
      potassium: { min: 60, max: 120, optimalMin: 80, optimalMax: 100 },
      texture: ["Deep Red Loam", "Lateritic Friable Loam", "Forest Humus Soil"],
      drainage: ["Well-drained"],
      organicMatter: { min: 1.0, optimalMin: 2.2 }
    },
    parameterWeights: {
      pH: 0.20,
      moisture: 0.22,
      temperature: 0.20,
      nitrogen: 0.15,
      phosphorus: 0.09,
      potassium: 0.08,
      texture: 0.04,
      drainage: 0.02
    },
    suitableSoilTypes: ["Laterite Soil", "Red Soil", "Mountain Soil"],
    suitableRegions: ["Karnataka (Chikmagalur, Coorg)", "Kerala (Wayanad)", "Tamil Nadu", "Andhra Pradesh (Araku Valley)"],
    growingSeasons: ["Perennial"],
    irrigationRequirements: "Blossom showers in March-April (25-40 mm) critical for flowering, followed by backing showers.",
    fertilizerConsiderations: "NPK 120:90:120 kg/ha applied pre-monsoon and post-monsoon.",
    cultivationInfo: "Arabica grown between 1000-1500m elevation under shade trees like Silver Oak and Dadap.",
    referenceSources: [
      { title: "Coffee Guide and Technical Bulletin", organization: "Central Coffee Research Institute (CCRI) & Coffee Board of India", year: 2021 }
    ]
  }
];

async function seedCrops() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB for Crops.');

    await Crop.deleteMany({});
    console.log('[Seed] Cleared existing crops collection.');

    const created = await Crop.insertMany(indianCrops);
    console.log(`[Seed Success] Inserted ${created.length} Indian Crops with ICAR/IARI/PAU data.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed crops:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCrops();
}

module.exports = { indianCrops, seedCrops };
