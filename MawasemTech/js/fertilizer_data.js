// ============================================
// نظام الخوارزميات الدقيقة لحاسبة الأسمدة الذكية
// ============================================

// قاعدة المعرفة الشاملة للمحاصيل السعودية
const FERTILIZER_KNOWLEDGE_BASE = {

    // ========== قاعدة بيانات المحاصيل الرئيسية ==========
    CROPS: {
        // القات (Catha edulis)
        // القات (Catha edulis) - النموذج الذهبي (Golden Model)
        'qat': {
            id: 'qat_001',
            name: 'القات',
            scientificName: 'Catha edulis',
            family: 'Celastraceae',
            type: 'tree', // شجرة دائمة الخضرة

            // 1. الاحتياجات السمادية (Updated based on user research)
            // Note: Converted from g/tree (approx 1500 trees/ha) -> N: 300-600 kg/ha is too high, 
            // staying within agronomic safety limits (200-300) while allowing high intensity.
            nutrientRequirements: {
                N: { min: 200, max: 350, optimal: 250 }, // High N for vegetative growth
                P2O5: { min: 80, max: 150, optimal: 100 },
                K2O: { min: 150, max: 300, optimal: 220 }, // High K for leaf quality
                CaO: { min: 100, max: 150, optimal: 120 },
                MgO: { min: 40, max: 80, optimal: 60 },
                S: { min: 30, max: 60, optimal: 40 }
            },

            // 2. العناصر الصغرى (Critical for quality)
            micronutrients: {
                Fe: { optimal: 2000, importance: "عالية" },
                Zn: { optimal: 800, importance: "متوسطة" },
                Mn: { optimal: 800 },
                B: { optimal: 400, importance: "عالية", symptoms: "تشوه الأوراق الحديثة" },
                Cu: { optimal: 200 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: { min: 15, optimal: 25, max: 35, unit: "°C" },
                altitude: { min: 1000, optimal: "1500-2500", max: 3000, unit: "m" },
                humidity: { optimal: "60-80%" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية رملية", "بركانية", "جيدة الصرف"],
                ph: { min: 6.0, optimal: 6.5, max: 7.5 },
                salinity: { tolerance: "منخفضة", max_ec: 1.5, unit: "dS/m", note: "حساس للملوحة" }
            },

            // 5. مراحل النمو (Cycles)
            growthStages: {
                // Since Khat is harvested continuously/cyclically:
                'establishment': { name: 'التأسيس (سنة 1-2)', N: 0.2, P2O5: 0.4, K2O: 0.2 },
                'vegetative_flush': { name: 'النمو الخضري (بعد الحصاد)', N: 0.5, P2O5: 0.2, K2O: 0.3 }, // High N to rebuild canopy
                'maturation': { name: 'نضج الأوراق (قبل القطف)', N: 0.3, P2O5: 0.2, K2O: 0.5 } // High K for tenderness/quality
            },

            // 6. معلومات إضافية
            info: {
                water_requirement: "1200-1800 مم/سنة",
                yield_per_hectare: { min: 4, max: 8 }, // طن/هكتار
                plant_density: { traditional: 1000, intensive: 2500 }
            },

            correctionFactors: {
                soilType: { clay: 0.9, sandy: 1.4, loam: 1.0, volcanic: 1.0 }, // Sandy needs much more freq
                irrigation: { drip: 0.85, sprinkler: 1.0, flood: 1.4 },
                climate: { hot: 1.2, moderate: 1.0, mountain: 0.9 }
            }
        },

        // الطماطم (Solanum lycopersicum)
        // الطماطم (Solanum lycopersicum) - النموذج الذهبي (Golden Model)
        'tomato': {
            id: "tomato_001",
            name: 'الطماطم',
            scientificName: 'Solanum lycopersicum',
            family: 'Solanaceae',
            type: 'field',

            // 1. الاحتياجات السمادية (Updated to User's Golden Standard)
            nutrientRequirements: {
                N: { min: 150, max: 200, optimal: 175 },
                P2O5: { min: 80, max: 120, optimal: 100 },
                K2O: { min: 200, max: 250, optimal: 225 },
                CaO: { min: 100, max: 150, optimal: 125 }, // Estimated from agronomic norms relative to K
                MgO: { min: 40, max: 60, optimal: 50 },
                S: { min: 30, max: 50, optimal: 40 }
            },

            // 2. العناصر الصغرى (ppm or g/ha - converted to g/ha for calculation)
            micronutrients: {
                Fe: { optimal: 1500, importance: "عالية", symptoms: "اصفرار الأوراق" },
                Zn: { optimal: 400, importance: "متوسطة", symptoms: "تقزم النبات" },
                Mn: { optimal: 600 },
                B: { optimal: 250, importance: "عالية", symptoms: "موت القمة النامية" },
                Cu: { optimal: 120 }
            },

            // 3. متطلبات المناخ (Climate)
            climate_requirements: {
                temperature: {
                    germination: { min: 15, optimal: 25, max: 35, unit: "°C" },
                    vegetative: { min: 18, optimal: 24, max: 30, unit: "°C" },
                    flowering: { min: 20, optimal: 25, max: 28, unit: "°C", note: "حساس جداً للصقيع" }
                },
                humidity: { optimal: "60-70%", min: 40, max: 85, note: "الرطوبة العالية تسبب الأمراض الفطرية" },
                sunlight: { hours: "6-8", intensity: "عالي" }
            },

            // 4. متطلبات التربة (Soil)
            soil_requirements: {
                preferred_types: ["طينية رملية", "طميية", "جيدة الصرف"],
                ph: { min: 5.5, optimal: 6.4, max: 7.5, note: "الحموضة العالية تسبب نقص العناصر" },
                salinity: { tolerance: "متوسطة", max_ec: 2.5, unit: "dS/m" },
                organic_matter: { min: 2.0, optimal: 3.5, unit: "%" }
            },

            // 5. متطلبات المياه (Water)
            water_requirements: {
                total_seasonal: { min: 4000, optimal: 7000, max: 10000, unit: "m3/ha" }, // Converted from mm (400-1000mm)
                irrigation_methods: { drip: 0.90, sprinkler: 0.75, flood: 0.50 },
                critical_stages: ["التزهير", "تكوين الثمار", "تضخم الثمار"]
            },

            // 6. مراحل النمو (Stages)
            growthStages: {
                'seedling': { name: 'الإنبات والشتل', duration: 20, N: 0.1, P2O5: 0.2, K2O: 0.1 },
                'vegetative': { name: 'النمو الخضري', duration: 30, N: 0.3, P2O5: 0.2, K2O: 0.2 },
                'flowering': { name: 'الإزهار والعقد', duration: 25, N: 0.2, P2O5: 0.3, K2O: 0.3 },
                'fruiting': { name: 'نضج الثمار', duration: 45, N: 0.4, P2O5: 0.3, K2O: 0.4 }
            },

            // 7. معلومات إضافية (Yield, Density)
            info: {
                yield_per_hectare: { open: { min: 40, max: 60 }, greenhouse: { min: 80, max: 120 } },
                plant_density: { open: { min: 15000, max: 20000 }, greenhouse: { min: 25000, max: 30000 } }
            },

            // 8. بيانات البذور (New for Phase 8)
            seedInfo: {
                TGW: 3.5, // 3-4g per 1000 seeds
                germinationStandard: 90,
                purityStandard: 99
            },

            correctionFactors: {
                soilType: { clay: 0.95, sandy: 1.2, loam: 1.0 },
                irrigation: { drip: 0.8, sprinkler: 1.0, flood: 1.3 },
                climate: { hot: 1.1, moderate: 1.0, coastal: 0.95, mountain: 0.92 }
            }
        },

        // القمح (Triticum aestivum) - النموذج الذهبي (Golden Model)
        'wheat': {
            id: 'wheat_001',
            name: 'القمح (البر)',
            scientificName: 'Triticum aestivum',
            family: 'Poaceae',
            type: 'field', // محصول حقلي

            // 1. الاحتياجات السمادية (Updated to User's High Yield Target: 7-8 ton/ha)
            nutrientRequirements: {
                N: { min: 180, max: 280, optimal: 220 }, // High N for protein and yield
                P2O5: { min: 80, max: 120, optimal: 100 },
                K2O: { min: 60, max: 100, optimal: 80 }, // User data suggests lower K relative to Veg
                CaO: { min: 20, max: 40, optimal: 30 },  // Secondary
                MgO: { min: 15, max: 30, optimal: 20 },
                S: { min: 20, max: 40, optimal: 30 }     // Critical for protein
            },

            // 2. العناصر الصغرى (Converted to g/ha based on User's kg/ha data)
            micronutrients: {
                Fe: { optimal: 3000, importance: "متوسطة" }, // Iron isn't majorly highlighted but standard
                Zn: { optimal: 3500, importance: "عالية جداً", symptoms: "تبقع الأوراق، تقزم" }, // User: 2-5 kg/ha
                Mn: { optimal: 3000, importance: "عالية", symptoms: "تبقع بين العروق" }, // User: 2-4 kg/ha
                B: { optimal: 1000, importance: "عالية", symptoms: "عقم الأزهار، حبوب مجوفة" }, // User: 0.5-1.5 kg/ha
                Cu: { optimal: 500 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    germination: { min: 4, optimal: 20, max: 30, unit: "°C" },
                    vegetative: { min: 15, optimal: 18, max: 25, unit: "°C", note: "تتحمل البرودة" },
                    reproductive: { min: 18, optimal: 22, max: 28, unit: "°C", note: "الحرارة العالية (30+) تضر الحبوب" }
                },
                humidity: { optimal: "50-70%", note: "الرطوبة العالية تزيد خطر الصدأ" },
                season: "شتوي (Winter)"
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية طينية", "طميية رملية"],
                ph: { min: 6.0, optimal: 6.8, max: 7.5, note: "حساس للحموضة العالية والتسمم بالألمنيوم" },
                salinity: { tolerance: "متوسطة", max_ec: 6.0, unit: "dS/m", note: "تتحمل الملوحة نسبياً (خسارة 50% عند 6dS/m)" },
                drainage: "جيد"
            },

            // 5. مراحل النمو (Stages based on User's Irrigation/Fert Schedule)
            growthStages: {
                'establishment': { name: 'التأسيس والإنبات (25 يوم)', N: 0.20, P2O5: 0.60, K2O: 0.30, note: "إضافة كامل الفسفور وجزء من النيتروجين" },
                'tillering': { name: 'التبويش (25-45 يوم)', N: 0.30, P2O5: 0.20, K2O: 0.30, note: "مرحلة حرجة للنيتروجين لتكوين الأشطاء" },
                'elongation': { name: 'الاستطالة (45-70 يوم)', N: 0.40, P2O5: 0.10, K2O: 0.20, note: "أقصى احتياج مائي وغذائي" },
                'heading_flowering': { name: 'التزهير (70-95 يوم)', N: 0.10, P2O5: 0.10, K2O: 0.20, note: "رش عناصر صغرى (بورون/زنك)" },
                'grain_filling': { name: 'تكوين الحبوب (95-120 يوم)', N: 0.0, P2O5: 0.0, K2O: 0.0, note: "توقف التسميد، استمرار الري الخفيف" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { rainfed: { min: 2, max: 4 }, irrigated: { min: 5, max: 8 } },
                water_requirement: "4500-6500 مم/موسم", // 450-650 mm
                planting_date: "أكتوبر - نوفمبر",
                harvest_sign: "رطوبة الحبوب < 15%، اصفرار كامل"
            },

            correctionFactors: {
                soilType: { clay: 1.0, sandy: 1.3, loam: 1.0 }, // Sandy soils need more N splitting
                irrigation: { drip: 0.9, sprinkler: 1.0, flood: 1.25, rainfed: 1.0 },
                climate: { hot: 1.15, moderate: 1.0, cold: 1.0 }
            }
        },

        // البطاطس (Solanum tuberosum)
        // البطاطس (Solanum tuberosum) - Golden Model
        'potato': {
            name: 'البطاطس',
            scientificName: 'Solanum tuberosum',
            family: 'Solanaceae',
            type: 'field',

            // احتياجات سمادية لإنتاجية عالية (45-60 طن/هكتار)
            nutrientRequirements: {
                N: { min: 180, max: 220, optimal: 200 },
                P2O5: { min: 100, max: 150, optimal: 130 },
                K2O: { min: 200, max: 250, optimal: 240 },
                CaO: { min: 50, max: 80, optimal: 60 },
                MgO: { min: 25, max: 45, optimal: 35 },
                S: { min: 25, max: 45, optimal: 35 }
            },

            growthStages: {
                // 1. الزراعة والإنبات (Basal): إرساء قوي للجذور
                'planting': { N: 0.20, P2O5: 0.50, K2O: 0.20, CaO: 0.30, MgO: 0.20, S: 0.20 },

                // 2. النمو الخضري (Vegetative): بناء المجموع الخضري
                'vegetative': { N: 0.40, P2O5: 0.20, K2O: 0.20, CaO: 0.30, MgO: 0.40, S: 0.30 },

                // 3. بداية التدرين (Tuber Initiation): مرحلة حرجة
                'tuber_initiation': { N: 0.20, P2O5: 0.20, K2O: 0.20, CaO: 0.20, MgO: 0.20, S: 0.20 },

                // 4. تحجيم الدرنات (Bulking): أقصى احتياج للبوتاسيوم
                'tuber_bulking': { N: 0.20, P2O5: 0.10, K2O: 0.40, CaO: 0.20, MgO: 0.20, S: 0.30 },

                // 5. النضج (Maturation): صيانة فقط
                'maturation': { N: 0.05, P2O5: 0.0, K2O: 0.0, CaO: 0.0, MgO: 0.0, S: 0.0 }
            },

            micronutrients: {
                Fe: { optimal: 1000 },
                Zn: { optimal: 2500, importance: "عالية جداً", application: "مع الأسمدة الأساسية" }, // 2-3 kg/ha
                Mn: { optimal: 1000 },
                B: { optimal: 1500, importance: "عالية", symptoms: "جوف في الدرنات" }, // 1.5 kg/ha
                Cu: { optimal: 300 }
            },

            info: {
                pH_range: [5.5, 6.5],
                salinity_tolerance: 1.7,
                yield_per_hectare: { min: 30, max: 60 },
                water_requirement: "600-800 مم"
            },

            climate_requirements: {
                optimal_temp: { day: 22, night: 14 }
            }
        },
        // الحمضيات (Citrus)
        'citrus': {
            name: 'الحمضيات',
            scientificName: 'Citrus',
            family: 'Rutaceae',
            type: 'tree',
            nutrientRequirements: { N: { optimal: 200 }, P2O5: { optimal: 60 }, K2O: { optimal: 200 }, CaO: { optimal: 150 }, MgO: { optimal: 60 }, S: { optimal: 40 } },
            growthStages: {
                // Dormancy: Low maintenance for all
                'dormancy': { N: 0.1, P2O5: 0.1, K2O: 0.1, CaO: 0.1, MgO: 0.1, S: 0.1 },
                // Vegetative: High N, moderate others
                'vegetative': { N: 0.3, P2O5: 0.2, K2O: 0.2, CaO: 0.3, MgO: 0.3, S: 0.3 },
                // Flowering: High P, moderate others
                'flowering': { N: 0.2, P2O5: 0.3, K2O: 0.3, CaO: 0.3, MgO: 0.2, S: 0.2 },
                // Fruit: High K/Ca for quality
                'fruit_development': { N: 0.4, P2O5: 0.4, K2O: 0.4, CaO: 0.3, MgO: 0.4, S: 0.4 }
            },
            info: { pH_range: [6.0, 7.5], salinity_tolerance: 1.7, yield_per_hectare: { min: 30, max: 60 } }
        },

        // العنب (Vitis vinifera) - النموذج الذهبي (Golden Model)
        'grape': {
            id: 'grape_001',
            name: 'العنب',
            scientificName: 'Vitis vinifera',
            family: 'Vitaceae',
            type: 'tree', // كرمة معمرة

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: Yield 15-25 ton/ha. Removal per ton: 2-3kg N, 0.5-0.8kg P, 3-4kg K
            nutrientRequirements: {
                N: { min: 80, max: 150, optimal: 120 }, // Moderate N to avoid excessive vegetative growth
                P2O5: { min: 40, max: 80, optimal: 60 },
                K2O: { min: 100, max: 180, optimal: 150 }, // High K for sugar accumulation and wood maturity
                CaO: { min: 60, max: 100, optimal: 80 },
                MgO: { min: 20, max: 40, optimal: 30 }, // Important for photosynthesis
                S: { min: 15, max: 30, optimal: 25 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 4000, importance: "عالية جداً", symptoms: "أوراق صغيرة (Little leaf)، ضعف العقد" }, // 3-5 kg/ha
                B: { optimal: 1500, importance: "حرجة", symptoms: "موت القمم، عقم الأزهار (Hen and Chicken)" }, // 1-2 kg/ha
                Fe: { optimal: 6000, importance: "عالية", symptoms: "اصفرار في الأراضي الجيرية" }, // 5-10 kg/ha
                Mg: { optimal: 30000, importance: "متوسطة", symptoms: "اصفرار العروق القاعدية" }, // Treated as macro usually, but noted here for emphasis
                Cu: { optimal: 500 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 25, max: 35, unit: "°C" },
                    dormancy: { min: 0, max: 10, unit: "°C", note: "تحتاج ساعات برودة (200-400 ساعة) لكسر السكون" }
                },
                humidity: { optimal: "50-70%", note: "الرطوبة العالية تزيد البياض الدقيقي والزغبي" },
                sunlight: { hours: "8-10", intensity: "عالية", note: "الضوء ضروري لتلوين الثمار وتركيز السكر" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية رملية", "حصوية", "جيدة الصرف"],
                ph: { min: 5.5, optimal: 6.5, max: 7.5, note: "الحموضة 6.0-7.5 هي الأنسب. القلوية تسبب نقص حديد." },
                salinity: { tolerance: "متوسطة", max_ec: 2.0, unit: "dS/m", note: "تتحمل حتى 4 dS/m مع أصول مقاومة." },
                drainage: "ممتاز (حساسة للغدق، تحتاج عمق > 1.5م)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'bud_break': { name: 'تفتح البراعم (الربيع)', N: 0.30, P2O5: 0.50, K2O: 0.20, note: "تحفيز النمو الأولي" },
                'flowering_set': { name: 'التزهير والعقد', N: 0.20, P2O5: 0.30, K2O: 0.20, note: "إيقاف النيتروجين الزائد لمنع تساقط الأزهار (Coulure)" },
                'veraison': { name: 'التحول اللوني (Veraison)', N: 0.0, P2O5: 0.10, K2O: 0.50, note: "بوتاسيوم عالي جداً للنقل وزيادة السكر. لا نيتروجين." },
                'post_harvest': { name: 'بعد الحصاد (التخزين)', N: 0.20, P2O5: 0.10, K2O: 0.10, note: "تخزين الغذاء في القصبات للموسم القادم" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 10, max: 30 }, // Table grapes vs Wine vs Raisin
                water_requirement: "600-800 مم/موسم", // Efficient water user
                density_trees_ha: { normal: 1500, intensive: 3000 },
                harvest_sign: "نسبة السكر (Brix 16-20%)، طعم، لون"
            },

            correctionFactors: {
                soilType: { clay: 0.85, sandy: 1.15, gravelly: 1.0 }, // Gravelly soil is good for grapes
                irrigation: { drip: 0.9, flood: 1.3 },
                climate: { arid: 1.1, temperate: 1.0 }
            }
        },

        // الذرة (Zea mays) - النموذج الذهبي (Golden Model)
        'corn': {
            id: 'corn_001',
            name: 'الذرة',
            scientificName: 'Zea mays',
            family: 'Poaceae',
            type: 'field', // محاصيل حقلية

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: High Yield (8-12 ton/ha grain, 40-60 ton/ha silage)
            nutrientRequirements: {
                N: { min: 180, max: 300, optimal: 250 }, // High N is the key driver for yield
                P2O5: { min: 60, max: 120, optimal: 90 },
                K2O: { min: 100, max: 250, optimal: 180 }, // Important for stalk strength and filling
                CaO: { min: 30, max: 80, optimal: 50 },
                MgO: { min: 20, max: 60, optimal: 40 },
                S: { min: 20, max: 50, optimal: 30 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 1500, importance: "حرجة جداً", symptoms: "خطوط بيضاء عريضة على الأوراق (White Bud)" }, // Most critical micronutrient for Corn
                Fe: { optimal: 1000, importance: "متوسطة", symptoms: "اصفرار بين العروق في الأراضي الجيرية" },
                Mn: { optimal: 500 },
                B: { optimal: 300 },
                Cu: { optimal: 300 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 20, max: 35, unit: "°C" },
                    note: "محصول صيفي محب للحرارة. الصقيع يقتل النبات فوراً."
                },
                humidity: { optimal: "40-70%", note: "الجفاف وقت التزهير (Tasseling) يدمر العقد." },
                sunlight: { hours: "full", intensity: "عالية", note: "نبات C4 عالي الكفاءة الضوئية." }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طينية", "طميية", "خصبة"],
                ph: { min: 5.5, optimal: 6.5, max: 7.5, note: "يتحمل الحموضة المتوسطة." },
                salinity: { tolerance: "متوسطة", max_ec: 1.7, unit: "dS/m", note: "تأثر الإنتاج يبدأ عند 1.7 dS/m." },
                drainage: "جيد (حساس للغدق في المراحل الأولى)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'الإنبات والنمو المبكر (V1-V5)', N: 0.15, P2O5: 0.50, K2O: 0.10, note: "تركيز الفوسفور والزنك" },
                'vegetative_rapid': { name: 'النمو الخضري السريع (V6-VT)', N: 0.60, P2O5: 0.20, K2O: 0.30, note: "أعلى احتياج للنيتروجين (يحدد حجم العرنوس)" },
                'reproductive': { name: 'التزهير والحريرة (R1)', N: 0.15, P2O5: 0.10, K2O: 0.40, note: "حساس جداً لنقص الماء والبوتاسيوم" },
                'grain_filling': { name: 'ملء الحبوب (R2-R6)', N: 0.10, P2O5: 0.20, K2O: 0.20, note: "انتقال المخزون للحبوب" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 6, max: 14 }, // Grain yield
                water_requirement: "500-800 مم/موسم",
                density_trees_ha: { normal: 60000, intensive: 80000 },
                harvest_sign: "ظهور الطبقة السوداء (Black Layer) في الحبوب"
            },

            correctionFactors: {
                soilType: { clay: 0.9, sandy: 1.25, loam: 1.0 },
                irrigation: { drip: 0.9, pivot: 1.0, furrow: 1.3 }, // Pivot is common for corn
                climate: { arid: 1.2, temperate: 1.0 }
            }
        },

        // الرمان
        'pomegranate': {
            name: 'الرمان',
            type: 'tree',
            nutrientRequirements: { N: { optimal: 140 }, P2O5: { optimal: 60 }, K2O: { optimal: 120 }, S: { optimal: 20 } },
            info: { yield_per_hectare: { min: 15, max: 30 } }
        },

        // القطن (Gossypium hirsutum) - النموذج الذهبي (Golden Model)
        'cotton': {
            id: 'cotton_001',
            name: 'القطن',
            scientificName: 'Gossypium hirsutum',
            family: 'Malvaceae',
            type: 'field', // محصول حقلي (ألياف)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: Yield 3-5 ton/ha seed cotton.
            nutrientRequirements: {
                N: { min: 150, max: 250, optimal: 200 }, // Supports vegetative growth but excess delays maturity
                P2O5: { min: 60, max: 100, optimal: 80 }, // Crucial for early root growth and fruiting
                K2O: { min: 80, max: 180, optimal: 120 }, // Essential for fiber strenght and micronaire
                CaO: { min: 40, max: 80, optimal: 60 },
                MgO: { min: 20, max: 50, optimal: 35 },
                S: { min: 20, max: 40, optimal: 30 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 2500, importance: "عالية جداً", symptoms: "الأوراق الصغيرة (Little Leaf)، تأخر النضج" }, // Zinc deficiency is common in cotton
                B: { optimal: 1200, importance: "عالية", symptoms: "موت البراعم الطرفية، فشل اللوز" }, // Critical for pollen/boll retention
                Fe: { optimal: 1000 },
                Mn: { optimal: 800 },
                Cu: { optimal: 300 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 25, max: 35, unit: "°C" },
                    germination: { min: 18, optimal: 25, note: "توقف النمو عند أقل من 15°C" }
                },
                humidity: { optimal: "50-70%", note: "يحتاج جو جاف وقت تفتح اللوز لتجنب عفن اللوز" },
                sunlight: { hours: "full", intensity: "عالية", note: "محصول محب للشمس" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طينية", "طميية ثقيلة", "خصبة"],
                ph: { min: 6.0, optimal: 7.0, max: 8.0, note: "يتحمل القلوية المتوسطة" },
                salinity: { tolerance: "عالية", max_ec: 7.0, unit: "dS/m", note: "من أكثر المحاصيل تحملاً للملوحة (يتحمل حتى 7.7 dS/m دون نقص كبير)" },
                drainage: "جيد"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'الإنبات والبادرات (أول 30 يوم)', N: 0.20, P2O5: 0.50, K2O: 0.10, note: "تركيز الفوسفور للجذور" },
                'squaring': { name: 'تكوين الوسواس/البراعم (Squaring)', N: 0.30, P2O5: 0.20, K2O: 0.20, note: "بداية الاحتياج العالي للنيتروجين" },
                'flowering': { name: 'التزهير وعقد اللوز', N: 0.30, P2O5: 0.20, K2O: 0.40, note: "بوتاسيوم عالي لجودة التيلة. تجنب زيادة النيتروجين المفرطة." },
                'boll_opening': { name: 'تفتح اللوز', N: 0.0, P2O5: 0.0, K2O: 0.0, note: "إيقاف الري والتسميد لتحفيز النضج" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 2, max: 6 }, // Seed cotton
                water_requirement: "700-1200 مم/موسم",
                density_trees_ha: { normal: 60000, intensive: 100000 }, // Plants/ha
                harvest_sign: "تفتح 60-70% من اللوز"
            },

            correctionFactors: {
                soilType: { clay: 1.0, sandy: 1.3, loam: 1.0 },
                irrigation: { drip: 0.9, furrow: 1.25, flood: 1.4 },
                climate: { arid: 1.1, humid: 1.0 }
            }
        },

        // المانجو (Mangifera indica) - النموذج الذهبي (Golden Model)
        'mango': {
            id: 'mango_001',
            name: 'المانجو',
            scientificName: 'Mangifera indica',
            family: 'Anacardiaceae',
            type: 'tree', // شجرة دائمة الخضرة

            // 1. الاحتياجات السمادية (Updated based on User's detailed rates)
            // Basis: Mature trees (100-200 trees/ha), 600-1000g N/tree -> approx 100-200 kg N/ha
            nutrientRequirements: {
                N: { min: 100, max: 200, optimal: 150 },
                P2O5: { min: 50, max: 100, optimal: 80 }, // 300-500g/tree -> approx 50-80kg/ha
                K2O: { min: 100, max: 200, optimal: 160 }, // 600-1000g/tree -> High demand for fruit quality
                CaO: { min: 60, max: 100, optimal: 80 },  // 0.5-0.8 kg removal/ton
                MgO: { min: 30, max: 60, optimal: 45 },   // 0.2-0.3 kg removal/ton
                S: { min: 20, max: 40, optimal: 30 }
            },

            // 2. العناصر الصغرى (Converted to g/ha)
            micronutrients: {
                Fe: { optimal: 1500, importance: "عالية", symptoms: "اصفرار عروقي في الأوراق الحديثة" }, // 5-10g/tree
                Zn: { optimal: 1000, importance: "عالية جداً", symptoms: "أوراق صغيرة (Little Leaf)، تقزم" }, // 2-5g/tree
                Mn: { optimal: 800 },
                B: { optimal: 400, importance: "عالية", symptoms: "تشوه الثمار، موت القمم النامية" }, // 1-2g/tree
                Cu: { optimal: 300, importance: "متوسطة", symptoms: "موت الأطراف" } // 1-3g/tree
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 24, max: 30, unit: "°C" },
                    flowering: { min: 20, max: 25, note: "تحتاج فترة جفاف وبرودة نسبية (10-15م) للتحريض الزهري" },
                    survival: { min: 0, max: 48, note: "حساسة جداً للصقيع" }
                },
                humidity: { optimal: "50-70%", note: "الرطوبة العالية وقت التزهير تقلل العقد وتزيد الأمراض" },
                sunlight: { hours: "8-10", intensity: "عالية" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية رملية", "طميية", "عميقة جيدة الصرف"],
                ph: { min: 5.5, optimal: 6.5, max: 7.5, note: "الأراضي القلوية تسبب نقص الحديد والزنك" },
                salinity: { tolerance: "منخفضة", max_ec: 2.0, unit: "dS/m", note: "حساسة للكلورايد والصوديوم" },
                drainage: "ممتاز (حساسة جداً للغدق)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'post_harvest': { name: 'بعد الحصاد/النمو الخضري (أغسطس-أكتوبر)', N: 0.20, P2O5: 0.20, K2O: 0.10, note: "تسميد لتعويض الفاقد وتشجيع نمو خضري جديد" },
                'dormancy_induction': { name: 'السكون/التحريض الزهري (نوفمبر-يناير)', N: 0.0, P2O5: 0.30, K2O: 0.20, note: "تقليل الري، إيقاف النيتروجين" },
                'flowering_fruit_set': { name: 'التزهير والعقد (فبراير-مارس)', N: 0.20, P2O5: 0.30, K2O: 0.20, note: "ثبات ري، رش عناصر صغرى (بورون/زنك)" },
                'fruit_development': { name: 'تحجيم الثمار (أبريل-يونيو)', N: 0.40, P2O5: 0.20, K2O: 0.30, note: "زيادة النيتروجين والبوتاسيوم" },
                'maturation': { name: 'النضج (يونيو-يوليو)', N: 0.20, P2O5: 0.0, K2O: 0.20, note: "إيقاف التسميد قبل الحصاد بأسابيع" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 10, max: 30 }, // 10-30 ton/ha
                water_requirement: "900-1500 مم/سنة",
                density_trees_ha: { normal: 100, intensive: 400 },
                harvest_sign: "امتلاء الأكتاف، تغير اللون"
            },

            correctionFactors: {
                soilType: { clay: 0.9, sandy: 1.3, loam: 1.0 },
                irrigation: { drip: 0.9, sprinkler: 1.1, flood: 1.4 }, // Drip is recommended
                climate: { hot: 1.2, moderate: 1.0, coastal: 0.95 }
            }
        },

        // البن (Coffea spp.) - النموذج الذهبي (Golden Model)
        'coffee': {
            id: 'coffee_001',
            name: 'البن (القهوة)',
            scientificName: 'Coffea arabica / Coffea canephora',
            family: 'Rubiaceae',
            type: 'tree', // شجيرة دائمة الخضرة

            // 1. الاحتياجات السمادية (Updated based on User's detailed rates)
            // Basis: Medium Yield (2-3 ton/ha green coffee) -> N: 150-200, P: 100-130, K: 150-200 kg/ha
            nutrientRequirements: {
                N: { min: 120, max: 250, optimal: 180 }, // Wide range for variable yields
                P2O5: { min: 80, max: 150, optimal: 115 },
                K2O: { min: 120, max: 250, optimal: 180 }, // Crucial for bean filling
                CaO: { min: 50, max: 100, optimal: 70 },
                MgO: { min: 30, max: 60, optimal: 40 },
                S: { min: 20, max: 50, optimal: 35 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 3000, importance: "عالية جداً", symptoms: "أوراق صغيرة (Rosetting)، تبقع" }, // 2-5 kg/ha applied
                B: { optimal: 1500, importance: "حرجة", symptoms: "موت القمم، تشوه الثمار (Crinkled leaves)" }, // 1-2 kg/ha
                Fe: { optimal: 1000, importance: "متوسطة", symptoms: "اصفرار في الأراضي القلوية" },
                Cu: { optimal: 2000, importance: "عالية", symptoms: "أوراق صفراء، ضعف عام" }, // 1-3 kg/ha applied
                Mn: { optimal: 800 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 15, max: 28, unit: "°C" }, // Averaging Arabica/Robusta
                    note: "العربي (15-24)، الروبوستا (22-30). حساس للصقيع."
                },
                humidity: { optimal: "70-85%", note: "رطوبة عالية مطلوبة، مع تهوية لتجنب الصدأ" },
                sunlight: { hours: "Filtered", note: "يفضل الظل (30-50%) خاصة للعربي لتحسين الجودة" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["بركانية", "عميقة جيدة الصرف", "طميية"],
                ph: { min: 4.5, optimal: 5.5, max: 6.5, note: "تفضل التربة الحامضية. القلوية تسبب مشاكل." },
                salinity: { tolerance: "منخفضة جداً", max_ec: 1.0, unit: "dS/m", note: "حساسة للملوحة في جميع المراحل (1.0 dS/m حد أقصى)" },
                drainage: "ممتاز (حساسة لأعفان الجذور)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'flower_induction': { name: 'التحريض الزهري (موسم الجفاف)', N: 0.10, P2O5: 0.40, K2O: 0.20, note: "تقليل الري (تعطيش) لمدة 2-3 أشهر" },
                'flowering': { name: 'التزهير وبداية العقد (أول المطر)', N: 0.30, P2O5: 0.30, K2O: 0.20, note: "ري غزير بعد الجفاف لتحفيز التزهير (Blossom Showers)" },
                'fruit_development': { name: 'تطور الثمار (موسم الأمطار)', N: 0.40, P2O5: 0.20, K2O: 0.40, note: "احتياج عالي للنيتروجين والبوتاسيوم لملء الحبوب" },
                'maturation': { name: 'النضج والحصاد (نهاية الأمطار)', N: 0.20, P2O5: 0.10, K2O: 0.20, note: "تقليل النيتروجين، الحفاظ على البوتاسيوم" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 0.5, max: 4 }, // 0.5-4 tons green coffee/ha
                water_requirement: "1200-2500 مم/سنة",
                density_trees_ha: { normal: 1500, intensive: 4000 },
                harvest_sign: "ثمار حمراء كاملة (كرز)"
            },

            correctionFactors: {
                soilType: { clay: 0.8, sandy: 1.2, volcanic: 1.0 },
                irrigation: { drip: 0.9, rainfed: 1.2, sprinkler: 1.0 },
                climate: { high_altitude: 0.9, low_altitude: 1.1 }
            }
        },

        // الرمان (Punica granatum) - النموذج الذهبي (Golden Model)
        'pomegranate': {
            id: 'pomegranate_001',
            name: 'الرمان',
            scientificName: 'Punica granatum',
            family: 'Punicaceae',
            type: 'tree', // شجرة نفضية

            // 1. الاحتياجات السمادية (Updated based on User's detailed rates)
            // Basis: Mature trees (approx 400-600 trees/ha), 500-800g N/tree -> approx 200-400 kg N/ha
            nutrientRequirements: {
                N: { min: 150, max: 300, optimal: 240 },
                P2O5: { min: 80, max: 200, optimal: 150 }, // 300-500g/tree
                K2O: { min: 150, max: 300, optimal: 240 }, // 500-800g/tree -> Vital for quality
                CaO: { min: 100, max: 200, optimal: 150 }, // Critical for preventing cracking
                MgO: { min: 40, max: 80, optimal: 60 },
                S: { min: 30, max: 60, optimal: 45 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 2000, importance: "عالية", symptoms: "أوراق مبقعة، صغر الثمار" },
                B: { optimal: 1500, importance: "حرجة", symptoms: "تشقق الثمار، تعفن القلب" },
                Fe: { optimal: 2000, importance: "متوسطة", symptoms: "اصفرار في التربة الجيرية" },
                Mn: { optimal: 1000 },
                Cu: { optimal: 500 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 25, max: 35, unit: "°C" },
                    note: "يحتاج صيف حار طويل للنضج. يتحمل الحرارة حتى 45°C."
                },
                humidity: { optimal: "40-60%", note: "الجفاف النسبي أفضل لتقليل الأمراض الفطرية وتشقق الثمار" },
                sunlight: { hours: "8-10", intensity: "عالية", note: "تلوين الثمار يعتمد على الإضاءة الجيدة" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية", "طميية رملية", "جيدة الصرف"],
                ph: { min: 6.0, optimal: 7.5, max: 8.5, note: "يتحمل القلوية والملوحة بشكل جيد" },
                salinity: { tolerance: "عالية نسبياً", max_ec: 6.0, unit: "dS/m", note: "يتحمل حتى 8 dS/m مع انخفاض في الإنتاجية" },
                drainage: "جيد (يتحمل الغدق المؤقت فقط)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'dormancy': { name: 'السكون (الشتاء)', N: 0.0, P2O5: 0.0, K2O: 0.0, note: "ري متباعد جداً، خدمة شتوية" },
                'vegetative_flowering': { name: 'النمو وتزهير (الربيع)', N: 0.40, P2O5: 0.50, K2O: 0.20, note: "دفعة نيتروجين وفوسفور قوية للنمو الجديد" },
                'fruit_growth': { name: 'نمو الثمار (الصيف)', N: 0.40, P2O5: 0.20, K2O: 0.40, note: "بوتاسيوم وكالسيوم لتحجيم الثمار ومنع التشقق" },
                'maturation': { name: 'النضج (نهاية الصيف/الخريف)', N: 0.20, P2O5: 0.30, K2O: 0.40, note: "تقليل النيتروجين، ضبط الري لمنع التشقق" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 15, max: 40 }, // 15-40 ton/ha
                water_requirement: "800-1200 مم/سنة",
                density_trees_ha: { normal: 400, intensive: 800 },
                harvest_sign: "صوت معدني عند النقر، لون القشرة"
            },

            correctionFactors: {
                soilType: { clay: 0.9, sandy: 1.2, calcareous: 1.1 }, // Calcareous is common for Pomegranate
                irrigation: { drip: 0.9, flood: 1.3, sprinkler: 1.1 },
                climate: { hot: 1.1, moderate: 1.0, moist: 0.9 }
            }
        },

        // نخيل التمر (Phoenix dactylifera) - النموذج الذهبي (Golden Model)
        'date_palm': {
            id: 'date_palm_001',
            name: 'نخيل التمر',
            scientificName: 'Phoenix dactylifera',
            family: 'Arecaceae',
            type: 'tree', // شجرة دائمة الخضرة

            // 1. الاحتياجات السمادية (Golden Standard for Gulf Region)
            // Basis: Mature trees (100-120 trees/ha), 1.5-3 kg N/tree -> approx 150-300 kg N/ha
            nutrientRequirements: {
                N: { min: 150, max: 350, optimal: 250 }, // High N needed for vegetative growth & yield
                P2O5: { min: 60, max: 150, optimal: 100 }, // 0.5-1.0 kg/tree
                K2O: { min: 200, max: 450, optimal: 300 }, // 2.0-4.0 kg/tree -> Vital for fruit quality & sugar
                CaO: { min: 100, max: 200, optimal: 150 },
                MgO: { min: 50, max: 100, optimal: 80 },
                S: { min: 40, max: 80, optimal: 60 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                B: { optimal: 2000, importance: "حرجة جداً", symptoms: "فشل العقد (Sheesan)، تشوه الثمار" }, // Critical for pollination
                Zn: { optimal: 2500, importance: "عالية", symptoms: "أوراق صغيرة، ضعف النمو" },
                Fe: { optimal: 3000, importance: "متوسطة", symptoms: "اصفرار في القلب (الجمارة)" },
                Cu: { optimal: 1000 },
                Mn: { optimal: 1500 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 30, max: 45, unit: "°C" },
                    note: "يحتاج وحدات حرارية عالية (3000-4000) للنضج. يتحمل حتى 50°C."
                },
                humidity: { optimal: "30-50%", note: "رطوبة منخفضة وقت النضج لتجنب الوشم (Blacknose) وتساقط الثمار" },
                sunlight: { hours: "10-12", intensity: "عالية جداً", note: "محصول شمسي بامتياز" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["رملية", "طميية رملية", "جيرية"],
                ph: { min: 7.0, optimal: 7.8, max: 8.5, note: "متأقلم مع التربة القلوية والجيرية" },
                salinity: { tolerance: "عالية جداً", max_ec: 8.0, unit: "dS/m", note: "يتحمل حتى 12 dS/m ولكن يقل الإنتاج و جودة الثمار" },
                drainage: "جيد (يتحمل الغدق أكثر من غيره لكن الصرف يحسن النمو)"
            },

            // 5. مراحل النمو (Phenology - Arabic Stages)
            growthStages: {
                'pollination': { name: 'التلقيح (فبراير-مارس)', N: 0.20, P2O5: 0.40, K2O: 0.10, note: "التركيز على الفوسفور والبورون لنجاح العقد" },
                'kimri': { name: 'الكمري (أبريل-يونيو)', N: 0.40, P2O5: 0.20, K2O: 0.20, note: "مرحلة النمو السريع (الخضراء)، أعلى احتياج للنيتروجين" },
                'khalal': { name: 'الخلال/البسر (يوليو-أغسطس)', N: 0.30, P2O5: 0.10, K2O: 0.40, note: "تلون الثمار، زيادة البوتاسيوم لتحسين السكر والصلابة" },
                'rutab_tamr': { name: 'الرطب والتمر (أغسطس-أكتوبر)', N: 0.0, P2O5: 0.0, K2O: 0.20, note: "إيقاف النيتروجين، تقليل الري، بوتاسيوم فقط للتحجيم النهائي" },
                'post_harvest': { name: 'الخدمة الشتوية (نوفمبر-يناير)', N: 0.10, P2O5: 0.30, K2O: 0.10, note: "إضافة السماد العضوي والسوبر فوسفات" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 5, max: 15 }, // 50-150 kg/tree depending on variety/care
                water_requirement: "15000-25000 م3/هكتار", // High water consumer
                density_trees_ha: { normal: 100, intensive: 200 },
                harvest_sign: "تحول اللون، ليونة (رطب)، أو جفاف (تمر)"
            },

            correctionFactors: {
                soilType: { sandy: 1.2, calcareous: 1.0, clay: 0.9 },
                irrigation: { drip: 0.8, flood: 1.4, sprinkler: 1.2 }, // Flood is common but wasteful
                climate: { arid: 1.1, humid: 1.0 } // Arid increases water needs
            }
        },

        // الفلفل (Capsicum annuum) - النموذج الذهبي (Golden Model)
        'pepper': {
            id: 'pepper_001',
            name: 'الفلفل',
            scientificName: 'Capsicum annuum',
            family: 'Solanaceae',
            type: 'vegetable', // خضروات (حولية)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: High Yield (40-60 ton/ha open field, up to 100+ greenhouse)
            nutrientRequirements: {
                N: { min: 180, max: 300, optimal: 240 }, // High N for continuous growth
                P2O5: { min: 80, max: 150, optimal: 120 },
                K2O: { min: 200, max: 400, optimal: 300 }, // Very High K for fruit quality & wall thickness
                CaO: { min: 100, max: 200, optimal: 150 }, // Critical to prevent Blossom End Rot
                MgO: { min: 40, max: 80, optimal: 60 },
                S: { min: 30, max: 60, optimal: 40 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Fe: { optimal: 1500, importance: "متوسطة", symptoms: "اصفرار الأوراق الحديثة" },
                Zn: { optimal: 1000, importance: "عالية", symptoms: "صغر حجم الأوراق، تشوه الثمار" },
                B: { optimal: 1000, importance: "حرجة", symptoms: "تساقط الأزهار، تشوه الثمار" },
                Mn: { optimal: 800 },
                Cu: { optimal: 500 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 20, max: 30, unit: "°C" },
                    note: "حساس للبرودة (أقل من 10°C يتوقف النمو). سقوط الأزهار عند الحرارة العالية (>35°C)."
                },
                humidity: { optimal: "50-70%", note: "رطوبة معتدلة. الرطوبة العالية تزيد الأمراض الفطرية." },
                sunlight: { hours: "6-8", intensity: "المباشرة", note: "يحتاج ضوء كافٍ للإزهار الجيد" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية", "رملية طميية"],
                ph: { min: 5.5, optimal: 6.5, max: 7.0, note: "حساس للحموضة العالية والملوحة" },
                salinity: { tolerance: "متوسطة الحساسية", max_ec: 2.5, unit: "dS/m", note: "عتبة النقص تبدأ من 1.5 dS/m" },
                drainage: "ممتاز (حساس جداً لأعفان الجذور)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'التأسيس والنمو الخضري', N: 0.20, P2O5: 0.50, K2O: 0.20, note: "عالي الفوسفور للجذور" },
                'flowering': { name: 'التزهير وبداية العقد', N: 0.30, P2O5: 0.30, K2O: 0.30, note: "توازن NPK، إضافة الكالسيوم والبورون" },
                'fruit_growth': { name: 'نمو وتطور الثمار', N: 0.40, P2O5: 0.10, K2O: 0.40, note: "عالي النيتروجين والبوتاسيوم للتحجيم" },
                'harvest': { name: 'الحصاد (متكرر)', N: 0.10, P2O5: 0.10, K2O: 0.10, note: "جرعات صيانة لتعويض الفاقد" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 20, max: 80 },
                water_requirement: "400-600 مم/موسم",
                density_trees_ha: { normal: 20000, intensive: 30000 },
                harvest_sign: "وصول الحجم واللون المناسب للصنف"
            },

            correctionFactors: {
                soilType: { clay: 0.85, sandy: 1.15, loam: 1.0 },
                irrigation: { drip: 0.85, furrow: 1.3, sprinkler: 1.1 },
                climate: { greenhouse: 1.0, open_field: 1.2 }
            }
        },

        // البامية (Abelmoschus esculentus) - النموذج الذهبي (Golden Model)
        'okra': {
            id: 'okra_001',
            name: 'البامية',
            scientificName: 'Abelmoschus esculentus',
            family: 'Malvaceae',
            type: 'vegetable', // خضروات (حولية)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: Yield 15-25 ton/ha.
            nutrientRequirements: {
                N: { min: 100, max: 180, optimal: 140 }, // Moderate N
                P2O5: { min: 50, max: 100, optimal: 70 },
                K2O: { min: 100, max: 200, optimal: 150 }, // Critical for pod quality
                CaO: { min: 60, max: 120, optimal: 90 },
                MgO: { min: 25, max: 50, optimal: 35 },
                S: { min: 20, max: 40, optimal: 30 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 1000, importance: "عالية", symptoms: "تبقع الأوراق، تقزم" },
                B: { optimal: 600, importance: "عالية", symptoms: "تشوه الثمار" },
                Fe: { optimal: 1000, importance: "متوسطة" },
                Mn: { optimal: 500 },
                Cu: { optimal: 200 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 25, max: 35, unit: "°C" },
                    note: "محصول استوائي/صيفي محب للحرارة. يتوقف النمو في الطقس البارد."
                },
                humidity: { optimal: "50-70%", note: "تتحمل الرطوبة، لكن التهوية الجيدة ضرورية." },
                sunlight: { hours: "old_full", intensity: "عالية", note: "لا تتحمل الظل." }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية", "خصبة", "جيدة الصرف"],
                ph: { min: 6.0, optimal: 6.5, max: 7.5, note: "تتحمل نطاق واسع من الـ pH." },
                salinity: { tolerance: "متوسطة", max_ec: 4.0, unit: "dS/m", note: "تتحمل الملوحة بشكل جيد نسبياً (حتى 4 dS/m مع انخفاض مقبول)" },
                drainage: "جيد (الغدق يسبب تساقط الأزهار والقرون)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'التأسيس (3-4 أسابيع)', N: 0.20, P2O5: 0.50, K2O: 0.20, note: "تعزيز الجذور" },
                'vegetative': { name: 'النمو الخضري', N: 0.40, P2O5: 0.20, K2O: 0.20, note: "بناء الهيكل النباتي" },
                'flowering_fruiting': { name: 'الإزهار والإثمار', N: 0.30, P2O5: 0.20, K2O: 0.50, note: "دفعات بوتاسيوم لجودة القرون" },
                'harvest': { name: 'الحصاد المتكرر', N: 0.10, P2O5: 0.10, K2O: 0.10, note: "جرعات تنشيطية بعد كل جمعة" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 10, max: 25 },
                water_requirement: "450-650 مم/موسم",
                density_trees_ha: { normal: 40000, intensive: 60000 },
                harvest_sign: "قرون غضة (3-5 أيام من التزهير)"
            },

            correctionFactors: {
                soilType: { clay: 1.0, sandy: 1.2, loam: 1.0 },
                irrigation: { drip: 0.9, furrow: 1.3 },
                climate: { arid: 1.1, humid: 1.0 }
            }
        },

        // القمح (Triticum aestivum) - النموذج الذهبي (Golden Model)
        'wheat': {
            id: 'wheat_001',
            name: 'القمح',
            scientificName: 'Triticum aestivum',
            family: 'Poaceae',
            type: 'cereal', // محصول حبوب (حولي)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: High Yield (6-8 ton/ha)
            nutrientRequirements: {
                N: { min: 120, max: 200, optimal: 160 }, // High N for tillering and grain filling
                P2O5: { min: 60, max: 100, optimal: 80 },
                K2O: { min: 80, max: 150, optimal: 120 },
                S: { min: 20, max: 40, optimal: 30 },
                CaO: { min: 30, max: 60, optimal: 45 },
                MgO: { min: 15, max: 30, optimal: 20 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Zn: { optimal: 1000, importance: "عالية", symptoms: "تقزم، اصفرار الأوراق السفلية" },
                Mn: { optimal: 800, importance: "متوسطة", symptoms: "تبقع بني، اصفرار بين العروق" },
                Cu: { optimal: 500, importance: "عالية", symptoms: "تأخر الإزهار، ضعف امتلاء السنابل" },
                Fe: { optimal: 1500, importance: "متوسطة" },
                B: { optimal: 300 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 15, max: 25, unit: "°C" },
                    note: "محصول شتوي. يحتاج فترة برودة (vernalization) لبعض الأصناف. حساس للحرارة العالية وقت امتلاء الحبوب."
                },
                humidity: { optimal: "60-80%", note: "رطوبة معتدلة. الرطوبة العالية تزيد الأمراض الفطرية." },
                sunlight: { hours: "8-10", intensity: "عالية", note: "يحتاج ضوء كافٍ للتمثيل الضوئي" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية", "طميية طينية", "رملية طميية"],
                ph: { min: 6.0, optimal: 6.5, max: 7.5, note: "يفضل التربة المتعادلة إلى القلوية قليلاً." },
                salinity: { tolerance: "متوسطة", max_ec: 6.0, unit: "dS/m", note: "يتحمل الملوحة أفضل من معظم المحاصيل الحقلية." },
                drainage: "جيد (حساس للغدق)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'tillering': { name: 'التفريع', N: 0.30, P2O5: 0.40, K2O: 0.20, note: "نيتروجين وفوسفور لتشجيع التفريع" },
                'stem_elongation': { name: 'استطالة الساق', N: 0.40, P2O5: 0.20, K2O: 0.30, note: "نيتروجين لدفع النمو الخضري" },
                'heading_flowering': { name: 'طرد السنابل والتزهير', N: 0.20, P2O5: 0.20, K2O: 0.30, note: "بوتاسيوم لدعم التزهير" },
                'grain_filling': { name: 'امتلاء الحبوب', N: 0.10, P2O5: 0.20, K2O: 0.20, note: "بوتاسيوم ونيتروجين لزيادة وزن الحبة" }
            },

            // 6. معلومات إضافية (Yield, Density)
            info: {
                yield_per_hectare: { min: 4, max: 7 }, // ton/ha
                plant_density: { min: 300, max: 400, unit: "plants/m2" } // 300-400 plants/m2
            },

            // 7. بيانات البذور (New for Phase 8)
            seedInfo: {
                TGW: 45, // 40-50g per 1000 grains
                germinationStandard: 95,
                purityStandard: 99
            },

            correctionFactors: {
                soilType: { clay: 1.0, sandy: 1.2, loam: 1.0 },
                irrigation: { pivot: 1.0, flood: 1.3 },
                climate: { cool: 1.0, hot: 1.1 }
            }
        },

        // الكوسا (Cucurbita pepo) - النموذج الذهبي (Golden Model)
        'zucchini': {
            id: 'zucchini_001',
            name: 'الكوسا',
            scientificName: 'Cucurbita pepo',
            family: 'Cucurbitaceae',
            type: 'vegetable', // خضروات (حولية)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: Yield 30-50 ton/ha open field, up to 100 greenhouse
            nutrientRequirements: {
                N: { min: 150, max: 250, optimal: 200 }, // High vegetative growth rate
                P2O5: { min: 80, max: 150, optimal: 100 },
                K2O: { min: 200, max: 350, optimal: 250 }, // High K for fruit quality
                CaO: { min: 80, max: 150, optimal: 100 },
                MgO: { min: 30, max: 60, optimal: 45 },
                S: { min: 20, max: 50, optimal: 30 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Fe: { optimal: 1500, importance: "متوسطة" },
                Mn: { optimal: 800, importance: "عالية", symptoms: "تبقع الأوراق، اصفرار" },
                Zn: { optimal: 600, importance: "متوسطة" },
                B: { optimal: 500, importance: "عالية", symptoms: "تشوه الثمار، موت القمم" },
                Cu: { optimal: 300 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 20, max: 30, unit: "°C" },
                    note: "محصول صيفي. يتلف بالصقيع. التزهير يتأثر بأكثر من 35°C."
                },
                humidity: { optimal: "60-80%", note: "رطوبة معتدلة." },
                sunlight: { hours: "8-10", intensity: "عالية", note: "تحتاج إضاءة جيدة لمنع تساقط الأزهار" }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية رملية", "طميية", "خصبة"],
                ph: { min: 6.0, optimal: 6.8, max: 7.5, note: "تفضل التربة المتعادلة" },
                salinity: { tolerance: "متوسطة", max_ec: 3.0, unit: "dS/m", note: "تتحمل الملوحة أكثر من الخيار (حتى 3 dS/m)" },
                drainage: "ممتاز (حساسة للغدق)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'التأسيس والنمو الخضري', N: 0.20, P2O5: 0.50, K2O: 0.20, note: "تشجيع الجذور والنمو الأولي" },
                'flowering': { name: 'بداية التزهير', N: 0.30, P2O5: 0.20, K2O: 0.30, note: "توازن لتشجيع العقد" },
                'harvest': { name: 'الإثمار والحصاد المستمر', N: 0.40, P2O5: 0.10, K2O: 0.50, note: "دفعات بوتاسيوم ونيتروجين مستمرة مع كل جمعة" },
                'late_season': { name: 'نهاية الموسم', N: 0.10, P2O5: 0.10, K2O: 0.10, note: "تقليل الكميات" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 25, max: 80 },
                water_requirement: "400-600 مم/موسم", // Short cycle
                density_trees_ha: { normal: 10000, intensive: 20000 },
                harvest_sign: "حجم مناسب (قبل اكتمال النضج البذري)"
            },

            correctionFactors: {
                soilType: { clay: 0.9, sandy: 1.25, loam: 1.0 },
                irrigation: { drip: 0.9, furrow: 1.3 },
                climate: { greenhouse: 1.0, open_field: 1.2 }
            }
        },

        // الخيار (Cucumis sativus) - النموذج الذهبي (Golden Model)
        'cucumber': {
            id: 'cucumber_001',
            name: 'الخيار',
            scientificName: 'Cucumis sativus',
            family: 'Cucurbitaceae',
            type: 'vegetable', // خضروات (حولية)

            // 1. الاحتياجات السمادية (Golden Standard)
            // Basis: High Yield (40-60 ton/ha open field, 150+ greenhouse)
            nutrientRequirements: {
                N: { min: 200, max: 400, optimal: 300 }, // High N for rapid vegetative growth
                P2O5: { min: 90, max: 180, optimal: 130 },
                K2O: { min: 250, max: 500, optimal: 350 }, // Very High K for fruit quality & disease resistance
                CaO: { min: 120, max: 250, optimal: 180 }, // Critical for fruit firmness
                MgO: { min: 50, max: 100, optimal: 70 },
                S: { min: 30, max: 60, optimal: 40 }
            },

            // 2. العناصر الصغرى (g/ha)
            micronutrients: {
                Fe: { optimal: 2000, importance: "عالية", symptoms: "اصفرار بين العروق في الأوراق الحديثة" },
                Mn: { optimal: 1500, importance: "عالية", symptoms: "تبقع بني، اصفرار" }, // Cucumber is sensitive to Mn deficiency
                Zn: { optimal: 800, importance: "متوسطة", symptoms: "تقزم، تشوه الأوراق" },
                B: { optimal: 600, importance: "متوسطة", symptoms: "تشوه الثمار (C-shape)" }, // Sensitive to Boron toxicity too
                Cu: { optimal: 400 }
            },

            // 3. متطلبات المناخ
            climate_requirements: {
                temperature: {
                    optimal: { min: 22, max: 30, unit: "°C" },
                    note: "محصول صيفي. يتوقف النمو أقل من 12°C. الحرارة العالية (>35°C) تسبب ثمار مرة ومشوهة."
                },
                humidity: { optimal: "60-80%", note: "يحب الرطوبة العالية. الجفاف يسبب الإجهاد السريع." },
                sunlight: { hours: "8-10", intensity: "عالية/متوسطة", note: "تحمل الظل الجزئي أفضل من غيره." }
            },

            // 4. متطلبات التربة
            soil_requirements: {
                preferred_types: ["طميية غنية بالمواد العضوية", "خفيفة"],
                ph: { min: 6.0, optimal: 6.8, max: 7.5, note: "يفضل التربة المتعادلة." },
                salinity: { tolerance: "حساس جداً", max_ec: 2.0, unit: "dS/m", note: "أي زيادة عن 2.0 dS/m تسبب خسارة كبيرة في المحصول." },
                drainage: "ممتاز (جذوره سطحية حساسة للاختناق)"
            },

            // 5. مراحل النمو (Phenology)
            growthStages: {
                'establishment': { name: 'التأسيس (أول أسبوعين)', N: 0.20, P2O5: 0.50, K2O: 0.20, note: "تحفيز الجذور (فوسفور عالي)" },
                'vegetative': { name: 'النمو الخضري السريع', N: 0.50, P2O5: 0.20, K2O: 0.30, note: "نيتروجين عالي لبناء المجموع الخضري" },
                'flowering_fruiting': { name: 'التزهير والإثمار (مستمر)', N: 0.30, P2O5: 0.20, K2O: 0.50, note: "بوتاسيوم عالي جداً للإنتاج المستمر" },
                'late_season': { name: 'نهاية الموسم', N: 0.10, P2O5: 0.10, K2O: 0.10, note: "تقليل التسميد تدريجياً" }
            },

            // 6. معلومات إضافية
            info: {
                yield_per_hectare: { min: 30, max: 150 }, // Huge range due to greenhouse tech
                water_requirement: "300-500 مم/موسم",
                density_trees_ha: { normal: 20000, intensive: 35000 },
                harvest_sign: "الحجم التسويقي (يجمع يومياً أو يوم بعد يوم)"
            },

            correctionFactors: {
                soilType: { clay: 0.8, sandy: 1.2, organic: 0.9 },
                irrigation: { drip: 0.9, furrow: 1.4 }, // Drip is standard for cucumber
                climate: { greenhouse: 1.0, open_field: 1.3 } // Open field needs more resources
            }
        }
    },

    // ========== قاعدة بيانات الأسمدة ==========
    FERTILIZERS: {
        'urea': {
            name: 'يوريا', formula: 'CO(NH2)2', grade: '46-0-0',
            composition: { N: 46, P2O5: 0, K2O: 0 }, solubility: 1080, pH_effect: 'حمضي',
            efficiency: { drip: 0.70, sprinkler: 0.60, flood: 0.45, foliar: 0.85 },
            price_per_kg: 2.5, incompatibilities: ['superphosphate', 'calcium_compounds']
        },
        'ammonium_sulfate': {
            name: 'كبريتات أمونيوم', formula: '(NH4)2SO4', grade: '21-0-0-24S',
            composition: { N: 21, P2O5: 0, K2O: 0, S: 24 }, solubility: 754, pH_effect: 'حمضي قوي',
            efficiency: { drip: 0.65, sprinkler: 0.60, flood: 0.50, foliar: 0.80 },
            price_per_kg: 2.2, incompatibilities: ['calcium_nitrate']
        },
        'superphosphate': {
            name: 'سوبر فوسفات أحادي', formula: 'Ca(H2PO4)2', grade: '0-20-0-12S-20Ca',
            composition: { N: 0, P2O5: 20, K2O: 0, S: 12, Ca: 20 }, solubility: 25, pH_effect: 'حمضي',
            efficiency: { basal: 0.20, top_dress: 0.15 }, price_per_kg: 3.0,
            incompatibilities: ['urea', 'ammonium_nitrate']
        },
        'dap': {
            name: 'دي أمونيوم فوسفات', formula: '(NH4)2HPO4', grade: '18-46-0',
            composition: { N: 18, P2O5: 46, K2O: 0 }, solubility: 588, pH_effect: 'قلوي',
            efficiency: { drip: 0.30, sprinkler: 0.25, flood: 0.18 }, price_per_kg: 3.5
        },
        'potassium_sulfate': {
            name: 'كبريتات بوتاسيوم', formula: 'K2SO4', grade: '0-0-50-18S',
            composition: { N: 0, P2O5: 0, K2O: 50, S: 18 }, solubility: 120, pH_effect: 'محايد',
            efficiency: { drip: 0.75, sprinkler: 0.70, flood: 0.60, foliar: 0.85 }, price_per_kg: 4.0
        },
        'potassium_chloride': {
            name: 'كلوريد بوتاسيوم', formula: 'KCl', grade: '0-0-60',
            composition: { N: 0, P2O5: 0, K2O: 60, Cl: 47 }, solubility: 347, pH_effect: 'محايد',
            efficiency: { drip: 0.70, sprinkler: 0.65, flood: 0.55 }, price_per_kg: 3.2, chloride_sensitive: true
        },
        'npk_20_20_20': {
            name: 'سماد مركب 20-20-20', grade: '20-20-20',
            composition: { N: 20, P2O5: 20, K2O: 20 }, solubility: 200,
            efficiency: { drip: 0.65, sprinkler: 0.60, flood: 0.45 }, price_per_kg: 4.5
        }
    },

    // ========== عوامل تصحيح عالمية ==========
    CORRECTION_FACTORS: {

        // عوامل كفاءة الامتصاص حسب نوع التربة
        SOIL_EFFICIENCY: {
            clay: { N: 0.6, P: 0.15, K: 0.5 },
            sandy: { N: 0.6, P: 0.5, K: 0.6 }, // Relaxed from { N: 0.5, P: 0.1, K: 0.4 } to enable logical results
            loam: { N: 0.65, P: 0.20, K: 0.55 },
            clay_loam: { N: 0.62, P: 0.18, K: 0.52 },
            sandy_loam: { N: 0.55, P: 0.12, K: 0.45 }
        },

        // عوامل حسب درجة الحموضة (pH)
        PH_FACTORS: {
            N: { 4.5: 0.3, 5.0: 0.5, 5.5: 0.7, 6.0: 0.9, 6.5: 1.0, 7.0: 0.95, 7.5: 0.85, 8.0: 0.6, 8.5: 0.4, 9.0: 0.2 },
            P: { 4.5: 0.2, 5.0: 0.4, 5.5: 0.7, 6.0: 0.9, 6.5: 1.0, 7.0: 0.8, 7.5: 0.5, 8.0: 0.3, 8.5: 0.2, 9.0: 0.1 },
            K: { 4.5: 0.8, 5.0: 0.85, 5.5: 0.9, 6.0: 0.95, 6.5: 1.0, 7.0: 0.95, 7.5: 0.9, 8.0: 0.85, 8.5: 0.8, 9.0: 0.7 }
        },

        // عوامل حسب المادة العضوية (%)
        ORGANIC_MATTER_FACTOR: {
            0: { N: 0.5, P: 0.3, K: 0.4 },
            1: { N: 0.6, P: 0.4, K: 0.5 },
            2: { N: 0.7, P: 0.5, K: 0.6 },
            3: { N: 0.8, P: 0.6, K: 0.7 },
            4: { N: 0.9, P: 0.7, K: 0.8 },
            5: { N: 1.0, P: 0.8, K: 0.9 }
        },

        // عوامل عمر الشجرة (جديد)
        AGE_FACTORS: {
            '1-2': 0.25, // 25% of mature need
            '3-5': 0.60, // 60% of mature need
            '5+': 1.00   // 100% full production
        },

        // عوامل حسب السعة التبادلية CEC (meq/100g)
        CEC_FACTOR: {
            5: { N: 0.5, P: 0.3, K: 0.4 },
            10: { N: 0.7, P: 0.5, K: 0.6 },
            15: { N: 0.8, P: 0.6, K: 0.7 },
            20: { N: 0.9, P: 0.7, K: 0.8 },
            25: { N: 1.0, P: 0.8, K: 0.9 },
            30: { N: 1.1, P: 0.9, K: 1.0 }
        }
    },

    // ========== معادلات التحويل ==========
    CONVERSIONS: {
        AREA: { dunam_to_hectare: 0.1, hectare_to_dunam: 10, acre_to_hectare: 0.4047, hectare_to_acre: 2.471 },
        PPM_TO_KG_HA: { depth_20cm: 2.24, depth_30cm: 3.36 },
        ELEMENT_CONVERSION: { P_to_P2O5: 2.29, P2O5_to_P: 0.436, K_to_K2O: 1.205, K2O_to_K: 0.830 }
    },

    // ========== معايير التحليل المتقدم (Advanced Standards) ==========
    ADVANCED_STANDARDS: {
        SOIL_NUTRIENTS: { // ppm thresholds (Low < low, Optimal = low..high, High > high)
            N: { low: 20, high: 60 },      // Nitrate-N estimate
            P: { low: 15, high: 40 },      // Olsen method approx
            K: { low: 150, high: 300 },
            Fe: { low: 4.5, high: 10 },
            Zn: { low: 1.0, high: 5.0 },
            Mn: { low: 2.0, high: 20 },
            B: { low: 0.5, high: 2.0 }
        },
        PH_RULES: {
            acidic: { max: 5.5, message: 'حموضة عالية قد تعيق امتصاص الفوسفور.' },
            alkaline: { min: 7.8, message: 'قلوية عالية تقلل تيسر الحديد والزنك.' }
        },
        NUTRIENT_INTERACTIONS: [ // Mulder's Chart Logic
            { source: 'K', target: 'Mg', ratio: 5, type: 'antagonism', title: 'تضاد البوتاسيوم/المغنيسيوم', message: 'مستوى البوتاسيوم مرتفع جداً مقارنة بالمغنيسيوم، مما يمنع امتصاصه.' },
            { source: 'P', target: 'Zn', ratio: 10, type: 'antagonism', title: 'تضاد الفوسفور/الزنك', message: 'ارتفاع الفوسفور قد يؤدي لترسيب الزنك ومنع الاستفادة منه.' },
            { source: 'Ca', target: 'K', ratio: 15, type: 'antagonism', title: 'تضاد الكالسيوم/البوتاسيوم', message: 'زيادة الكالسيوم (الجير) قد تعيق امتصاص البوتاسيوم.' }
        ]
    },

    // ========== عوامل الفصول (Seasonal Adjustments) ==========
    SEASONAL_RULES: {
        winter: { N: 0.8, P: 0.7, K: 1.15, description: 'الشتاء: تقليل النيتروجين (تجنب النمو الغض) وزيادة البوتاسيوم (مقاومة البرد).' },
        summer: { N: 1.0, P: 1.0, K: 1.0, description: 'الصيف: برنامج متوازن مع مراعاة الري.' },
        spring: { N: 1.1, P: 1.2, K: 1.0, description: 'الربيع: زيادة النيتروجين والفوسفور لدعم النمو الخضري والجذري.' },
        autumn: { N: 0.9, P: 1.0, K: 1.1, description: 'الخريف: التركيز على التخزين (البوتاسيوم) وتقليل النمو الخضري.' }
    },
    // ========== بيانات التربة (Soil Types) ==========
    SOIL_TYPES: {
        'sandy': { name: 'رملية', efficiencyFactor: { N: 0.6, P: 0.8, K: 0.7, S: 0.6, Ca: 0.9, Mg: 0.7 }, waterRetention: 'low' },
        'loam': { name: 'طمية', efficiencyFactor: { N: 0.8, P: 0.9, K: 0.85, S: 0.8, Ca: 0.95, Mg: 0.9 }, waterRetention: 'medium' },
        'clay': { name: 'طينية', efficiencyFactor: { N: 0.7, P: 0.6, K: 0.8, S: 0.7, Ca: 0.8, Mg: 0.9 }, waterRetention: 'high' },
        'calcareous': { name: 'جيرية', efficiencyFactor: { N: 0.7, P: 0.5, K: 0.8, S: 0.7, Ca: 1.0, Mg: 0.6 }, waterRetention: 'medium' }
    },

    // ========== الأنظمة المناخية (Climate Zones) ==========
    CLIMATE_ZONES: {
        'hot': { name: 'حار', evaporationFactor: 1.2, description: 'يحتاج ري مكثف وتسميد متكرر لتعويض الفاقد' },
        'moderate': { name: 'معتدل', evaporationFactor: 1.0, description: 'ظروف قياسية' },
        'coastal': { name: 'ساحلي', evaporationFactor: 0.9, humidity: 'high', description: 'رطوبة عالية قد تقلل النتح' },
        'mountain': { name: 'جبلي', evaporationFactor: 0.85, coldRisk: true, description: 'خطر الصقيع وتراكم الأملاح أقل' }
    }
};
