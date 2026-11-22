const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SoilType = require('../models/SoilType');

dotenv.config();

const indianSoilTypes = [
  {
    name: "Alluvial Soil",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    classification: "Entisols, Inceptisols & Alfisols (ICAR / NBSS&LUP)",
    shortDescription: "Formed by deposition of silt brought by Indo-Gangetic rivers; highly fertile and agriculturally productive.",
    characteristics: [
      "Light grey to ash grey in colour depending on depth",
      "Rich in potash and lime, but deficient in nitrogen and organic matter",
      "Porous and permeable with high capillary capacity",
      "Composed of Khadar (newer alluvium) and Bhangar (older alluvium)"
    ],
    texture: ["Loam", "Clay Loam", "Sandy Loam", "Silt Loam"],
    typicalPH: { min: 6.5, max: 8.4, median: 7.2 },
    moistureCharacteristics: {
      waterHoldingCapacity: "High",
      drainageRate: "Moderate to Good",
      retention: "Good"
    },
    waterRetention: "High",
    drainage: "Well-drained to Moderate",
    nutrientCharacteristics: {
      nitrogenStatus: "Low to Deficient",
      phosphorusStatus: "Medium",
      potassiumStatus: "Adequate to Rich",
      organicCarbon: "Low (0.3% - 0.5%)"
    },
    geographicDistribution: [
      "Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal", "Assam", "Coastal deltas of Odisha, Andhra Pradesh & Tamil Nadu"
    ],
    agriculturalApplications: [
      "Intensive grain farming (Wheat, Rice)",
      "Cash crops (Sugarcane, Jute)",
      "Oilseeds (Mustard, Sesame)"
    ],
    suitableCropsSummary: [
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Ideal pH (6.5-7.5) and good water-retentive loamy texture facilitate high tillering." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Fine alluvium/clay alluvium maintains standing puddle water essential for paddy." },
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Highly Suitable", explanation: "Deep fertile alluvium provides root anchorage and moisture retention for long crop cycle." },
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable", explanation: "Thrives in well-drained sandy loam alluvium during Rabi season." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Suitable with Improvements", explanation: "Requires loose friable texture; needs organic carbon and balanced nitrogen supplementation." }
    ],
    referenceSources: [
      { title: "Soils of India and their Management", organization: "Indian Council of Agricultural Research (ICAR)", year: 2015 },
      { title: "Soil Series of India Benchmark Database", organization: "National Bureau of Soil Survey and Land Use Planning (NBSS&LUP)", year: 2019 }
    ]
  },
  {
    name: "Black Soil",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80",
    classification: "Vertisols (Deccan Trap Regur Soils)",
    shortDescription: "Formed by weathering of basaltic volcanic lava rocks; self-ploughing clay soil with very high moisture capacity.",
    characteristics: [
      "Deep black to chestnut brown colour due to titaniferous magnetite",
      "High montmorillonite clay content exceeding 40-60%",
      "Exhibits deep cracking during dry season ('self-aerating')",
      "Extremely sticky when wet and hard when dry"
    ],
    texture: ["Clay", "Clay Loam", "Heavy Clay"],
    typicalPH: { min: 7.2, max: 8.8, median: 8.0 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very High",
      drainageRate: "Slow to Poor",
      retention: "Very High"
    },
    waterRetention: "Very High",
    drainage: "Slow",
    nutrientCharacteristics: {
      nitrogenStatus: "Very Low",
      phosphorusStatus: "Low",
      potassiumStatus: "High to Rich",
      organicCarbon: "Medium (0.4% - 0.7%)"
    },
    geographicDistribution: [
      "Maharashtra", "Madhya Pradesh", "Gujarat", "Northern Karnataka", "Telangana", "Andhra Pradesh"
    ],
    agriculturalApplications: [
      "Rainfed cotton cultivation (Regur)",
      "Soybean and pulses in Kharif",
      "Wheat and Chickpea in Rabi on residual moisture"
    ],
    suitableCropsSummary: [
      { cropName: "Cotton", scientificName: "Gossypium hirsutum", category: "Fiber Crop", suitabilityLevel: "Highly Suitable", explanation: "Vertisols retain subsoil moisture throughout the boll maturation stage." },
      { cropName: "Soybean", scientificName: "Glycine max", category: "Oilseed", suitabilityLevel: "Highly Suitable", explanation: "Deep black soil supports strong nodulation and moisture buffer in Central India." },
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Highly Suitable", explanation: "Utilizes conserved deep moisture during post-monsoon Rabi season." },
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Suitable", explanation: "Produces well under irrigated or conserved moisture regimes; prone to waterlogging if over-irrigated." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Suitable with Improvements", explanation: "Heavy clay restricts tuber expansion; requires sand/compost addition for aerated ridges." }
    ],
    referenceSources: [
      { title: "Vertisols of India: Diversity, Distribution and Properties", organization: "NBSS&LUP", year: 2018 },
      { title: "Handbook of Agriculture", organization: "ICAR", year: 2021 }
    ]
  },
  {
    name: "Red Soil",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    classification: "Alfisols, Ultisols & Inceptisols",
    shortDescription: "Formed by weathering of ancient crystalline metamorphic rocks under moderate rainfall; rich in iron oxides.",
    characteristics: [
      "Red colour due to high ferric oxide diffusion; yellowish in hydrated form",
      "Generally light-textured with porous and friable structure",
      "Low water holding capacity; prone to rapid leaching",
      "Deficient in nitrogen, phosphorus, humus and lime"
    ],
    texture: ["Sandy Loam", "Loam", "Gravelly Sandy Loam"],
    typicalPH: { min: 5.5, max: 7.0, median: 6.2 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Low to Moderate",
      drainageRate: "Fast / Excessive",
      retention: "Low"
    },
    waterRetention: "Low",
    drainage: "Well-drained to Rapid",
    nutrientCharacteristics: {
      nitrogenStatus: "Deficient",
      phosphorusStatus: "Low (P-fixation common)",
      potassiumStatus: "Medium",
      organicCarbon: "Low (< 0.4%)"
    },
    geographicDistribution: [
      "Tamil Nadu", "Karnataka", "Southern Andhra Pradesh", "Odisha", "Jharkhand", "Chhattisgarh", "Meghalaya"
    ],
    agriculturalApplications: [
      "Dryland millets and pulses",
      "Groundnut and oilseeds",
      "Horticulture (Mango, Guava, Cashew)"
    ],
    suitableCropsSummary: [
      { cropName: "Groundnut", scientificName: "Arachis hypogaea", category: "Oilseed", suitabilityLevel: "Highly Suitable", explanation: "Porous, friable red sandy loam enables easy peg penetration and pod development." },
      { cropName: "Maize", scientificName: "Zea mays", category: "Cereal", suitabilityLevel: "Suitable", explanation: "Thrives in well-drained conditions with regular split fertilizer applications." },
      { cropName: "Tomato", scientificName: "Solanum lycopersicum", category: "Vegetable", suitabilityLevel: "Suitable", explanation: "Slightly acidic to neutral pH (6.0-6.8) and warm drainage reduce root rot diseases." },
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Suitable with Improvements", explanation: "Requires liming if pH is below 6.0 and supplemental phosphorus fertilization." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Requires bunding, intensive irrigation, and organic matter to compensate for low water retention." }
    ],
    referenceSources: [
      { title: "Red and Lateritic Soils of India: Resources and Management", organization: "NBSS&LUP", year: 2017 },
      { title: "ICAR Crop Production Guide for Drylands", organization: "ICAR", year: 2020 }
    ]
  },
  {
    name: "Laterite Soil",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    classification: "Oxisols & Ultisols",
    shortDescription: "Formed under tropical wet-dry climatic conditions through intense leaching of silica, leaving iron and aluminum oxides.",
    characteristics: [
      "Coarse, vesicular and crumbly surface; hardens irreversibly when exposed to air",
      "Intensely leached with very low cation exchange capacity (CEC)",
      "Strongly acidic with high aluminum toxicity risk",
      "Poor nutrient retention capacity"
    ],
    texture: ["Gravelly Clay Loam", "Sandy Clay Loam", "Porous Clay"],
    typicalPH: { min: 4.5, max: 6.0, median: 5.2 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Low to Moderate",
      drainageRate: "Rapid",
      retention: "Low"
    },
    waterRetention: "Low",
    drainage: "Excessive",
    nutrientCharacteristics: {
      nitrogenStatus: "Deficient",
      phosphorusStatus: "Very Low (High P-fixation by Al/Fe)",
      potassiumStatus: "Deficient",
      organicCarbon: "Low to Moderate"
    },
    geographicDistribution: [
      "Western Ghats (Kerala, Coastal Karnataka, Goa, Maharashtra)", "Eastern Ghats", "Malwa Plateau", "Parts of Assam & Meghalaya"
    ],
    agriculturalApplications: [
      "Plantation crops (Tea, Coffee, Rubber, Arecanut, Cashew)",
      "Spices (Cardamom, Black Pepper)",
      "Acid-tolerant tuber crops (Tapioca)"
    ],
    suitableCropsSummary: [
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Suitable with Improvements", explanation: "Needs liming (calcium carbonate) to raise pH above 5.8 and heavy organic manuring." },
      { cropName: "Tomato", scientificName: "Solanum lycopersicum", category: "Vegetable", suitabilityLevel: "Suitable with Improvements", explanation: "Requires soil amendment with agricultural lime or dolomite to mitigate acid injury." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Suitable", explanation: "Tolerates slightly acidic conditions (pH 5.2-6.0) with rock phosphate application." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Requires terracing, liming, and slow-release nitrogen fertilizers in valley basins." }
    ],
    referenceSources: [
      { title: "Laterite Soils of India: Characterisation and Classification", organization: "ICAR-IISWC", year: 2016 },
      { title: "NBSS&LUP Soil Bulletin 104", organization: "NBSS&LUP", year: 2018 }
    ]
  },
  {
    name: "Sandy Soil",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    classification: "Entisols (Psamments)",
    shortDescription: "Dominated by quartz sand grains (>85%) with very low clay; characterized by rapid percolation and low fertility.",
    characteristics: [
      "Light textured, loose, gritty, and non-cohesive",
      "Very low nutrient adsorption capacity (low CEC)",
      "Warms rapidly during the day and cools quickly at night",
      "High aeration but minimal capillary water storage"
    ],
    texture: ["Coarse Sand", "Fine Sand", "Loamy Sand"],
    typicalPH: { min: 6.8, max: 8.5, median: 7.5 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very Low",
      drainageRate: "Extremely Rapid",
      retention: "Very Low"
    },
    waterRetention: "Very Low",
    drainage: "Excessive",
    nutrientCharacteristics: {
      nitrogenStatus: "Critically Low",
      phosphorusStatus: "Low",
      potassiumStatus: "Low to Moderate",
      organicCarbon: "Negligible (< 0.2%)"
    },
    geographicDistribution: [
      "Western Rajasthan", "Southern Haryana", "South-Western Punjab", "Coastal sand bars across India"
    ],
    agriculturalApplications: [
      "Drought-hardy millets (Bajra)",
      "Deep-rooted pulses (Moth bean, Cluster bean)",
      "Groundnut under drip fertigation",
      "Cucurbits in riverbed farming"
    ],
    suitableCropsSummary: [
      { cropName: "Groundnut", scientificName: "Arachis hypogaea", category: "Oilseed", suitabilityLevel: "Suitable with Improvements", explanation: "Easy pegging, but requires frequent light drip irrigations and gypsum application." },
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable with Improvements", explanation: "Requires sprinkler irrigation and frequent split doses of nitrogen to avoid leaching." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Suitable with Improvements", explanation: "Allows uniform tuber growth without deformation, but demands heavy organic mulching." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Not Recommended", explanation: "Extreme percolation prevents water puddling; economically unviable." }
    ],
    referenceSources: [
      { title: "Arid Zone Soils: Management and Conservation", organization: "ICAR-CAZRI Jodhpur", year: 2019 }
    ]
  },
  {
    name: "Clay Soil",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
    classification: "Vertisols / Inceptisols",
    shortDescription: "Dense, fine-textured soil (>40% clay) with high cohesive strength, significant plasticity and high moisture retention.",
    characteristics: [
      "Very fine mineral particles with micro-porosity",
      "High cation exchange capacity and nutrient-holding ability",
      "Poor aeration and slow percolation; high risk of waterlogging",
      "Forms hard clods upon drying, making tillage difficult"
    ],
    texture: ["Heavy Clay", "Silty Clay", "Sandy Clay"],
    typicalPH: { min: 7.0, max: 8.5, median: 7.6 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Extremely High",
      drainageRate: "Very Slow",
      retention: "Extremely High"
    },
    waterRetention: "Very High",
    drainage: "Poor",
    nutrientCharacteristics: {
      nitrogenStatus: "Low to Medium",
      phosphorusStatus: "Medium",
      potassiumStatus: "High",
      organicCarbon: "Medium (0.5% - 0.8%)"
    },
    geographicDistribution: [
      "River deltas of Godavari and Krishna", "Parts of Lower Gangetic Plain", "Narmada Valley", "Deccan depression zones"
    ],
    agriculturalApplications: [
      "Puddle paddy (Rice) culture",
      "Sugarcane cultivation",
      "Aquaculture / Fish pond dykes"
    ],
    suitableCropsSummary: [
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Impermeable clay layer preserves standing puddle water necessary for wetland rice." },
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Suitable", explanation: "Sustains high water demand through prolonged summer intervals." },
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Requires engineered drainage channels to prevent root asphyxiation during crown root initiation." },
      { cropName: "Groundnut", scientificName: "Arachis hypogaea", category: "Oilseed", suitabilityLevel: "Not Recommended", explanation: "Dense compacted clay prevents gynophore peg penetration and causes pod rot." }
    ],
    referenceSources: [
      { title: "Soil Physical Environments and Crop Growth", organization: "ICAR-IISS Bhopal", year: 2017 }
    ]
  },
  {
    name: "Loamy Soil",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d69104a47?auto=format&fit=crop&w=600&q=80",
    classification: "Mollisols / Inceptisols",
    shortDescription: "The ideal agronomic balance of sand (40%), silt (40%), and clay (20%) offering optimal drainage, aeration, and moisture holding.",
    characteristics: [
      "Crumb / granular structure with high biological activity",
      "Equally balanced macro and micro pore distribution",
      "Optimal balance between moisture retention and excess water drainage",
      "Easy to till and maintain good seedbed tilth across seasons"
    ],
    texture: ["Loam", "Silt Loam", "Sandy Clay Loam"],
    typicalPH: { min: 6.0, max: 7.5, median: 6.8 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Optimal / High",
      drainageRate: "Ideal",
      retention: "Optimal"
    },
    waterRetention: "Optimal",
    drainage: "Well-drained",
    nutrientCharacteristics: {
      nitrogenStatus: "Medium",
      phosphorusStatus: "Medium to High",
      potassiumStatus: "Adequate",
      organicCarbon: "Good (0.6% - 1.2%)"
    },
    geographicDistribution: [
      "Indo-Gangetic floodplains", "Piedmont alluvial plains", "Kashmir Valley", "Plateau valleys across Central and South India"
    ],
    agriculturalApplications: [
      "Universal arable farming",
      "Commercial vegetables and cash crops",
      "Intensive grain and pulse rotations",
      "High-value horticulture"
    ],
    suitableCropsSummary: [
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Balanced porosity ensures healthy root crown ventilation and optimal nutrient uptake." },
      { cropName: "Maize", scientificName: "Zea mays", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Rapid drainage prevents water logging while meeting peak grain filling moisture needs." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Highly Suitable", explanation: "Friable tilth allows symmetrical tuber bulking and clean harvesting." },
      { cropName: "Tomato", scientificName: "Solanum lycopersicum", category: "Vegetable", suitabilityLevel: "Highly Suitable", explanation: "Near-neutral pH and balanced moisture minimize blossom end rot and wilt." },
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Highly Suitable", explanation: "Well-aerated crumb soil optimizes rhizobial nodulation." }
    ],
    referenceSources: [
      { title: "Principles of Soil Science", organization: "ICAR & Indian Society of Soil Science", year: 2020 }
    ]
  },
  {
    name: "Mountain Soil",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    classification: "Inceptisols / Spodosols (Forest & Hill Soils)",
    shortDescription: "Formed in high-altitude forested terrains under cold to temperate climates with abundant organic litter accumulation.",
    characteristics: [
      "Rich in raw humus / organic carbon in the upper surface horizon",
      "Shallow depth with stony/gravelly subsoil horizons",
      "Moderately to strongly acidic due to organic acid leached from pine/conifer needles",
      "Subject to high soil erosion on steep slopes"
    ],
    texture: ["Silty Loam", "Gravelly Loam", "Sandy Clay"],
    typicalPH: { min: 4.8, max: 6.2, median: 5.4 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Moderate",
      drainageRate: "Fast on slopes",
      retention: "Moderate"
    },
    waterRetention: "Moderate",
    drainage: "Good",
    nutrientCharacteristics: {
      nitrogenStatus: "High (organic form)",
      phosphorusStatus: "Low to Deficient",
      potassiumStatus: "Medium",
      organicCarbon: "Very High (1.5% - 3.5%)"
    },
    geographicDistribution: [
      "Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Sikkim", "Arunachal Pradesh", "Nilgiri Hills"
    ],
    agriculturalApplications: [
      "Temperate fruit orchards (Apple, Pear, Peach, Walnut)",
      "Terraced barley, maize, and buckwheat",
      "Tea plantations in Himalayan foothills",
      "Off-season temperate vegetables"
    ],
    suitableCropsSummary: [
      { cropName: "Barley", scientificName: "Hordeum vulgare", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Cold hardy and tolerates marginal mountain slope soils." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Highly Suitable", explanation: "High organic matter and cool soil temperatures produce excellent seed potatoes." },
      { cropName: "Maize", scientificName: "Zea mays", category: "Cereal", suitabilityLevel: "Suitable", explanation: "Standard staple on terraced slopes during summer months." },
      { cropName: "Cotton", scientificName: "Gossypium hirsutum", category: "Fiber Crop", suitabilityLevel: "Not Recommended", explanation: "Low thermal units and acidic terrain prevent cotton boll formation." }
    ],
    referenceSources: [
      { title: "Soils of the Western Himalayan Region", organization: "ICAR-IISWC Dehradun", year: 2017 }
    ]
  },
  {
    name: "Desert Soil",
    image: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=600&q=80",
    classification: "Aridisols",
    shortDescription: "Formed under arid climatic regimes with extreme thermal variation; sandy, pale brown with high soluble mineral salts.",
    characteristics: [
      "Light yellow to pale reddish brown sandy particles",
      "Very low biological activity and organic carbon",
      "High concentration of soluble calcium carbonate and gypsum concretions (kankar)",
      "High thermal conductivity causing extreme daytime heating"
    ],
    texture: ["Aeolian Sand", "Fine Sand", "Loamy Sand"],
    typicalPH: { min: 7.6, max: 9.0, median: 8.3 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very Low",
      drainageRate: "Extremely Rapid",
      retention: "Negligible"
    },
    waterRetention: "Negligible",
    drainage: "Excessive",
    nutrientCharacteristics: {
      nitrogenStatus: "Critically Deficient",
      phosphorusStatus: "Low to Moderate",
      potassiumStatus: "Adequate",
      organicCarbon: "Very Low (< 0.15%)"
    },
    geographicDistribution: [
      "Thar Desert (Rajasthan)", "Rann of Kutch (Gujarat)", "South-Western borders of Punjab and Haryana"
    ],
    agriculturalApplications: [
      "Rainfed desert pulses (Guar, Moth, Bajra)",
      "Mustard and wheat under Indira Gandhi Canal Command area",
      "Drought-tolerant date palm and pomegranate"
    ],
    suitableCropsSummary: [
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable with Improvements", explanation: "Can be cultivated successfully under sprinkler or canal irrigation in winter." },
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Suitable with Improvements", explanation: "Grows well in sandy loam pockets under conserved winter moisture." },
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Yields well only under strict canal or tubewell irrigation with zinc/iron foliar sprays." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Not Recommended", explanation: "Percolation losses exceed 80%; ecologically unsuitable." }
    ],
    referenceSources: [
      { title: "Management of Arid Soils of India", organization: "ICAR-CAZRI", year: 2020 }
    ]
  },
  {
    name: "Saline and Alkaline Soil",
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    classification: "Salids / Orthids (Usar / Reh / Kallar)",
    shortDescription: "Formed in poorly drained, arid/semi-arid regions with high water table or over-irrigation, leading to toxic salt accumulation.",
    characteristics: [
      "White salt crust encrustation on surface (Solonchak / Reh)",
      "High exchangeable sodium percentage (ESP > 15%) in alkaline variants (Usar)",
      "Severely dispersed soil particles causing structural breakdown and water impermeability",
      "Osmotic stress inhibits water absorption by plants ('physiological drought')"
    ],
    texture: ["Silty Clay", "Loam with kankar pan", "Sandy Loam"],
    typicalPH: { min: 8.5, max: 10.2, median: 9.1 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Moderate",
      drainageRate: "Extremely Slow / Impervious",
      retention: "Trapped / Stagnant"
    },
    waterRetention: "Stagnant",
    drainage: "Very Poor",
    nutrientCharacteristics: {
      nitrogenStatus: "Severely Deficient",
      phosphorusStatus: "Deficient / Chemically Bound",
      potassiumStatus: "High but imbalanced",
      organicCarbon: "Negligible (< 0.2%)"
    },
    geographicDistribution: [
      "Canal commands of Uttar Pradesh, Punjab & Haryana", "Coastal Rann of Kutch", "Sundarbans delta (West Bengal)", "Thanjavur delta (Tamil Nadu)"
    ],
    agriculturalApplications: [
      "Salt-tolerant crops (Barley, Sugarbeet, specific salt-tolerant paddy varieties like CSR-36)",
      "Agroforestry (Acacia nilotica, Prosopis juliflora)",
      "Reclamation required before standard cropping"
    ],
    suitableCropsSummary: [
      { cropName: "Barley", scientificName: "Hordeum vulgare", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Possesses highest salinity tolerance among cereals; needs gypsum application if ESP > 15." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Continuous submergence leaches salts downward; salt-tolerant varieties (CSR-30/36) recommended." },
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable with Improvements", explanation: "Tolerates moderate salinity (up to 4 dS/m); requires organic green manuring with Dhaincha." },
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Not Recommended", explanation: "Highly sensitive to chloride/sulfate salinity; suffers complete seedling mortality." }
    ],
    referenceSources: [
      { title: "Diagnosis and Improvement of Saline and Alkali Soils", organization: "ICAR-CSSRI Karnal", year: 2019 }
    ]
  },
  {
    name: "Peaty and Organic Soil",
    image: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80",
    classification: "Histosols (Kari Soils of Kerala)",
    shortDescription: "Formed in humid regions with dense vegetation where submerged anaerobic conditions prevent complete organic decomposition.",
    characteristics: [
      "Black or dark brownish colour with heavy, spongy feel",
      "Contains 20% to 50% organic matter / humus by dry weight",
      "Often contains soluble ferrous salts and free iron sulfides",
      "Highly acidic with intense sulfur oxidation upon drainage"
    ],
    texture: ["Peaty Clay", "Heavy Organic Loam", "Muck"],
    typicalPH: { min: 3.5, max: 5.5, median: 4.2 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very High",
      drainageRate: "Poor to Waterlogged",
      retention: "Very High"
    },
    waterRetention: "Very High",
    drainage: "Waterlogged",
    nutrientCharacteristics: {
      nitrogenStatus: "High (organic form)",
      phosphorusStatus: "Critically Deficient",
      potassiumStatus: "Deficient",
      organicCarbon: "Extremely High (3.0% - 10.0%)"
    },
    geographicDistribution: [
      "Kuttanad region of Kerala (Kari soils)", "Sundarbans (West Bengal)", "Alappuzha & Kottayam districts", "Parts of Odisha & coastal Tamil Nadu"
    ],
    agriculturalApplications: [
      "Specialized wetland paddy (Pokkali / Kuttanad below-sea-level farming)",
      "Deep water drainage aquaculture",
      "Limed organic vegetable beds"
    ],
    suitableCropsSummary: [
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Traditional salt and acid tolerant varieties (Pokkali rice) thrive under flooded conditions." },
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Suitable with Improvements", explanation: "Requires heavy liming, deep ditch drainage, and copper/zinc micro-nutrient supplementation." },
      { cropName: "Tomato", scientificName: "Solanum lycopersicum", category: "Vegetable", suitabilityLevel: "Not Recommended", explanation: "Extreme acidity (pH < 4.5) and iron toxicity induce severe wilt and root death." },
      { cropName: "Groundnut", scientificName: "Arachis hypogaea", category: "Oilseed", suitabilityLevel: "Not Recommended", explanation: "Waterlogged conditions prevent pod aeration and rot the seeds." }
    ],
    referenceSources: [
      { title: "Acid Sulfate Soils of Kerala and their Management", organization: "Kerala Agricultural University (KAU) & ICAR", year: 2018 }
    ]
  },
  {
    name: "Sub-Mountain & Terai Soil",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    classification: "Mollisols & Inceptisols (Sub-Himalayan Terai Tract)",
    shortDescription: "Formed in sub-Himalayan forest outwash zones; rich in organic humus, coarse sand, and high water tables.",
    characteristics: [
      "Dark grey to brownish loam enriched with decomposing organic matter",
      "High groundwater table with frequent seasonal artesian seepage",
      "High clay-humus complex with good ion exchange capacity",
      "Prone to water-logging during monsoon cloudbursts"
    ],
    texture: ["Silt Loam", "Sandy Clay Loam", "Fine Sandy Loam"],
    typicalPH: { min: 6.0, max: 7.5, median: 6.8 },
    moistureCharacteristics: {
      waterHoldingCapacity: "High",
      drainageRate: "Moderate",
      retention: "High"
    },
    waterRetention: "High",
    drainage: "Moderate",
    nutrientCharacteristics: {
      nitrogenStatus: "Medium to High",
      phosphorusStatus: "Medium",
      potassiumStatus: "Medium to Adequate",
      organicCarbon: "High (0.8% - 1.5%)"
    },
    geographicDistribution: [
      "Terai belt of Uttarakhand", "Northern Uttar Pradesh (Pilibhit, Lakhimpur)", "Northern Bihar", "Sub-Himalayan West Bengal (Dooars)"
    ],
    agriculturalApplications: [
      "Intensive Sugarcane cultivation",
      "Aromatic Basmati rice cropping",
      "High-yield Rabi wheat and yellow mustard"
    ],
    suitableCropsSummary: [
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Highly Suitable", explanation: "Sub-surface water table and organic rich loam support exceptional cane tonnage." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Naturally moist moisture regime supports long-duration aromatic paddy." },
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Suitable", explanation: "Produces well; requires surface drainage to avoid root hypoxia." },
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable", explanation: "Thrives on residual moisture after Kharif paddy harvest." }
    ],
    referenceSources: [
      { title: "Soils of the Terai Agro-Climatic Zone", organization: "GB Pant University of Agriculture & Technology (Pantnagar)", year: 2020 }
    ]
  },
  {
    name: "Coastal Sandy Alluvium",
    classification: "Entisols / Psamments (Maritime Coastal Littoral)",
    shortDescription: "Deposited along Indian maritime coasts by wave action and estuarine deltas; highly porous with low CEC.",
    characteristics: [
      "Light grey to buff-coloured coarse to medium marine sand",
      "Extremely low organic matter and negligible silt/clay fraction",
      "Rapid hydraulic conductivity and low capillary rise",
      "Susceptible to marine salt spray and brackish tidal ingress"
    ],
    texture: ["Coarse Sand", "Fine Marine Sand", "Sandy Loam"],
    typicalPH: { min: 6.8, max: 8.5, median: 7.4 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very Low",
      drainageRate: "Excessive",
      retention: "Very Low"
    },
    waterRetention: "Low",
    drainage: "Excessively Drained",
    nutrientCharacteristics: {
      nitrogenStatus: "Critically Deficient",
      phosphorusStatus: "Low",
      potassiumStatus: "Deficient",
      organicCarbon: "Very Low (< 0.2%)"
    },
    geographicDistribution: [
      "Coromandel Coast (Tamil Nadu, Andhra Pradesh)", "Malabar Coast (Kerala, Karnataka)", "Konkan Coast (Maharashtra, Goa)", "Odisha coastline"
    ],
    agriculturalApplications: [
      "Commercial Coconut & Cashewnut plantations",
      "Coastal sand dune Casuarina windbreaks",
      "Brackish aquaculture & coastal horticulture"
    ],
    suitableCropsSummary: [
      { cropName: "Groundnut", scientificName: "Arachis hypogaea", category: "Oilseed", suitabilityLevel: "Highly Suitable", explanation: "Loose friable sand provides effortless peg penetration and clean pod harvest." },
      { cropName: "Barley", scientificName: "Hordeum vulgare", category: "Cereal", suitabilityLevel: "Suitable with Improvements", explanation: "Moderate salt tolerance allows growth with light saline irrigation." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Not Recommended", explanation: "Excessive percolation rate prevents standing water ponding." }
    ],
    referenceSources: [
      { title: "Coastal Soil Salinity Management", organization: "ICAR-CSSRI & Coastal Agricultural Research", year: 2021 }
    ]
  },
  {
    name: "Calcareous Alluvial Soil",
    classification: "Inceptisols / Calciustepts (Lime-Rich Gangetic Plain)",
    shortDescription: "Formed in sub-humid alluvial plains with high accumulation of calcium carbonate nodules (Kankar).",
    characteristics: [
      "Light yellowish-white to pale brown calcareous silt loam",
      "Contains 10% to 35% free calcium carbonate (CaCO3)",
      "High buffering capacity against acidic inputs",
      "Prone to lime-induced iron and zinc chlorosis in sensitive crops"
    ],
    texture: ["Calcareous Loam", "Silt Loam", "Kankar Clay Loam"],
    typicalPH: { min: 7.5, max: 8.6, median: 8.1 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Medium to High",
      drainageRate: "Moderate",
      retention: "Moderate"
    },
    waterRetention: "Medium",
    drainage: "Well-drained",
    nutrientCharacteristics: {
      nitrogenStatus: "Low",
      phosphorusStatus: "Low to Fixed (Tricalcium phosphate)",
      potassiumStatus: "High to Adequate",
      organicCarbon: "Low to Medium (0.3% - 0.5%)"
    },
    geographicDistribution: [
      "North Bihar (Muzaffarpur, Samastipur, Darbhanga)", "Eastern Uttar Pradesh (Deoria, Gorakhpur)", "Gandak river command area"
    ],
    agriculturalApplications: [
      "High-sucrose Sugarcane farming",
      "Winter Maize (Rabi Makka)",
      "Pulses and oilseeds with micro-nutrient sprays"
    ],
    suitableCropsSummary: [
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Highly Suitable", explanation: "High calcium saturation enhances cane juice sucrose accumulation and stalk rigidity." },
      { cropName: "Maize", scientificName: "Zea mays", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Winter maize thrives under well-drained calcareous loams with zinc supplementation." },
      { cropName: "Wheat", scientificName: "Triticum aestivum", category: "Cereal", suitabilityLevel: "Suitable", explanation: "Produces viable yields; requires chelated iron/zinc foliar applications." }
    ],
    referenceSources: [
      { title: "Calcareous Soils of North Bihar", organization: "Dr. Rajendra Prasad Central Agricultural University (Pusa)", year: 2019 }
    ]
  },
  {
    name: "Skeletal & Rocky Soil",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    classification: "Lithosols & Entisols (Shallow Residual Uplands)",
    shortDescription: "Shallow residual soils found on weathered hill slopes, denuded plateaus, and rocky escarpments.",
    characteristics: [
      "Coarse texture with abundant gravel, quartz pebbles, and rock fragments",
      "Very shallow effective root zone (< 20 cm depth to bedrock)",
      "Extremely susceptible to sheet and rill erosion",
      "Low water storage capacity requiring soil conservation terraces"
    ],
    texture: ["Gravelly Sandy Loam", "Stony Loam", "Coarse Sandy Loam"],
    typicalPH: { min: 6.2, max: 7.4, median: 6.7 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very Low",
      drainageRate: "Very Rapid",
      retention: "Poor"
    },
    waterRetention: "Very Low",
    drainage: "Excessively Drained",
    nutrientCharacteristics: {
      nitrogenStatus: "Critically Low",
      phosphorusStatus: "Low",
      potassiumStatus: "Medium",
      organicCarbon: "Low (< 0.3%)"
    },
    geographicDistribution: [
      "Aravalli hill ranges (Rajasthan, Haryana)", "Chota Nagpur Plateau (Jharkhand)", "Vindhyan scarplands (Madhya Pradesh)", "Deccan trap ridges"
    ],
    agriculturalApplications: [
      "Drought-hardy millets (Bajra, Ragi)",
      "Agro-forestry & silvopasture (Subabul, Khejri)",
      "Soil conservation & watershed recharge zones"
    ],
    suitableCropsSummary: [
      { cropName: "Chickpea", scientificName: "Cicer arietinum", category: "Pulse", suitabilityLevel: "Suitable with Improvements", explanation: "Deep taproot can penetrate stony fissures with moisture conservation mulching." },
      { cropName: "Mustard", scientificName: "Brassica juncea", category: "Oilseed", suitabilityLevel: "Suitable with Improvements", explanation: "Viable during cool winter with light life-saving sprinkler irrigation." },
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Not Recommended", explanation: "Shallow profile and rapid drainage cannot sustain wetland rice requirements." }
    ],
    referenceSources: [
      { title: "Land Degradation Mapping of India", organization: "NBSS&LUP & National Remote Sensing Centre (ISRO)", year: 2021 }
    ]
  },
  {
    name: "Deltaic Marine Alluvium",
    image: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80",
    classification: "Salic Fluvaquents / Inceptisols (Estuarine Deltaic)",
    shortDescription: "Formed by fine riverine mud and marine sedimentation in active river deltas; highly dynamic moisture and tidal regimes.",
    characteristics: [
      "Heavy dark grey clay to silty clay with high colloidal plasticity",
      "Periodically influenced by brackish tidal creeks and saline inundation",
      "High natural fertility but constrained by drainage and salinity hazards",
      "Deep profile with high nutrient reserves"
    ],
    texture: ["Heavy Clay", "Silty Clay Loam", "Marine Mud"],
    typicalPH: { min: 6.5, max: 8.2, median: 7.3 },
    moistureCharacteristics: {
      waterHoldingCapacity: "Very High",
      drainageRate: "Slow to Imperfect",
      retention: "Very High"
    },
    waterRetention: "Very High",
    drainage: "Slow / Imperfectly Drained",
    nutrientCharacteristics: {
      nitrogenStatus: "Medium",
      phosphorusStatus: "Medium",
      potassiumStatus: "Rich to Very Rich",
      organicCarbon: "High (0.7% - 1.2%)"
    },
    geographicDistribution: [
      "Sundarbans delta (West Bengal)", "Mahanadi delta (Odisha)", "Godavari & Krishna deltas (Andhra Pradesh)", "Cauvery delta (Tamil Nadu)"
    ],
    agriculturalApplications: [
      "Salt-tolerant coastal Rice-Fish integrated systems",
      "Betelvine & commercial Coconut groves on raised bunds",
      "Boro rice cultivation under flush irrigation"
    ],
    suitableCropsSummary: [
      { cropName: "Rice", scientificName: "Oryza sativa", category: "Cereal", suitabilityLevel: "Highly Suitable", explanation: "Heavy clay maintains puddled standing water; coastal varieties show high osmotic tolerance." },
      { cropName: "Sugarcane", scientificName: "Saccharum officinarum", category: "Cash Crop", suitabilityLevel: "Suitable", explanation: "Thrives on deep nutrient-rich delta alluvium with adequate field bund drainage." },
      { cropName: "Potato", scientificName: "Solanum tuberosum", category: "Tuber", suitabilityLevel: "Not Recommended", explanation: "Dense clay crusting and poor aeration lead to tuber deformation and rot." }
    ],
    referenceSources: [
      { title: "Soils of the Sundarbans Deltaic Ecosystem", organization: "Central Soil Salinity Research Institute (Canning Town Station)", year: 2022 }
    ]
  }
];

async function seedSoilTypes() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB for Soil Types.');

    await SoilType.deleteMany({});
    console.log('[Seed] Cleared existing soil_types collection.');

    const created = await SoilType.insertMany(indianSoilTypes);
    console.log(`[Seed Success] Inserted ${created.length} Indian Soil Types with ICAR/NBSS&LUP data.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed soil types:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedSoilTypes();
}

module.exports = { indianSoilTypes, seedSoilTypes };
